"use client";

// 3D "classroom" view of the topic library: one board per subject on a ring around the viewer.
// Plain DOM + CSS 3D transforms. Rotation is a CSS transition; only the zoom uses GSAP (loaded on demand).
// Room art comes from public/scenes/classroom/scene.json, so swapping the room needs no code change.

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { T } from "@/lib/i18n";
import { SUBJECT_META } from "@/lib/subjects";
import SubjectIcon from "./SubjectIcon";
import "./classroom.css";

const SCENE_URL = "/scenes/classroom/scene.json";
const SCENE_DIR = SCENE_URL.slice(0, SCENE_URL.lastIndexOf("/") + 1);
const PREVIEW_TITLES = 4;
const SWIPE_PX = 40;   // drag distance that counts as a swipe
const SLOP_PX = 8;     // movement before a press becomes a drag (keeps taps as clicks)
const OPACITY = [1, 0.8, 0.3]; // by circular distance from the active board; further = hidden
const BOARD_GAP = 0.22;   // gap between neighbouring boards, as a fraction of the board width
const ZOOM_SCALE = 1.02;  // camera scale part of the zoom
const ZOOM_DOLLY = 1.06;  // total apparent magnification from the camera (translateZ + scale)
const ZOOM_SECONDS = 0.6;

const mod = (a, n) => ((a % n) + n) % n;
const fmt = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Board width: ~58 % of the stage at <=480 px, easing to ~32 % at >=1120 px, kept within 180..380 px.
function boardSize(cw, sh) {
  const f = 0.58 - (0.26 * Math.min(Math.max(cw - 480, 0), 640)) / 640;
  const W = Math.round(Math.min(380, Math.max(180, cw * f)));
  const H = Math.round(Math.min(W * 1.3, sh * 0.58)); // front board spans ~17..75 % of the stage height
  // Zoomed board: grows to most of the stage so the full page list has room, also on phones.
  const ZW = Math.round(Math.min(cw * 0.88, 560));
  const ZH = Math.round(sh * 0.84);
  return { W, H, ZW, ZH };
}

function sortPages(pages, lang) {
  return pages.slice().sort((a, b) =>
    (b.addedAt || "").localeCompare(a.addedAt || "") || a.title[lang].localeCompare(b.title[lang], lang));
}

export default function ClassroomRing({ subjects, panels, lang }) {
  const t = T[lang];
  const N = subjects.length;
  const step = N ? 360 / N : 0;

  const [pos, setPos] = useState(0); // unwrapped: wrapping last -> first is one step, not 330 degrees
  const [size, setSize] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const [instant, setInstant] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [scene, setScene] = useState(null);
  const [announce, setAnnounce] = useState("");

  const stageRef = useRef(null);
  const cameraRef = useRef(null);
  const openRef = useRef(null);
  const headingRef = useRef(null);
  const layerEls = useRef([]);
  const layerBase = useRef([]);
  const layerX = useRef([]);
  const dragRef = useRef(null);
  const suppressClick = useRef(false);
  const interacted = useRef(false);
  const focusBoard = useRef(false);
  const gsapPromise = useRef(null);

  const active = N ? mod(pos, N) : 0;
  const angle = pos * step;
  // Ring polygon side = board width + gap, so neighbours stand apart (BOARD_GAP = 0: they touch).
  // Viewer stands at the ring centre (perspective = R), so the front board renders 1:1.
  // N < 3 would give a degenerate ring, so R is computed as for 3.
  const R = size && N ? (size.W * (1 + BOARD_GAP)) / (2 * Math.tan(Math.PI / Math.max(N, 3))) : 0;

  // Subject list changed (DE/EN re-sort or a new subject): keep the same subject in front, jump without animation.
  const [prevSubjects, setPrevSubjects] = useState(subjects);
  if (prevSubjects !== subjects) {
    const current = prevSubjects[mod(pos, prevSubjects.length || 1)];
    setPrevSubjects(subjects);
    setPos(Math.max(0, subjects.indexOf(current)));
    setInstant(true);
  }

  useEffect(() => {
    if (!instant) return undefined;
    let id = requestAnimationFrame(() => { id = requestAnimationFrame(() => setInstant(false)); });
    return () => cancelAnimationFrame(id);
  }, [instant]);

  // Measure the stage; recompute W, H and R on resize.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => {
      const cw = el.clientWidth, sh = el.clientHeight;
      if (!cw || !sh) return;
      setSize(prev => {
        if (prev && prev.cw === cw && prev.sh === sh) return prev;
        if (prev) setInstant(true);
        return { cw, sh, ...boardSize(cw, sh) };
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(SCENE_URL)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(json => {
        if (!Array.isArray(json?.layers)) throw new Error("scene.json has no layers array");
        if (!cancelled) setScene(json);
      })
      .catch(err => console.warn(`ClassroomRing: room scene ${SCENE_URL} not loaded:`, err.message));
    return () => { cancelled = true; };
  }, []);

  const layers = scene ? scene.layers.slice().sort((a, b) => a.z - b.z) : [];
  const ringZ = scene?.ringZ ?? 0;

  // Parallax: translateX = -angle * factor. Layers tile horizontally, so whole tiles are removed
  // ("rebased") once the motion has settled; that keeps the offset bounded and is invisible.
  const rebase = useCallback((i) => {
    const el = layerEls.current[i];
    const tile = Number(el?.dataset.tile);
    if (!el || !tile) return;
    const k = Math.round(layerX.current[i] / tile);
    if (!k) return;
    layerBase.current[i] = (layerBase.current[i] || 0) - k * tile;
    layerX.current[i] -= k * tile;
    el.classList.add("is-rebasing");
    el.style.setProperty("--x", `${layerX.current[i]}px`);
    void el.offsetWidth; // commit the jump before transitions come back
    el.classList.remove("is-rebasing");
  }, []);

  useEffect(() => {
    const settleNow = instant || reducedMotion();
    layers.forEach((layer, i) => {
      const el = layerEls.current[i];
      if (!el) return;
      const tile = el.clientHeight * (Number(layer.tileAspect) || 1);
      el.dataset.tile = String(tile);
      el.style.setProperty("--tile", `${tile}px`);
      layerX.current[i] = -angle * (Number(layer.parallax) || 0) + (layerBase.current[i] || 0);
      el.style.setProperty("--x", `${layerX.current[i]}px`);
      if (settleNow) rebase(i);
    });
  }); // every render: cheap, and it must follow angle, size, scene and instant

  const go = useCallback((delta) => {
    if (!delta) return;
    interacted.current = true;
    setPos(p => p + delta);
  }, []);

  const goTo = useCallback((i) => {
    let delta = mod(i - active, N);
    if (delta > N / 2) delta -= N; // shortest path round the ring
    go(delta);
  }, [active, N, go]);

  useEffect(() => {
    if (!interacted.current || !N) return;
    setAnnounce(fmt(t.ringStatus, { name: SUBJECT_META[subjects[active]]?.[lang] || subjects[active], i: active + 1, n: N }));
  }, [active, N, subjects, lang, t]);

  useEffect(() => {
    if (focusBoard.current) { focusBoard.current = false; openRef.current?.focus({ preventScroll: true }); }
  }, [active, zoomed]);

  // ── Zoom (GSAP, imported on first use) ──
  const loadGsap = () => (gsapPromise.current ||= import("gsap").then(m => m.gsap || m.default));

  const zoomTarget = useCallback(() => {
    if (!size) return { z: 0, scale: 1 };
    const s = Math.min(ZOOM_DOLLY, (size.cw * 0.96) / size.ZW, (size.sh * 0.94) / size.ZH);
    if (s <= ZOOM_SCALE) return { z: 0, scale: Math.max(1, s) };
    return { z: R * (1 - ZOOM_SCALE / s), scale: ZOOM_SCALE }; // apparent scale = scale * R / (R - z)
  }, [size, R]);

  const animateCamera = useCallback(async (vars) => {
    const gsap = await loadGsap();
    if (!cameraRef.current) return;
    gsap.to(cameraRef.current, { ...vars, duration: reducedMotion() ? 0 : ZOOM_SECONDS, ease: "power3.inOut", overwrite: true });
  }, []);

  const zoomIn = useCallback(() => {
    if (zoomed || !size) return;
    interacted.current = true;
    setZoomed(true);
    animateCamera(zoomTarget());
  }, [zoomed, size, animateCamera, zoomTarget]);

  const zoomOut = useCallback(() => {
    if (!zoomed) return;
    focusBoard.current = true;
    setZoomed(false);
    animateCamera({ z: 0, scale: 1 });
  }, [zoomed, animateCamera]);

  useEffect(() => { if (zoomed) headingRef.current?.focus({ preventScroll: true }); }, [zoomed]);
  // Keep the zoom framing right when the stage is resized while zoomed in.
  useEffect(() => { if (zoomed) animateCamera(zoomTarget()); }, [size]);

  // ── Pointer drag / swipe ──
  const onPointerDown = (e) => {
    suppressClick.current = false;
    if (zoomed || !size || (e.pointerType === "mouse" && e.button !== 0)) return;
    loadGsap();
    dragRef.current = { id: e.pointerId, x0: e.clientX, dx: 0, active: false, raf: 0 };
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.id) return;
    d.dx = e.clientX - d.x0;
    if (!d.active) {
      if (Math.abs(d.dx) < SLOP_PX) return;
      d.active = true;
      stageRef.current.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    if (!d.raf) d.raf = requestAnimationFrame(() => {
      d.raf = 0;
      stageRef.current?.style.setProperty("--drag", String((-d.dx / size.W) * step));
    });
  };
  const endDrag = (e, cancelled) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.id) return;
    dragRef.current = null;
    if (!d.active) return;
    cancelAnimationFrame(d.raf);
    suppressClick.current = true;
    stageRef.current?.style.setProperty("--drag", "0");
    setDragging(false);
    if (!cancelled && Math.abs(d.dx) >= SWIPE_PX) {
      const n = Math.max(1, Math.round(Math.abs(d.dx) / size.W));
      go(d.dx < 0 ? n : -n);
    }
  };
  const onClickCapture = (e) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const onKeyDown = (e) => {
    if (zoomed) {
      if (e.key === "Escape") { e.preventDefault(); zoomOut(); }
      return;
    }
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    focusBoard.current = !!e.target.closest?.(".board");
    go(e.key === "ArrowRight" ? 1 : -1);
  };

  const name = (s) => SUBJECT_META[s]?.[lang] || s;
  const count = (n) => `${n} ${n === 1 ? t.page : t.pages}`;

  return (
    <section className="classroom" aria-roledescription="carousel" aria-label={t.room} onKeyDown={onKeyDown}>
      <div className="classroom-viewport">
        <button type="button" className="ring-arrow ring-arrow-prev" aria-label={t.prevSubject} disabled={zoomed || N < 2} onClick={() => go(-1)}>‹</button>
        <button type="button" className="ring-arrow ring-arrow-next" aria-label={t.nextSubject} disabled={zoomed || N < 2} onClick={() => go(1)}>›</button>
        <div ref={stageRef}
          className={`classroom-stage${dragging ? " is-dragging" : ""}${instant ? " is-instant" : ""}${zoomed ? " is-zoomed" : ""}`}
          style={size ? { "--persp": `${R}px`, "--bw": `${size.W}px`, "--bh": `${size.H}px`, "--zw": `${size.ZW}px`, "--zh": `${size.ZH}px` } : undefined}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={e => endDrag(e, false)} onPointerCancel={e => endDrag(e, true)}
          onClickCapture={onClickCapture} onFocus={loadGsap}>
          {layers.map((layer, i) => (
            <div key={layer.id || layer.file} aria-hidden="true"
              ref={el => { layerEls.current[i] = el; }}
              className={`classroom-layer${layer.z > ringZ ? " classroom-front" : ""}`}
              onTransitionEnd={e => { if (e.target === e.currentTarget && e.propertyName === "transform") rebase(i); }}
              style={{
                "--f": Number(layer.parallax) || 0,
                zIndex: layer.z > ringZ ? 2 : 0,
                top: layer.top, bottom: layer.bottom, height: layer.height || "100%",
                backgroundImage: `url("${SCENE_DIR}${layer.file}")`,
              }} />
          ))}
          <div ref={cameraRef} className="classroom-camera">
            {size && (
              <div className="classroom-ring" style={{ "--angle": angle }}>
                {subjects.map((s, i) => {
                  const d = Math.min(mod(i - active, N), mod(active - i, N));
                  const visible = d < OPACITY.length && d * step < 90 && (!zoomed || d === 0);
                  const isActive = d === 0;
                  const pages = sortPages(panels.filter(p => p.subject === s), lang);
                  const label = `${name(s)}, ${fmt(t.slideOf, { i: i + 1, n: N })}`;
                  return (
                    <Fragment key={s}>
                    {/* Backlight: own element 2 px behind the board, sized to contain its glow (glow overflowing a
                        3D-transformed board gets clipped by Chrome's layer bounds). Color via the .subject-tag binding. */}
                    <div className="board-backlight" data-subject={s} data-on={(isActive && !zoomed) || undefined} aria-hidden="true"
                      style={{ transform: `translateZ(var(--persp)) rotateY(${-i * step}deg) translateZ(${-R - 2}px)` }}>
                      <span className="subject-tag" />
                    </div>
                    <div className={`board${isActive && zoomed ? "" : " board-poster"}`} data-subject={s} data-active={isActive || undefined}
                      role="group" aria-roledescription={t.slide} aria-label={label}
                      aria-hidden={visible ? undefined : "true"} inert={!visible || undefined}
                      style={{
                        transform: `translateZ(var(--persp)) rotateY(${-i * step}deg) translateZ(${-R}px)`,
                        opacity: visible ? OPACITY[d] : 0,
                        pointerEvents: visible ? undefined : "none",
                      }}
                      onClick={() => { if (!zoomed) (isActive ? zoomIn() : goTo(i)); }}>
                      {isActive && zoomed ? (
                        <>
                          <div className="board-head">
                            <span className="subject-tag">{name(s)}</span>
                            <button type="button" className="board-back" onClick={e => { e.stopPropagation(); zoomOut(); }}>← {t.back}</button>
                          </div>
                          <h3 className="board-heading" tabIndex={-1} ref={headingRef}>
                            {fmt(t.allPagesIn, { name: name(s) })} <span className="board-count">{count(pages.length)}</span>
                          </h3>
                          <ul className="board-list">
                            {pages.map(p => (
                              <li key={p.id}>
                                <a className="board-link" href={p.href} target="_blank" rel="noopener noreferrer">
                                  <span className="board-link-top">
                                    <span className="board-link-title">{p.title[lang]}</span>
                                    <span className="card-lang">{p.lang}</span>
                                    {p.apiNeeded && <span className="api-badge">API</span>}
                                  </span>
                                  <span className="board-link-desc">{p.desc[lang]}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <>
                          {/* .subject-tag on halo and title only pulls in the subject color variables */}
                          <span className="subject-tag board-halo"><SubjectIcon subject={s} className="board-icon" /></span>
                          <span className="subject-tag board-title">{name(s)}</span>
                          <p className="board-blurb">{SUBJECT_META[s]?.blurb?.[lang]}</p>
                          <p className="board-count board-pill">{count(pages.length)}</p>
                          <ul className="board-preview">
                            {pages.slice(0, PREVIEW_TITLES).map(p => <li key={p.id}>{p.title[lang]}</li>)}
                          </ul>
                          {isActive && <button type="button" ref={openRef} className="board-open" aria-label={`${t.open}: ${name(s)}`} />}
                        </>
                      )}
                    </div>
                    </Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="ring-dots" role="group" aria-label={t.chooseSubject}>
        {subjects.map((s, i) => (
          <button key={s} type="button" className="ring-dot-btn" data-subject={s} title={name(s)} aria-label={name(s)}
            aria-current={i === active ? "true" : undefined} disabled={zoomed} onClick={() => goTo(i)}>
            <span className="subject-tag ring-dot" aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="classroom-sr" role="status" aria-live="polite">{announce}</p>
    </section>
  );
}
