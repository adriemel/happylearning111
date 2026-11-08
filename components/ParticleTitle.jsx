"use client";

import { useEffect, useRef, useState } from "react";

// Module-level flag: survives client-side re-renders and remounts, resets only
// on a real page load (new JS context). Set once the intro has actually started.
let introPlayed = false;

const FONT_TIMEOUT_MS = 1500; // skip the intro if web fonts take longer than this
const FADE_MS = 300;

// Vortex: dots circle the word on a flattened disc and spiral in (~3.7 s).
const TRAVEL_S = 2.6; // per-dot travel time
const MAX_DELAY_S = 1.1; // latest start (outer ring starts last)
const SPIN_TURNS = 1; // extra turns on the way in; must be an integer or the word lands rotated
// The rotation finishes at this fraction of the travel; afterwards dots move
// straight inward, so the word assembles upright instead of rotated.
const SPIN_END = 0.7;

const easeInOutCubic = (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);

/**
 * One-time particle intro for a piece of hero text.
 * Expects exactly one element child (e.g. <span className="title-hub">hub</span>).
 * The child stays in the DOM; it is only hidden (opacity 0) while dots form its letters.
 */
export default function ParticleTitle({ children }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  // "pending" (SSR / before effect) → "running" → "reveal" (cross-fade) → "done"
  const [phase, setPhase] = useState(() => (introPlayed ? "done" : "pending"));

  useEffect(() => {
    if (phase !== "pending") return undefined;

    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const target = wrap?.firstElementChild;
    if (!wrap || !canvas || !target || introPlayed) {
      setPhase("done");
      return undefined;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      introPlayed = true;
      setPhase("done");
      return undefined;
    }

    let cancelled = false;
    let rafId = 0;
    let fadeTimer = 0;
    let startWidth = window.innerWidth;

    const finishNow = () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(fadeTimer);
      window.removeEventListener("resize", onResize);
      setPhase("done");
    };
    // Mobile browsers fire resize when the URL bar hides on scroll (height only);
    // end the intro only on a real width change.
    const onResize = () => {
      if (window.innerWidth !== startWidth) finishNow();
    };

    const start = async () => {
      const cs = getComputedStyle(target);
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const text = target.textContent ?? "";

      // Wait for the real font (not a fallback) before rasterizing. fonts.load()
      // can reject when a listed fallback face (next/font's local("Arial")) is
      // missing on the system; that is harmless, so only fonts.ready decides.
      const fontsOk = await Promise.race([
        document.fonts
          .load(font, text)
          .catch(() => null)
          .then(() => document.fonts.ready)
          .then(() => true, () => false),
        new Promise((r) => setTimeout(() => r(false), FONT_TIMEOUT_MS)),
      ]);
      if (cancelled) return; // e.g. React StrictMode dev unmount; flag stays unset
      introPlayed = true;
      if (!fontsOk || !text.trim()) {
        finishNow();
        return;
      }

      startWidth = window.innerWidth;
      window.addEventListener("resize", onResize);
      run(cs, font, text);
    };

    const run = (cs, font, text) => {
      const rect = target.getBoundingClientRect();
      const fontSize = parseFloat(cs.fontSize);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Offscreen raster of the text in span-local CSS px (small pad for overhangs).
      const pad = Math.ceil(rect.height * 0.3);
      const off = document.createElement("canvas");
      off.width = Math.ceil((rect.width + 2 * pad) * dpr);
      off.height = Math.ceil((rect.height + 2 * pad) * dpr);
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) {
        finishNow();
        return;
      }
      octx.scale(dpr, dpr);
      octx.font = font;
      if ("letterSpacing" in octx) octx.letterSpacing = cs.letterSpacing;
      octx.textBaseline = "alphabetic";
      octx.fillStyle = "#000";
      const m = octx.measureText(text);
      // Baseline measured in the DOM, not from canvas font metrics: WebKit
      // (iPhone/iPad Safari) reports fontBoundingBoxAscent differently from
      // Chromium, which put the dots too low there. An empty inline-block's
      // bottom edge sits exactly on the parent's baseline.
      const marker = document.createElement("span");
      marker.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      target.appendChild(marker);
      const domBaseline = marker.getBoundingClientRect().bottom - rect.top;
      marker.remove();
      const baseline = pad + domBaseline;
      octx.fillText(text, pad, baseline);
      // If canvas letter-spacing is unsupported (older Safari), the raster is
      // wider/narrower than the DOM text; stretch x to match the span width.
      const xScale = m.width > 0 && Math.abs(rect.width / m.width - 1) > 0.01 ? rect.width / m.width : 1;

      const { data, width: ow, height: oh } = octx.getImageData(0, 0, off.width, off.height);
      const step = Math.max(1, Math.round(dpr)); // ~1 sample per CSS pixel
      const points = [];
      for (let y = 0; y < oh; y += step) {
        for (let x = 0; x < ow; x += step) {
          if (data[(y * ow + x) * 4 + 3] > 128) points.push((x / dpr - pad) * xScale, y / dpr - pad);
        }
      }
      const nPoints = points.length / 2;
      if (nPoints === 0) {
        finishNow();
        return;
      }

      // Random subset of target points.
      const wanted = vw < 700 ? 400 : 800;
      const n = Math.min(wanted, nPoints);
      const idx = Array.from({ length: nPoints }, (_, i) => i);
      for (let i = 0; i < n; i++) {
        const j = i + Math.floor(Math.random() * (nPoints - i));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }

      // All coordinates are span-local CSS px; (cx, cy) is the word centre.
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const squash = 0.38; // vertical flattening of the vortex disc
      // Start radius: outside the word, moderately scaled to the viewport.
      const rMin = Math.max(rect.width * 0.75, 90);
      const rMax = Math.max(rMin * 1.35, Math.min(vw, 1400) * 0.3);

      const tx = new Float32Array(n), ty = new Float32Array(n);
      const r0 = new Float32Array(n), a0 = new Float32Array(n); // vortex start (polar)
      const rT = new Float32Array(n), aT = new Float32Array(n); // vortex end (polar)
      const delay = new Float32Array(n);
      const px = new Float32Array(n), py = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const x = points[idx[i] * 2], y = points[idx[i] * 2 + 1];
        tx[i] = x;
        ty[i] = y;
        const r = rMin + Math.random() * (rMax - rMin);
        // Polar coords in the flattened (squashed) frame around the centre.
        const qx = x - cx, qy = (y - cy) / squash;
        rT[i] = Math.hypot(qx, qy);
        const end = Math.atan2(qy, qx);
        r0[i] = r;
        a0[i] = Math.random() * Math.PI * 2;
        // Unwrap so every dot turns the same way by SPIN_TURNS extra turns.
        let e = end;
        while (e < a0[i]) e += Math.PI * 2;
        aT[i] = e + SPIN_TURNS * Math.PI * 2;
        // Outer dots start later → a coherent shrinking ring.
        delay[i] = ((r - rMin) / (rMax - rMin)) * MAX_DELAY_S * 0.7 + Math.random() * MAX_DELAY_S * 0.3;
      }
      const total = MAX_DELAY_S + TRAVEL_S;
      const radius = Math.max(0.8, fontSize * 0.022);

      // Viewport-sized fixed canvas so dots can come from far outside the word.
      canvas.width = Math.ceil(vw * dpr);
      canvas.height = Math.ceil(vh * dpr);
      // Display size in px from the same values as the buffer. CSS 100vh is the
      // toolbar-hidden height on iOS/iPadOS Safari (> innerHeight), which
      // stretched the drawing vertically and put the dots too low.
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        finishNow();
        return;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = cs.color;

      setPhase("running");

      const draw = (alpha) => {
        // Re-read the span position each frame so the dots follow page scroll.
        const r = target.getBoundingClientRect();
        ctx.clearRect(0, 0, vw, vh);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const x = r.left + px[i], y = r.top + py[i];
          ctx.moveTo(x + radius, y);
          ctx.arc(x, y, radius, 0, Math.PI * 2);
        }
        ctx.fill();
      };

      let t0 = 0;
      const frame = (now) => {
        if (cancelled) return;
        if (!t0) t0 = now;
        const t = (now - t0) / 1000;

        for (let i = 0; i < n; i++) {
          const u = Math.min(1, Math.max(0, (t - delay[i]) / TRAVEL_S));
          const ea = easeInOutCubic(Math.min(1, u / SPIN_END)); // angle progress
          const er = easeInOutCubic(u); // radius progress
          // Dots keep circling before they move in; the drift fades out with
          // the angle progress so they end exactly at their target angle.
          const ang = a0[i] + (aT[i] - a0[i]) * ea + 0.9 * t * (1 - ea);
          const rad = r0[i] + (rT[i] - r0[i]) * er;
          px[i] = cx + Math.cos(ang) * rad;
          py[i] = cy + Math.sin(ang) * rad * squash;
        }

        if (t >= total) {
          px.set(tx);
          py.set(ty);
          draw(1);
          window.removeEventListener("resize", onResize);
          setPhase("reveal");
          fadeTimer = setTimeout(() => !cancelled && setPhase("done"), FADE_MS);
          return;
        }
        draw(Math.min(1, t / 0.5)); // brief fade-in of the scattered dots
        rafId = requestAnimationFrame(frame);
      };
      rafId = requestAnimationFrame(frame);
    };

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(fadeTimer);
      window.removeEventListener("resize", onResize);
      // A real unmount mid-intro must not leave the text hidden on remount.
      if (introPlayed) setPhase("done");
    };
    // Runs once per mount; phase transitions are driven from inside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span ref={wrapRef} className="particle-title" data-intro={phase}>
      {children}
      {phase !== "done" && (
        <canvas ref={canvasRef} className="particle-title-canvas" aria-hidden="true" />
      )}
    </span>
  );
}
