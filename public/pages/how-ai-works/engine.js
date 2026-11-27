/*
 * Engine: i18n, environments + decoration from scenes.js, and the flight.
 * Scrolling (wheel, trackpad, touch, keys) moves a camera forward along z.
 * One GSAP timeline holds the whole journey: [dwell at station 0] [fly] [dwell 1] ...
 * and is scrubbed by one ScrollTrigger. render(camZ) projects everything.
 * Station choreography lives in story.js, widgets in widgets.js.
 */
(function () {
  "use strict";
  const A = window.AIX;
  const root = document.documentElement;
  const isStatic = root.classList.contains("static");
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked: ignore */ } },
  };

  if (!A || !A.scenes || !A.content || !A.data || !A.widgets || !A.story) {
    console.error("how-ai-works: a script failed to load (scenes/content/data/widgets/story).");
    return;
  }
  const S = A.scenes;
  const FL = S.flight;
  const P = FL.perspective, G = FL.gap;
  const GRID = 48; // floor/ceiling tile size in px, keep in sync with .env-grid in style.css

  /* ── i18n ─────────────────────────────────────────────── */
  function initialLang() {
    const url = new URLSearchParams(location.search).get("lang");
    if (url === "de" || url === "en") return url;
    const own = store.get("aix-lang");
    if (own === "de" || own === "en") return own;
    try {
      const hub = JSON.parse(store.get("lernhub-tweaks") || "{}").lang;
      if (hub === "de" || hub === "en") return hub;
    } catch (e) { /* malformed hub settings: ignore */ }
    return (navigator.language || "de").toLowerCase().startsWith("de") ? "de" : "en";
  }
  let lang = initialLang();
  const dict = () => A.content[lang];
  const t = (key) => key.split(".").reduce((o, k) => (o == null ? o : o[k]), dict());
  A.i18n = { dict, t, get lang() { return lang; } };
  const esc = A.widgets.esc;

  const splitWords = (el) => {
    el.innerHTML = String(t(el.dataset.i18n)).split(/\s+/).map((w) => `<span class="w"><span class="wi">${esc(w)}</span></span>`).join(" ");
  };
  const splitChars = (el, text) => {
    el.classList.add("typed");
    el.innerHTML = [...text].map((c) => `<span class="ch">${esc(c)}</span>`).join("");
  };

  function applyLang() {
    root.lang = lang;
    $$("[data-i18n]").forEach((el) => { const v = t(el.dataset.i18n); if (v != null) el.textContent = v; });
    $$("[data-i18n-html]").forEach((el) => { const v = t(el.dataset.i18nHtml); if (v != null) el.innerHTML = v; });
    $$("[data-i18n-attr]").forEach((el) => el.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":");
      const v = t(key);
      if (v != null) el.setAttribute(attr, v);
    }));
    $$("[data-steps]").forEach((el) => { el.innerHTML = (t(el.dataset.steps) || []).map((s) => `<p class="step">${s}</p>`).join(""); });
    $$("[data-split]").forEach(splitWords);
    splitChars($("#introTyped"), t("prompt"));
    splitChars($("#answerText"), t("answer"));
    $("#srcList").innerHTML = t("outro.src").map((s) => `<li>${esc(s)}</li>`).join("");
    $$(".seg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    $("#motionBtn").textContent = isStatic ? t("ui.motionOff") : t("ui.motionOn");
    buildNav();
    A.widgets.build(lang, dict());
  }

  /* ── Stations, environments, decoration ──────────────── */
  const stations = S.stations.map((d, i) => ({ ...d, i, z: i * G, el: $(`[data-station="${d.id}"]`) })).filter((s) => s.el);
  stations.forEach((s) => s.el.style.setProperty("--accent", s.accent));
  const lastZ = stations[stations.length - 1].z;

  const envEls = {};
  Object.entries(S.envs).forEach(([name, e]) => {
    const div = document.createElement("div");
    div.className = "env";
    div.dataset.env = name;
    div.style.setProperty("--floor-bg", e.floorBg || "#000");
    const img = (cls, src) => `<img class="${cls}" src="${src}" alt="" decoding="async">`;
    const plane = (kind, src) => `<div class="env-${kind}-wrap"><div class="env-${kind}"><div class="env-grid" style="background-image:url('${src}')"></div></div></div>`;
    div.innerHTML = (e.sky ? img("env-sky", e.sky) : "") + (e.sun ? img("env-sun", e.sun) : "") +
      (e.horizon ? img("env-horizon", e.horizon) : "") + (e.ceiling ? plane("ceil", e.ceiling) : "") +
      (e.floor ? plane("floor", e.floor) : "") + '<div class="env-glow"></div>';
    $("#envs").appendChild(div);
    envEls[name] = { el: div, grids: $$(".env-grid", div), sun: $(".env-sun", div), horizon: $(".env-horizon", div) };
  });

  // Decoration: deterministic positions along the flight; env = env of the nearest station.
  const deco = [];
  (function buildDeco() {
    let seed = 12345;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const n = S.decoCount || 40;
    for (let k = 0; k < n; k++) {
      const z = (k + r() * 0.6) / n * (lastZ + G * 0.8) + 300;
      const near = stations.reduce((a, b) => (Math.abs(b.z - z) < Math.abs(a.z - z) ? b : a));
      const env = S.envs[near.env];
      if (!env || !env.deco || !env.deco.length) continue;
      const img = document.createElement("img");
      img.src = env.deco[Math.floor(r() * env.deco.length)];
      img.alt = ""; img.decoding = "async";
      const ground = env.decoMode === "ground";
      img.className = "deco-item" + (ground ? "" : " float");
      const side = k % 2 ? 1 : -1;
      const item = { el: img, z, side, ux: 0.8 + r() * 0.9, uy: ground ? null : (r() - 0.5) * 1.1, size: ground ? 150 + r() * 130 : 70 + r() * 90 };
      img.style.width = item.size + "px";
      $("#deco").appendChild(img);
      deco.push(item);
    }
  })();

  /* ── Projection ──────────────────────────────────────── */
  let vp = { x: 0, y: 0, w: 1, h: 1, W: innerWidth, H: innerHeight };
  function layout() {
    const r = isStatic
      ? { left: 0, top: 0, width: innerWidth, height: innerHeight * 0.84 } // static mode: fixed backdrop, horizon at 42 %
      : $("#worldArea").getBoundingClientRect();
    vp = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, W: innerWidth, H: innerHeight };
    root.style.setProperty("--vpx", vp.x.toFixed(1) + "px");
    root.style.setProperty("--vpy", vp.y.toFixed(1) + "px");
  }
  const smooth = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };

  // Weight of each environment at camera position z (cross-fade inside each flight).
  function envWeights(z) {
    const w = {};
    Object.keys(S.envs).forEach((k) => { w[k] = 0; });
    let i = stations.findIndex((s, k) => k === stations.length - 1 || stations[k + 1].z > z);
    if (i < 0) i = 0;
    const a = stations[i], b = stations[i + 1];
    if (!b || a.env === b.env || z <= a.z) { w[a.env] = 1; return w; }
    const f = smooth(0.3, 0.47, (z - a.z) / (b.z - a.z));
    w[a.env] = 1 - f; w[b.env] += f;
    return w;
  }

  let current = -1, lastZcam = -1;
  function render(z) {
    lastZcam = z;
    // stations
    let here = 0, best = Infinity;
    stations.forEach((s) => {
      const rel = s.z - z;
      const [f0, f1] = s.passFade || [-260, -480];
      // ahead: faint in the distance, full when arriving; behind: fade while passing
      const o = rel >= 0
        ? (rel > G * 1.15 ? 0 : 1 - 0.92 * Math.pow(Math.max(0, Math.min(1, (rel - 120) / (G - 120))), 0.55))
        : smooth(f1, f0, rel);
      const sc = P / Math.max(30, P + rel);
      const w = s.world || (s.world = $(".world", s.el));
      if (o <= 0.005) { if (w.style.visibility !== "hidden") { w.style.visibility = "hidden"; w.style.opacity = "0"; } }
      else {
        w.style.visibility = "visible";
        w.style.opacity = o.toFixed(3);
        w.style.transform = `scale(${sc.toFixed(4)})`;
      }
      w.style.zIndex = String(rel >= 0 ? 10 - Math.min(9, Math.round(rel / 300)) : 12);
      if (Math.abs(rel) < best) { best = Math.abs(rel); here = s.i; }
    });
    if (here !== current) {
      stations.forEach((s) => s.el.classList.toggle("here", s.i === here));
      current = here;
      setCurrent(here);
    }
    // environments
    const ew = envWeights(z);
    Object.entries(envEls).forEach(([name, e]) => {
      const op = ew[name] || 0;
      e.el.style.opacity = op.toFixed(3);
      e.el.style.visibility = op < 0.005 ? "hidden" : "visible";
      if (op < 0.005) return;
      const off = (z * 0.55) % GRID;
      e.grids.forEach((g) => { g.style.transform = `translate3d(0, ${(g.closest(".env-ceil") ? -off : off).toFixed(1)}px, 0)`; });
      if (e.horizon) e.horizon.style.transform = `scale(${(1 + (z % (G * 4)) / (G * 4) * 0.12).toFixed(4)})`;
      if (e.sun) e.sun.style.transform = `scale(${(1 + Math.sin(z / 2600) * 0.04).toFixed(4)})`;
    });
    // decoration flying past
    deco.forEach((d) => {
      const rel = d.z - z;
      if (rel < -P * 0.75 || rel > G * 1.1) { if (d.on) { d.el.style.visibility = "hidden"; d.on = false; } return; }
      const sc = P / Math.max(30, P + rel);
      let o = rel > G * 0.7 ? 1 - (rel - G * 0.7) / (G * 0.4) : 1;
      if (rel < -P * 0.35) o = Math.max(0, 1 - (-rel - P * 0.35) / (P * 0.4));
      const x = vp.x + d.side * d.ux * (vp.W * 0.5) * sc - d.size / 2;
      const y = d.uy === null ? vp.y + vp.H * 0.42 * sc - d.size : vp.y + d.uy * vp.H * sc - d.size / 2;
      // never fly through the diagram area: fade items whose centre lies inside it
      const cx = x + d.size / 2, cy = y + (d.uy === null ? d.size : d.size / 2);
      const inX = Math.abs(cx - vp.x) / (vp.w / 2), inY = Math.abs(cy - vp.y) / (vp.h / 2);
      if (inX < 1.05 && inY < 1.05) o *= Math.max(0, Math.min(1, (Math.max(inX, inY) - 0.85) / 0.2));
      d.el.style.visibility = "visible"; d.on = true;
      d.el.style.opacity = Math.max(0, o).toFixed(3);
      d.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;
    });
  }

  /* ── Chapter nav ─────────────────────────────────────── */
  const nav = $("#chapters");
  function buildNav() {
    const names = t("chapters") || [];
    nav.innerHTML = stations.map((s, i) => `<button type="button" data-i="${i}"${i === Math.max(0, current) ? ' aria-current="step"' : ""}><span>${esc(names[i] || s.id)}</span><i></i></button>`).join("");
  }
  function setCurrent(i) {
    $$("button", nav).forEach((b) => (+b.dataset.i === i ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
  }
  nav.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]");
    if (!b) return;
    const i = +b.dataset.i;
    if (isStatic) { window.scrollTo({ top: stations[i].el.getBoundingClientRect().top + scrollY - 56 }); return; }
    // computed at click time: trigger start/end are only final after ScrollTrigger's refresh
    const y = i === 0 || !A.flight ? 0 : Math.round(A.flight.y(A.flight.starts[i] + 0.02));
    window.scrollTo({ top: y, behavior: Math.abs(y - scrollY) < innerHeight * 10 ? "smooth" : "auto" });
  });

  /* ── Controls ────────────────────────────────────────── */
  $$(".seg button").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    store.set("aix-lang", lang);
    rebuild();
  }));
  $("#motionBtn").addEventListener("click", () => {
    // "force" = animation explicitly switched on despite a reduced-motion OS setting.
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    store.set("aix-motion", isStatic ? (reduce ? "force" : "on") : "off");
    location.reload();
  });
  $("#againBtn").addEventListener("click", () => window.scrollTo({ top: 0, behavior: isStatic ? "auto" : "smooth" }));

  /* ── Timelines ───────────────────────────────────────── */
  function makeMain(s) {
    const steps = $$(".step", s.el);
    const N = Math.max(1, steps.length);
    const tl = gsap.timeline({ defaults: { ease: "none" } });
    tl.set({}, {}, N);
    if (!isStatic) {
      steps.forEach((st, i) => {
        if (!i) return;
        tl.to(steps[i - 1], { opacity: 0, y: -14, duration: 0.22 }, i - 0.2);
        tl.fromTo(st, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.22 }, i - 0.02);
      });
    }
    const story = A.story[s.id];
    if (story && story.main) story.main(tl, s.el, { N, lang });
    return tl;
  }

  let gctx = null, master = null, mainST = null;
  function buildTimelines() {
    gctx = gsap.context(() => {
      if (isStatic) {
        stations.forEach((s) => {
          const story = A.story[s.id] || {};
          makeMain(s).progress(story.staticProgress ?? 1).pause();
          if (story.static) story.static();
        });
        return;
      }
      const F = FL.fly / 100, drift = 30;
      const cam = { z: -drift };
      master = gsap.timeline({ paused: true, defaults: { ease: "none" }, onUpdate: () => render(cam.z) });
      const starts = [];
      let at = 0;
      stations.forEach((s, i) => {
        const D = Math.max(1, (s.dwell || 200) / 100);
        starts.push(at);
        master.fromTo(cam, { z: s.z - drift }, { z: s.z + drift, duration: D, immediateRender: i === 0 }, at);
        const main = makeMain(s);
        main.duration(D);
        master.add(main, at);
        at += D;
        const next = stations[i + 1];
        if (!next) return;
        master.fromTo(cam, { z: s.z + drift }, { z: next.z - drift, duration: F, ease: "power2.inOut", immediateRender: false }, at);
        const copyA = $(".copy", s.el), copyB = $(".copy", next.el);
        master.fromTo(copyA, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: F * 0.3, immediateRender: false }, at);
        master.fromTo(copyB, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: F * 0.35, immediateRender: i === 0 ? true : false }, at + F * 0.62);
        master.fromTo($$(".headline .wi", next.el), { yPercent: 115 }, { yPercent: 0, duration: F * 0.3, stagger: F * 0.025, ease: "power2.out" }, at + F * 0.66);
        at += F;
      });
      const total = at;
      $("#track").style.height = (total * 100 + 100) + "vh";
      mainST = ScrollTrigger.create({
        trigger: "#track", start: "top top", end: "bottom bottom", animation: master, scrub: 0.8,
        onUpdate: (st) => {
          gsap.set("#progressBar", { scaleX: st.progress });
          $("#scrollCue").style.opacity = st.progress > 0.01 ? "0" : "1";
        },
      });
      // scroll position for timeline time t (used by the nav and by tests)
      A.flight = { starts, total, fly: F, dwell: stations.map((s) => Math.max(1, (s.dwell || 200) / 100)), y: (tt) => mainST.start + (tt / total) * (mainST.end - mainST.start) };
      // copies of stations other than the first start hidden
      stations.slice(1).forEach((s) => gsap.set($(".copy", s.el), { autoAlpha: 0 }));
      render(cam.z);
    });
  }

  function introPlay() {
    if (isStatic) return;
    const el = stations[0].el;
    gsap.timeline({ delay: 0.15 })
      .from($$(".headline .wi", el), { yPercent: 115, duration: 0.9, stagger: 0.06, ease: "power3.out" })
      .from($$(".kicker, .steps", el), { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.1 }, 0.35)
      .from($(".chatwin", el), { autoAlpha: 0, y: 40, scale: 0.94, duration: 0.9, ease: "power3.out" }, 0.25);
  }

  function rebuild() {
    const y = scrollY;
    if (gctx) gctx.revert();
    master = null;
    applyLang();
    layout();
    buildTimelines();
    if (!isStatic) { ScrollTrigger.refresh(); window.scrollTo(0, y); }
  }

  /* ── Boot ────────────────────────────────────────────── */
  applyLang();
  layout();
  if (isStatic && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) setCurrent(stations.findIndex((s) => s.el === e.target));
    }), { rootMargin: "-45% 0px -45% 0px" });
    stations.forEach((s) => io.observe(s.el));
  }
  if (!hasGsap) {
    root.classList.add("static");
    console.error("how-ai-works: GSAP failed to load; showing static version.");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  buildTimelines();
  introPlay();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!isStatic) rebuild(); });
  let lastW = innerWidth, rt = 0;
  addEventListener("resize", () => {
    layout();
    if (!isStatic && master) render(lastZcam);
    if (innerWidth === lastW) return;
    lastW = innerWidth;
    clearTimeout(rt);
    rt = setTimeout(rebuild, 250);
  });
})();
