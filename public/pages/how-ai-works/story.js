/*
 * Per-scene choreography. Each main(tl, el, ctx) adds tweens to the scene's
 * scrubbed main timeline. Time unit = one text step (step i starts at i).
 * staticProgress: which state to show in static (reduced-motion) mode.
 */
(function () {
  "use strict";
  const A = window.AIX;
  const W = A.widgets;
  const q = (el, s) => [...el.querySelectorAll(s)];

  // Joined → separated: chips start shifted together, as if one word.
  function joinOffsets(row) {
    const chips = q(row, ".chip");
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    const n = chips.length;
    return (i) => (-i + (n - 1) / 2) * gap;
  }

  A.story = {
    intro: {
      main(tl, el) {
        const chars = q(el, "#introTyped .ch");
        tl.to(chars, { opacity: 1, duration: 0.01, stagger: 0.75 / Math.max(1, chars.length) }, 0.05);
        tl.to("#enterKey", { color: "#b5f23d", borderColor: "#b5f23d", boxShadow: "0 0 18px rgba(181,242,61,.55)", duration: 0.1 }, 0.9);
        tl.to(el.querySelector(".msg.user"), { boxShadow: "0 0 40px rgba(181,242,61,.45)", duration: 0.3 }, 1.0);
        tl.to(el.querySelector(".scroll-cue"), { autoAlpha: 0, duration: 0.2 }, 0.1);
      },
    },

    harness: {
      main(tl, el) {
        const cards = q(el, ".card");
        const counts = A.data.contextTokens;
        cards.forEach((c, i) => {
          tl.from(c, { autoAlpha: 0, scale: 0.25, yPercent: -160, rotationX: 55, rotationZ: i % 2 ? 8 : -8, duration: 0.42, ease: "power2.out" }, 0.1 + i * 0.42);
        });
        const out = el.querySelector("#ctxCount");
        const lang = document.documentElement.lang;
        const o = { v: 0 };
        let acc = 0;
        counts.forEach((n, i) => {
          acc += n;
          const target = acc;
          tl.to(o, { v: target, duration: 0.3, onUpdate: () => { out.textContent = W.fmt(lang, Math.round(o.v)); } }, 0.3 + i * 0.42);
        });
        tl.from(el.querySelector(".ctx-out"), { autoAlpha: 0, y: -10, duration: 0.25 }, 1.9);
        tl.to(el.querySelector(".ctx-strip"), { boxShadow: "0 0 50px rgba(181,242,61,.35)", duration: 0.3 }, 2.1);
        tl.to(cards, { y: 8, duration: 0.12, stagger: 0.06, yoyo: true, repeat: 1 }, 2.2);
        tl.to(el.querySelector(".ctx-out .arrow"), { y: 10, duration: 0.15, yoyo: true, repeat: 3 }, 2.4);
      },
    },

    tools: {
      main(tl, el) {
        const T = A.i18n.dict().tools;
        const packet = el.querySelector("#packet"), glow = el.querySelector("#packetGlow");
        const label = el.querySelector("#pktLabel");
        const paths = { HL: el.querySelector("#pathHL"), HA: el.querySelector("#pathHA") };
        const place = (path, t, text) => {
          const len = path.getTotalLength();
          const pt = path.getPointAtLength(Math.max(0, Math.min(1, t)) * len);
          packet.setAttribute("cx", pt.x); packet.setAttribute("cy", pt.y);
          glow.setAttribute("cx", pt.x); glow.setAttribute("cy", pt.y);
          label.style.left = (pt.x / 600) * 100 + "%";
          label.style.top = (pt.y / 500) * 100 + "%";
          label.textContent = text;
        };
        const legs = [
          ["HL", false, T.ctx, 0.05, 0.5],
          ["HL", true, T.call, 0.75, 0.45],
          ["HA", false, T.call, 1.25, 0.45],
          ["HA", true, T.result, 1.85, 0.45],
          ["HL", false, T.ctx + " + " + T.result, 2.35, 0.4],
          ["HL", true, T.answer, 2.78, 0.2],
        ];
        place(paths.HL, 0, T.ctx);
        legs.forEach(([p, rev, text, at, dur]) => {
          const o = { t: 0 };
          tl.to(o, { t: 1, duration: dur, onUpdate: () => place(paths[p], rev ? 1 - o.t : o.t, text) }, at);
        });
        const pulse = (sel, at) => tl.to(el.querySelector(sel), { scale: 1.14, duration: 0.1, yoyo: true, repeat: 1 }, at);
        pulse(".n-l", 0.55); pulse(".n-h", 1.2); pulse(".n-a", 1.7); pulse(".n-l", 2.75); pulse(".n-h", 2.98);
        tl.fromTo("#bCall", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.6);
        tl.to("#bCall", { autoAlpha: 0.0, duration: 0.15 }, 1.6);
        tl.fromTo("#bRes", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 1.75);
        tl.to(q(el, ".lp"), { strokeDashoffset: -120, duration: 3 }, 0);
      },
    },

    llm: {
      main(tl, el) {
        tl.from(el.querySelector(".llm-in"), { autoAlpha: 0, x: -40, duration: 0.35 }, 0.05);
        tl.from(q(el, ".mini-bars i"), { scaleY: 0, duration: 0.3, stagger: 0.05 }, 0.45);
        tl.from(el.querySelector(".llm-out small"), { autoAlpha: 0, duration: 0.2 }, 0.45);
        tl.to(el.querySelector(".llm-face"), { rotationY: -108, duration: 0.6, ease: "power2.inOut" }, 1.05);
        tl.from(q(el, ".llm-slabs i"), { scaleX: 0.1, autoAlpha: 0, duration: 0.3, stagger: 0.05 }, 1.25);
        const loop = el.querySelector(".llm-loop path");
        tl.fromTo(loop, { autoAlpha: 0, strokeDashoffset: 60 }, { autoAlpha: 1, strokeDashoffset: 0, duration: 0.5 }, 2.05);
        tl.to(el.querySelector(".llm-ctx"), { color: "#b5f23d", duration: 0.2, yoyo: true, repeat: 1 }, 2.5);
      },
    },

    tokens: {
      main(tl, el) {
        const row = el.querySelector("#tokRow"), rare = el.querySelector("#tokRare");
        const off = joinOffsets(row), offR = joinOffsets(rare);
        tl.from(q(row, ".chip"), { x: off, duration: 0.6, ease: "power2.inOut" }, 0.15);
        tl.from(q(row, ".chip-bg"), { autoAlpha: 0, scaleX: 0.6, duration: 0.4, stagger: 0.05 }, 0.35);
        tl.from(q(row, ".chip-id"), { autoAlpha: 0, y: -14, duration: 0.3, stagger: 0.07 }, 1.05);
        tl.to(q(row, ".chip-txt"), { opacity: 0.55, duration: 0.3 }, 1.3);
        tl.from(el.querySelector(".tok-rare"), { autoAlpha: 0, y: 20, duration: 0.3 }, 1.9);
        tl.from(q(rare, ".chip"), { x: offR, duration: 0.5, ease: "power2.inOut" }, 2.25);
        tl.from(q(rare, ".chip-bg, .chip-id"), { autoAlpha: 0, duration: 0.3, stagger: 0.04 }, 2.4);
      },
    },

    embed: {
      main(tl, el) {
        const E = W.embed;
        tl.from(q(el, "#embTable > *"), { autoAlpha: 0, x: -16, duration: 0.2, stagger: 0.035 }, 0.05);
        tl.to(el.querySelector(".erow.hit"), { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1 }, 0.45);
        tl.from(el.querySelector(".vtok"), { autoAlpha: 0, duration: 0.2 }, 0.55);
        tl.from(q(el, ".vcell"), { autoAlpha: 0, x: -60, duration: 0.25, stagger: 0.04 }, 0.6);
        tl.from(q(el, "#embVec > .vmore"), { autoAlpha: 0, duration: 0.2 }, 0.9);
        tl.to(el.querySelector(".emb-lookup"), { autoAlpha: 0, scale: 0.8, duration: 0.35 }, 1.0);
        tl.to(el.querySelector(".emb-space"), { autoAlpha: 1, duration: 0.3 }, 1.15);
        const o = { a: 0, y: 0 };
        tl.to(o, { a: 1, duration: 0.5, onUpdate: () => { E.appear = o.a; E.request(); } }, 1.15);
        tl.to(o, { y: Math.PI * 1.2, duration: 2.0, onUpdate: () => { E.scrollYaw = o.y; E.request(); } }, 1.0);
      },
      static() { W.embed.appear = 1; W.embed.request(); },
    },

    layers: {
      main(tl, el, ctx) {
        const o = { p: 0 };
        tl.to(o, { p: 1, duration: ctx.N, onUpdate: () => W.tunnel.update(o.p) }, 0);
        tl.to(q(el, ".blk"), { boxShadow: "0 0 28px currentColor", duration: 0.3 }, 1.0);
        tl.to(q(el, ".plus"), { scale: 1.6, duration: 0.2, yoyo: true, repeat: 1 }, 2.05);
        tl.to(q(el, ".beams i"), { scale: 1.8, duration: 0.2, yoyo: true, repeat: 1 }, 2.2);
      },
      staticProgress: 0,
      static() { W.tunnel.update(0); },
    },

    attention: {
      main(tl, el) {
        tl.from(el.querySelector(".att-arcs"), { autoAlpha: 0, y: 16, duration: 0.3 }, 0.1);
        tl.from(q(el, ".att-axis, .att-formula"), { autoAlpha: 0, duration: 0.2 }, 0.95);
        tl.from(q(el, '[data-row="h"]'), { autoAlpha: 0, duration: 0.15 }, 0.95);
        const n = A.data.tokens.de.length;
        for (let r = 0; r < n; r++) {
          tl.from(q(el, `#attMatrix [data-row="${r}"]`), { autoAlpha: 0, x: -10, duration: 0.15, stagger: 0.02 }, 1.05 + r * 0.13);
        }
        tl.from(q(el, "#attHeads button"), { autoAlpha: 0, y: 10, duration: 0.2, stagger: 0.06 }, 2.0);
      },
    },

    softmax: {
      main(tl, el) {
        const rows = q(el, ".srow");
        tl.from(rows, { autoAlpha: 0, x: -20, duration: 0.2, stagger: 0.04 }, 0.1);
        tl.from(q(el, ".lbar"), { scaleX: 0, duration: 0.4, stagger: 0.04 }, 0.35);
        tl.to(q(el, ".lbar, .zero, .vl, .h-logit"), { autoAlpha: 0, duration: 0.25 }, 1.05);
        tl.to(q(el, ".pwrap"), { scaleX: 1, duration: 0.45, stagger: 0.04, ease: "power2.out" }, 1.15);
        tl.to(q(el, ".vp, .h-prob"), { autoAlpha: 1, duration: 0.25 }, 1.3);
        tl.from(q(el, ".smx-ctrl, .smx-drawn, .smx-formula, .smx .note"), { autoAlpha: 0, y: 12, duration: 0.25, stagger: 0.06 }, 2.0);
      },
    },

    loop: {
      main(tl, el) {
        const svg = el.querySelector(".rings");
        tl.fromTo(svg, { scale: 3.2 }, { scale: 1, duration: 1.3, ease: "power2.out" }, 0);
        tl.to(el.querySelector(".r0"), { rotation: 720, svgOrigin: "0 0", duration: 3 }, 0);
        tl.to(el.querySelector(".r1"), { rotation: 360, svgOrigin: "0 0", duration: 3 }, 0);
        tl.to(el.querySelector(".r2"), { rotation: 180, svgOrigin: "0 0", duration: 3 }, 0);
        tl.from(q(el, ".ring text"), { autoAlpha: 0, duration: 0.25, stagger: 0.2 }, 0.9);
        tl.from(el.querySelector(".answer"), { autoAlpha: 0, y: 24, duration: 0.25 }, 2.0);
        const chars = q(el, "#answerText .ch");
        tl.to(chars, { opacity: 1, duration: 0.01, stagger: 0.6 / Math.max(1, chars.length) }, 2.1);
        tl.to(el.querySelector(".outro-extra"), { autoAlpha: 1, duration: 0.2 }, 2.6);
      },
    },
  };
})();
