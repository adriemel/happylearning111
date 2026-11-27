/*
 * Per-station choreography while the camera dwells at a station.
 * main(tl, el, ctx) adds tweens to the station's scrubbed timeline.
 * Time unit = one text step (step i starts at i).
 * staticProgress / static(): state shown in static (reduced-motion) mode.
 */
(function () {
  "use strict";
  const A = window.AIX;
  const W = A.widgets;
  const q = (el, s) => [...el.querySelectorAll(s)];
  const prog = (tl, fn, at, dur) => { const o = { p: 0 }; tl.to(o, { p: 1, duration: dur, onUpdate: () => fn(o.p) }, at); };

  A.story = {
    intro: {
      main(tl, el) {
        const chars = q(el, "#introTyped .ch");
        tl.to(chars, { opacity: 1, duration: 0.01, stagger: 0.7 / Math.max(1, chars.length) }, 0.05);
        tl.to("#enterKey", { color: "#ff3fa4", borderColor: "#ff3fa4", boxShadow: "0 0 18px rgba(255,63,164,.6)", duration: 0.1 }, 0.85);
        tl.fromTo("#sysCard", { autoAlpha: 0, y: -18, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3 }, 1.05);
        tl.to("#introBody", { boxShadow: "inset 0 0 0 2px rgba(180,107,255,.8), 0 0 40px rgba(180,107,255,.5)", duration: 0.25 }, 1.45);
      },
    },

    llm: {
      main(tl, el) {
        const msg = el.querySelector("#llmMsg");
        tl.fromTo(msg, { autoAlpha: 0, y: 40, scale: 1.15 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3 }, 0.05);
        // the question flies into the box
        tl.to(msg, { y: () => -el.querySelector(".world").clientHeight * 0.45, scale: 0.2, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 0.55);
        tl.fromTo(el.querySelector(".llm-face"), { boxShadow: "0 0 40px rgba(180,107,255,.55)" },
          { boxShadow: "0 0 90px rgba(255,63,164,.9), 0 0 200px rgba(180,107,255,.6)", duration: 0.2, yoyo: true, repeat: 1 }, 1.0);
        tl.to(el.querySelector(".llm-portal"), { opacity: 1, duration: 0.6 }, 1.2);
        tl.to(q(el, ".llm-face b, .llm-face small"), { opacity: 0.25, duration: 0.4 }, 1.5);
      },
    },

    tokens: {
      main(tl, el) {
        const row = el.querySelector("#tokRow");
        const chips = q(row, ".chip");
        // the words come in from behind the camera, still glued together
        tl.fromTo(row, { "--gap": "0em" }, { "--gap": "0.45em", duration: 0.35, ease: "power2.inOut" }, 0.6);
        tl.from(q(row, ".chip-txt"), { autoAlpha: 0, scale: 3, y: 40, duration: 0.35, stagger: 0.025, ease: "power2.out" }, 0.05);
        tl.from(q(row, ".chip-bg"), { autoAlpha: 0, scaleX: 0.5, duration: 0.3, stagger: 0.02 }, 0.65);
        tl.from(q(row, ".chip-id"), { autoAlpha: 0, y: -10, duration: 0.3, stagger: 0.025 }, 1.05);
        tl.to(q(row, ".chip-txt"), { opacity: 0.6, duration: 0.3 }, 1.4);
        const subs = chips.filter((c) => c.dataset.sub === "1");
        tl.to(subs.map((c) => c.querySelector(".chip-bg")), { boxShadow: "0 0 26px rgba(255,210,63,.9)", borderColor: "#ffd23f", duration: 0.2 }, 2.05);
        tl.to(subs, { y: -8, duration: 0.15, yoyo: true, repeat: 1, stagger: 0.05 }, 2.1);
      },
    },

    embed: {
      main(tl) { prog(tl, W.emb.render, 0.05, 1.85); },
      static() { W.emb.render(1); },
    },

    space: {
      main(tl) {
        const E = W.embed;
        prog(tl, (p) => { E.appear = p; E.request(); }, 0.02, 0.45);
        prog(tl, (p) => { E.links = p; E.request(); }, 1.0, 0.35);
        prog(tl, (p) => { E.scrollYaw = p * Math.PI * 1.1; E.request(); }, 0, 3);
      },
      static() { W.embed.appear = 1; W.embed.links = 1; W.embed.request(); },
    },

    attention: {
      main(tl, el) {
        tl.from(el.querySelector(".att-arcs"), { autoAlpha: 0, y: 16, duration: 0.3 }, 0.1);
        tl.from(q(el, ".att-axis"), { autoAlpha: 0, duration: 0.2 }, 0.95);
        tl.from(q(el, '[data-row="h"]'), { autoAlpha: 0, duration: 0.15 }, 0.95);
        const n = A.data.words.de.length;
        for (let r = 0; r < n; r++) tl.from(q(el, `#attMatrix [data-row="${r}"]`), { autoAlpha: 0, x: -10, duration: 0.12, stagger: 0.015 }, 1.05 + r * 0.1);
        tl.from(q(el, "#attHeads button, .att-note"), { autoAlpha: 0, y: 10, duration: 0.2, stagger: 0.06 }, 2.0);
        tl.to(q(el, '.rlab[data-r="7"], #attTokens button[data-i="7"]'), { scale: 1.12, duration: 0.15, yoyo: true, repeat: 1 }, 2.1);
      },
    },

    layers: {
      main(tl, el, ctx) {
        prog(tl, W.tunnel.update, 0, ctx.N);
        tl.to(q(el, ".blk"), { boxShadow: "0 0 28px currentColor", duration: 0.3 }, 0.3);
        tl.to(q(el, ".plus"), { scale: 1.6, duration: 0.2, yoyo: true, repeat: 1 }, 2.05);
        tl.to(q(el, ".beams i"), { scale: 1.8, duration: 0.2, yoyo: true, repeat: 1 }, 2.2);
      },
      staticProgress: 0,
      static() { W.tunnel.update(0); },
    },

    softmax: {
      main(tl, el) {
        const rows = q(el, ".smx-vecs .erow");
        tl.from(rows, { autoAlpha: 0, x: -30, duration: 0.25, stagger: 0.05 }, 0.05);
        tl.to(rows.slice(0, -1), { opacity: 0.25, duration: 0.25 }, 0.55);
        tl.from(q(el, ".smx-vecs .tag, .smx-unembed"), { autoAlpha: 0, y: -8, duration: 0.2, stagger: 0.1 }, 0.6);
        tl.to(el.querySelector(".smx-unembed .arrow"), { y: 8, duration: 0.12, yoyo: true, repeat: 3 }, 0.75);
        tl.to(el.querySelector(".smx-a"), { autoAlpha: 0, y: 60, scale: 0.85, duration: 0.25 }, 1.0);
        tl.to(el.querySelector(".smx-b"), { autoAlpha: 1, duration: 0.2 }, 1.1);
        tl.from(q(el, ".srow"), { autoAlpha: 0, x: -20, duration: 0.15, stagger: 0.03 }, 1.12);
        tl.from(q(el, ".lbar"), { scaleX: 0, duration: 0.25, stagger: 0.03 }, 1.2);
        tl.to(q(el, ".lbar, .zero, .vl, .h-logit"), { autoAlpha: 0, duration: 0.2 }, 1.6);
        tl.to(q(el, ".pwrap"), { scaleX: 1, duration: 0.3, stagger: 0.03, ease: "power2.out" }, 1.65);
        tl.to(q(el, ".vp, .h-prob"), { autoAlpha: 1, duration: 0.2 }, 1.75);
        tl.from(q(el, ".smx-ctrl, .smx-drawn, .smx-formula"), { autoAlpha: 0, y: 12, duration: 0.2, stagger: 0.06 }, 2.0);
      },
    },

    loop: {
      main(tl) { prog(tl, W.ff.render, 0.05, 2.6); },
      static() { W.ff.render(1); },
    },

    outro: {
      main(tl, el) {
        const chars = q(el, "#answerText .ch");
        tl.to(chars, { opacity: 1, duration: 0.01, stagger: 0.8 / Math.max(1, chars.length) }, 0.05);
        tl.to(el.querySelector(".outro-extra"), { autoAlpha: 1, duration: 0.2 }, 1.2);
      },
    },
  };
})();
