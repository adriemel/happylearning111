/*
 * Generic engine: i18n, layer injection from scenes.js, scroll track,
 * camera (enter / main / exit) timelines, chapter nav, motion toggle.
 * Scene-specific motion lives in story.js, widgets in widgets.js.
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
    $$("[data-steps]").forEach((el) => {
      el.innerHTML = (t(el.dataset.steps) || []).map((s) => `<p class="step">${s}</p>`).join("");
    });
    $$("[data-split]").forEach(splitWords);
    splitChars($("#introTyped"), t("prompt"));
    splitChars($("#answerText"), t("loop.answer"));
    t("loop.rings").forEach((r, i) => { $("#ringT" + i).textContent = r; });
    $("#srcList").innerHTML = t("loop.src").map((s) => `<li>${esc(s)}</li>`).join("");
    $$(".seg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    $("#motionBtn").textContent = isStatic ? t("ui.motionOff") : t("ui.motionOn");
    buildNav();
    A.widgets.build(lang, dict());
  }

  /* ── Scenes, layers, track ───────────────────────────── */
  const defs = A.scenes.list.filter((d) => $(`[data-scene="${d.id}"]`));
  const track = $("#track");
  const beats = [];
  defs.forEach((d) => {
    const el = $(`[data-scene="${d.id}"]`);
    el.style.setProperty("--accent", d.accent || "var(--lime)");
    const back = $(".layers.back", el), front = $(".layers.front", el);
    (d.layers || []).forEach((L) => {
      const div = document.createElement("div");
      div.className = "layer";
      div.dataset.depth = String(L.depth ?? 0);
      if (L.fit) div.dataset.fit = L.fit;
      const inner = document.createElement("div");
      inner.className = "layer-inner";
      if (L.opacity != null) inner.style.opacity = String(L.opacity);
      const img = document.createElement("img");
      img.src = L.src; img.alt = ""; img.decoding = "async";
      inner.appendChild(img); div.appendChild(inner);
      (L.front ? front : back).appendChild(div);
    });
    const beat = document.createElement("div");
    beat.className = "beat";
    beat.dataset.scene = d.id;
    beat.style.height = Math.max(160, d.beat || 300) + "vh";
    track.appendChild(beat);
    beats.push(beat);
  });

  /* ── Chapter nav ─────────────────────────────────────── */
  const nav = $("#chapters");
  function buildNav() {
    const names = t("chapters") || [];
    const cur = nav.querySelector('[aria-current="step"]');
    const curIdx = cur ? +cur.dataset.i : 0;
    nav.innerHTML = defs.map((d, i) => `<button type="button" data-i="${i}"${i === curIdx ? ' aria-current="step"' : ""}><span>${esc(names[i] || d.id)}</span><i></i></button>`).join("");
  }
  nav.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]");
    if (!b) return;
    const i = +b.dataset.i;
    const target = isStatic ? $(`[data-scene="${defs[i].id}"]`) : beats[i];
    const y = isStatic ? target.getBoundingClientRect().top + scrollY - 56 : target.offsetTop + (i === 0 ? 0 : 2);
    const smooth = !isStatic && Math.abs(y - scrollY) < innerHeight * 12;
    window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
  });
  function setCurrent(i) {
    $$("button", nav).forEach((b) => (+b.dataset.i === i ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
  }

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
  const kf = (d) => (d + 1) / 2; // depth -1..1 → 0..1

  function makeMain(d, el) {
    const steps = $$(".step", el);
    const N = Math.max(1, steps.length);
    const tl = gsap.timeline({ defaults: { ease: "none" } });
    tl.set({}, {}, N); // fix duration to N
    if (!isStatic) {
      steps.forEach((s, i) => {
        if (!i) return;
        tl.to(steps[i - 1], { opacity: 0, y: -14, duration: 0.22 }, i - 0.2);
        tl.fromTo(s, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.22 }, i - 0.02);
      });
      const cam = d.camera || {};
      $$(".layer", el).forEach((l) => {
        const k = kf(+l.dataset.depth);
        tl.fromTo(l.firstElementChild, { scale: 1, xPercent: 0, yPercent: 0 }, {
          scale: 1 + (cam.scale || 0) * (0.25 + k), xPercent: (cam.x || 0) * (0.5 + k) * 2,
          yPercent: (cam.y || 0) * (0.5 + k) * 2 - (k - 0.5) * 4, duration: N,
        }, 0);
      });
    }
    const s = A.story[d.id];
    if (s && s.main) s.main(tl, el, { N, lang });
    return tl;
  }

  function addEnter(tl, el, at, dur) {
    const words = $$(".headline .wi", el);
    tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur * 0.45 }, at + dur * 0.3);
    $$(".layer", el).forEach((l) => {
      const k = kf(+l.dataset.depth);
      tl.fromTo(l, { scale: 1 - 0.3 * k - 0.05 }, { scale: 1, duration: dur, ease: "power1.out" }, at);
    });
    tl.fromTo($(".world", el), { scale: 0.45, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: dur * 0.75, ease: "power2.out" }, at + dur * 0.25);
    tl.fromTo($(".copy", el), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: dur * 0.35 }, at + dur * 0.55);
    tl.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: dur * 0.3, stagger: dur * 0.03, ease: "power2.out" }, at + dur * 0.6);
  }
  function addExit(tl, el, at, dur) {
    $$(".layer", el).forEach((l) => {
      const k = kf(+l.dataset.depth);
      tl.to(l, { scale: 1 + 1.8 * k * k + 0.08, autoAlpha: k > 0.7 ? 0 : 1, duration: dur, ease: "power1.in" }, at);
    });
    tl.to($(".world", el), { scale: 2.8, autoAlpha: 0, duration: dur * 0.8, ease: "power2.in" }, at);
    tl.to($(".copy", el), { autoAlpha: 0, y: -50, duration: dur * 0.35 }, at);
    tl.to(el, { autoAlpha: 0, duration: dur * 0.45 }, at + dur * 0.45);
  }

  let gctx = null;
  function buildTimelines() {
    gctx = gsap.context(() => {
      defs.forEach((d, i) => {
        const el = $(`[data-scene="${d.id}"]`);
        const main = makeMain(d, el);
        if (isStatic) {
          const s = A.story[d.id] || {};
          main.progress(s.staticProgress ?? 1).pause();
          if (s.static) s.static();
          return;
        }
        const beatVh = Math.max(160, d.beat || 300);
        const E = 1, M = (beatVh - 100) / 100, X = 1;
        const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
        if (i > 0) addEnter(tl, el, 0, E);
        main.duration(M);
        tl.add(main, E);
        if (i < defs.length - 1) addExit(tl, el, E + M, X);
        else tl.set({}, {}, E + M + X);
        ScrollTrigger.create({
          trigger: beats[i], start: "top bottom", end: "bottom top",
          animation: tl, scrub: 0.6,
          onToggle: (st) => el.classList.toggle("live", st.isActive),
        });
        ScrollTrigger.create({
          trigger: beats[i], start: "top 50%", end: "bottom 50%",
          onToggle: (st) => { if (st.isActive) setCurrent(i); },
        });
      });
      if (!isStatic) {
        ScrollTrigger.create({
          start: 0, end: "max",
          onUpdate: (st) => gsap.set("#progressBar", { scaleX: st.progress }),
        });
      }
    });
  }

  function introPlay() {
    if (isStatic) return;
    const el = $("#sc-intro");
    gsap.timeline({ delay: 0.15 })
      .from($$(".headline .wi", el), { yPercent: 115, duration: 0.9, stagger: 0.06, ease: "power3.out" })
      .from($$(".kicker, .steps, .scroll-cue", el), { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.1 }, 0.35)
      .from($(".chatwin", el), { autoAlpha: 0, y: 40, scale: 0.94, duration: 0.9, ease: "power3.out" }, 0.25);
  }

  function rebuild() {
    const y = scrollY;
    if (gctx) gctx.revert();
    applyLang();
    buildTimelines();
    if (!isStatic) { ScrollTrigger.refresh(); window.scrollTo(0, y); }
  }

  /* ── Boot ────────────────────────────────────────────── */
  applyLang();
  if (isStatic && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) setCurrent(defs.findIndex((d) => d.id === e.target.dataset.scene));
    }), { rootMargin: "-45% 0px -45% 0px" });
    $$(".scene").forEach((s) => io.observe(s));
  }
  if (!hasGsap) {
    // GSAP missing: fall back to the readable static document.
    root.classList.add("static");
    console.error("how-ai-works: GSAP failed to load; showing static version.");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  buildTimelines();
  introPlay();
  // Fonts and width changes alter text metrics (chip offsets, arcs): rebuild the timelines.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!isStatic) rebuild(); });
  let lastW = innerWidth, rt = 0;
  addEventListener("resize", () => {
    if (innerWidth === lastW) return;
    lastW = innerWidth;
    clearTimeout(rt);
    rt = setTimeout(rebuild, 250);
  });
})();
