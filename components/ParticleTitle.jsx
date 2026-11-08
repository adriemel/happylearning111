"use client";

import { useEffect, useRef, useState } from "react";

// Module-level flag: survives client-side re-renders and remounts, resets only
// on a real page load (new JS context). Set once the intro has actually started.
let introPlayed = false;

const FONT_TIMEOUT_MS = 1500; // skip the intro if web fonts take longer than this
const FADE_MS = 300;

// Motion styles. "vortex" (default): dots circle the word on a flattened disc and
// spiral in. "converge": dots stream in radially from all sides, left to right.
// Preview override: ?intro=converge or ?intro=vortex
const MODES = {
  vortex: { travel: 2.6, maxDelay: 1.1, spin: 1.1 },
  converge: { travel: 2.4, maxDelay: 1.4 },
};

const easeInOutCubic = (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
const easeOutCubic = (u) => 1 - (1 - u) ** 3;

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
      const param = new URLSearchParams(window.location.search).get("intro");
      const mode = param in MODES ? param : "vortex";
      const cfg = MODES[mode];

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
      const ascent = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent ?? fontSize * 0.8;
      const descent = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent ?? fontSize * 0.2;
      // Centre the font's content box vertically in the span's box.
      const baseline = pad + (rect.height - (ascent + descent)) / 2 + ascent;
      octx.fillText(text, pad, baseline);

      const { data, width: ow, height: oh } = octx.getImageData(0, 0, off.width, off.height);
      const step = Math.max(1, Math.round(dpr)); // ~1 sample per CSS pixel
      const points = [];
      for (let y = 0; y < oh; y += step) {
        for (let x = 0; x < ow; x += step) {
          if (data[(y * ow + x) * 4 + 3] > 128) points.push(x / dpr - pad, y / dpr - pad);
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
      // Start radius: well outside the word, scaled to the viewport.
      const rMin = Math.max(rect.width * 0.9, 120);
      const rMax = Math.max(rMin * 1.4, Math.min(vw, 1400) * 0.55);

      const tx = new Float32Array(n), ty = new Float32Array(n);
      const sx = new Float32Array(n), sy = new Float32Array(n); // converge start
      const r0 = new Float32Array(n), a0 = new Float32Array(n); // vortex start (polar)
      const rT = new Float32Array(n), aT = new Float32Array(n); // vortex end (polar)
      const delay = new Float32Array(n);
      const px = new Float32Array(n), py = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const x = points[idx[i] * 2], y = points[idx[i] * 2 + 1];
        tx[i] = x;
        ty[i] = y;
        const u = rect.width > 0 ? x / rect.width : 0.5; // 0 = left edge, 1 = right edge
        const r = rMin + Math.random() * (rMax - rMin);

        if (mode === "vortex") {
          // Polar coords in the flattened (squashed) frame around the centre.
          const qx = x - cx, qy = (y - cy) / squash;
          rT[i] = Math.hypot(qx, qy);
          const end = Math.atan2(qy, qx);
          r0[i] = r;
          a0[i] = Math.random() * Math.PI * 2;
          // Unwrap so every dot turns the same way (counter-clockwise on screen)
          // by `spin` extra turns on its way in.
          let e = end;
          while (e < a0[i]) e += Math.PI * 2;
          aT[i] = e + cfg.spin * Math.PI * 2;
          // Outer dots start later → a coherent shrinking ring.
          delay[i] = ((r - rMin) / (rMax - rMin)) * cfg.maxDelay * 0.7 + Math.random() * cfg.maxDelay * 0.3;
        } else {
          // Radially outward from the centre, through the target point.
          let dx = x - cx, dy = (y - cy) * 2.2;
          const len = Math.hypot(dx, dy) || 1;
          dx /= len;
          dy /= len;
          sx[i] = x + dx * r;
          sy[i] = y + dy * r * 0.6;
          // Left-to-right sweep with a little jitter.
          delay[i] = u * cfg.maxDelay * 0.85 + Math.random() * cfg.maxDelay * 0.15;
        }
      }
      const total = cfg.maxDelay + cfg.travel;
      const radius = Math.max(0.8, fontSize * 0.022);

      // Viewport-sized fixed canvas so dots can come from far outside the word.
      canvas.width = Math.ceil(vw * dpr);
      canvas.height = Math.ceil(vh * dpr);
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
          const u = Math.min(1, Math.max(0, (t - delay[i]) / cfg.travel));
          if (mode === "vortex") {
            const e = easeInOutCubic(u);
            // Before/while moving in, dots keep circling; the drift term fades out
            // with progress so they land exactly on the target.
            const ang = a0[i] + (aT[i] - a0[i]) * e + 0.9 * t * (1 - e);
            const rad = r0[i] + (rT[i] - r0[i]) * e;
            px[i] = cx + Math.cos(ang) * rad;
            py[i] = cy + Math.sin(ang) * rad * squash;
          } else {
            const e = easeOutCubic(u);
            px[i] = sx[i] + (tx[i] - sx[i]) * e;
            py[i] = sy[i] + (ty[i] - sy[i]) * e;
          }
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
