"use client";

import { useEffect, useRef, useState } from "react";

// Module-level flag: survives client-side re-renders and remounts, resets only
// on a real page load (new JS context). Set once the intro has actually started.
let introPlayed = false;

const FONT_TIMEOUT_MS = 1500; // skip the intro if web fonts take longer than this
const MAX_DURATION_S = 2.6; // hard cap; particles are snapped to targets after this
const FADE_MS = 300;

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

    const finishNow = () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(fadeTimer);
      window.removeEventListener("resize", finishNow);
      setPhase("done");
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

      window.addEventListener("resize", finishNow);
      run(cs, font, text);
    };

    const run = (cs, font, text) => {
      const rect = target.getBoundingClientRect();
      const fontSize = parseFloat(cs.fontSize);
      const padX = Math.round(rect.height * 0.8);
      const padY = Math.round(rect.height * 0.5);
      const cssW = Math.ceil(rect.width) + 2 * padX;
      const cssH = Math.ceil(rect.height) + 2 * padY;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Offscreen raster of the text at device resolution, in the same box geometry.
      const off = document.createElement("canvas");
      off.width = Math.ceil(cssW * dpr);
      off.height = Math.ceil(cssH * dpr);
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
      const baseline = padY + (rect.height - (ascent + descent)) / 2 + ascent;
      octx.fillText(text, padX, baseline);

      const { data, width: ow, height: oh } = octx.getImageData(0, 0, off.width, off.height);
      const step = Math.max(1, Math.round(dpr)); // ~1 sample per CSS pixel
      const points = [];
      for (let y = 0; y < oh; y += step) {
        for (let x = 0; x < ow; x += step) {
          if (data[(y * ow + x) * 4 + 3] > 128) points.push(x / dpr, y / dpr);
        }
      }
      const nPoints = points.length / 2;
      if (nPoints === 0) {
        finishNow();
        return;
      }

      // Random subset of target points.
      const wanted = window.innerWidth < 700 ? 400 : 800;
      const n = Math.min(wanted, nPoints);
      const idx = Array.from({ length: nPoints }, (_, i) => i);
      for (let i = 0; i < n; i++) {
        const j = i + Math.floor(Math.random() * (nPoints - i));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }

      const tx = new Float32Array(n), ty = new Float32Array(n);
      const px = new Float32Array(n), py = new Float32Array(n);
      const vx = new Float32Array(n), vy = new Float32Array(n);
      const omega = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        tx[i] = points[idx[i] * 2];
        ty[i] = points[idx[i] * 2 + 1];
        px[i] = Math.random() * cssW;
        py[i] = Math.random() * cssH;
        vx[i] = (Math.random() - 0.5) * 60;
        vy[i] = (Math.random() - 0.5) * 60;
        omega[i] = 4.5 + Math.random() * 2; // rad/s, spread gives organic convergence
      }
      const zeta = 0.75; // damping ratio
      const radius = Math.max(0.8, fontSize * 0.022);

      canvas.width = off.width;
      canvas.height = off.height;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.style.left = `${-padX}px`;
      canvas.style.top = `${-padY}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        finishNow();
        return;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = cs.color;

      setPhase("running");

      const draw = (alpha) => {
        ctx.clearRect(0, 0, cssW, cssH);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          ctx.moveTo(px[i] + radius, py[i]);
          ctx.arc(px[i], py[i], radius, 0, Math.PI * 2);
        }
        ctx.fill();
      };

      let t0 = 0, last = 0;
      const frame = (now) => {
        if (cancelled) return;
        if (!t0) t0 = last = now;
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        const elapsed = (now - t0) / 1000;

        let settled = true;
        for (let i = 0; i < n; i++) {
          const w = omega[i];
          const dx = tx[i] - px[i], dy = ty[i] - py[i];
          // Damped spring, semi-implicit Euler.
          vx[i] += (w * w * dx - 2 * zeta * w * vx[i]) * dt;
          vy[i] += (w * w * dy - 2 * zeta * w * vy[i]) * dt;
          px[i] += vx[i] * dt;
          py[i] += vy[i] * dt;
          if (settled && (Math.abs(dx) > 0.25 || Math.abs(dy) > 0.25 ||
              Math.abs(vx[i]) > 4 || Math.abs(vy[i]) > 4)) settled = false;
        }

        if (settled || elapsed >= MAX_DURATION_S) {
          px.set(tx);
          py.set(ty);
          draw(1);
          window.removeEventListener("resize", finishNow);
          setPhase("reveal");
          fadeTimer = setTimeout(() => !cancelled && setPhase("done"), FADE_MS);
          return;
        }
        draw(Math.min(1, elapsed / 0.3)); // brief fade-in of the scattered dots
        rafId = requestAnimationFrame(frame);
      };
      rafId = requestAnimationFrame(frame);
    };

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(fadeTimer);
      window.removeEventListener("resize", finishNow);
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
