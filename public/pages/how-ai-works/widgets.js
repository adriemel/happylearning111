/*
 * Interactive, data-driven pieces. No scroll logic here: story.js animates
 * the DOM these builders create. Rebuilt on language change via build(lang).
 */
(function () {
  "use strict";
  const A = window.AIX;
  const D = A.data;
  const W = (A.widgets = {});
  const $ = (s, r = document) => r.querySelector(s);
  const CHIP_COLORS = ["var(--cyan)", "var(--lime)", "var(--violet)", "var(--orange)", "var(--pink)", "var(--green)", "var(--yellow)", "var(--blue)"];

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const spaceMark = (t) => esc(t).replace(/^ /, '<span class="sp">␣</span>');
  const fmt = (lang, n, d = 0) => n.toLocaleString(lang === "de" ? "de-DE" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  W.esc = esc;
  W.fmt = fmt;

  // Deterministic PRNG (mulberry32) so tables look the same on every load.
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Diverging color for a value in [-1, 1].
  const cellColor = (v) => {
    const pct = Math.round(Math.min(1, Math.abs(v)) * 85 + 10);
    return `color-mix(in srgb, var(${v < 0 ? "--neg" : "--pos"}) ${pct}%, var(--bg))`;
  };

  W.softmax = function (z, T = 1) {
    const m = Math.max(...z.map((v) => v / T));
    const e = z.map((v) => Math.exp(v / T - m));
    const s = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / s);
  };

  /* ── Tools: JSON bubbles ─────────────────────────────── */
  function jsonHTML(obj) {
    return esc(JSON.stringify(obj, null, 2))
      .replace(/&quot;([^&]+)&quot;(?=:)/g, '<span class="k">"$1"</span>')
      .replace(/: &quot;([^&]*)&quot;/g, ': <span class="s">"$1"</span>')
      .replace(/: (-?\d+(\.\d+)?)/g, ': <span class="n">$1</span>');
  }
  function buildTools() {
    const args = Object.entries(D.toolCall.input).map(([k, v]) => `${k}=<span class="s">"${esc(v)}"</span>`).join(", ");
    const res = Object.entries(D.toolResult).filter(([k]) => k !== "date").map(([k, v]) => `<span class="k">${esc(k)}</span>: <span class="n">${esc(v)}</span>`).join(", ");
    $("#bCall").innerHTML = `<span class="bf">${jsonHTML({ type: "tool_use", ...D.toolCall })}</span><span class="bc">${esc(D.toolCall.name)}(${args})</span>`;
    $("#bRes").innerHTML = `<span class="bf">${jsonHTML({ type: "tool_result", content: D.toolResult })}</span><span class="bc">{ ${res} }</span>`;
  }

  /* ── Tokens ──────────────────────────────────────────── */
  const chip = (t, id, i) =>
    `<span class="chip" style="--c:${CHIP_COLORS[i % CHIP_COLORS.length]}"><span class="chip-t"><span class="chip-bg"></span><span class="chip-txt">${spaceMark(t)}</span></span><span class="chip-id">${id}</span></span>`;
  function buildTokens(lang) {
    $("#tokRow").innerHTML = D.tokens[lang].map((k, i) => chip(k.t, k.id, i)).join("");
    const r = D.rare[lang];
    $("#tokRareWord").textContent = r.word;
    $("#tokRare").innerHTML = r.parts.map(([t, id], i) => chip(t, id, i + 3)).join("");
  }

  /* ── Embeddings: lookup table + vector ──────────────── */
  function buildEmbedLookup(lang, T) {
    const tok = D.tokens[lang][D.embedToken[lang]];
    const r = rng(7);
    const rowIds = [0, 1, 2, null, tok.id - 1, tok.id, tok.id + 1, null, 99999];
    let html = `<div class="elabel">${esc(T.table)} · ${esc(T.rows)}</div>`;
    for (const id of rowIds) {
      if (id === null) { html += '<div class="dots">⋮</div>'; continue; }
      const hit = id === tok.id;
      let cells = "";
      for (let c = 0; c < 10; c++) {
        const v = hit ? (D.vectorPreview[c] ?? r() * 2 - 1) : r() * 2 - 1;
        cells += `<i style="--cell:${cellColor(v)}"></i>`;
      }
      html += `<div class="erow${hit ? " hit" : ""}"><span>${fmt(lang, id)}</span>${cells}</div>`;
    }
    $("#embTable").innerHTML = html;
    const rest = D.gpt3.dModel - D.vectorPreview.length;
    $("#embVec").innerHTML =
      `<span class="vtok">${spaceMark(tok.t)} <small class="vmore">#${fmt(lang, tok.id)}</small></span>` +
      `<div class="vcells">${D.vectorPreview.map((v) => `<span class="vcell" style="--cell:${cellColor(v)}">${v >= 0 ? "+" : "−"}${fmt(lang, Math.abs(v), 2)}</span>`).join("")}</div>` +
      `<span class="vmore">… ${fmt(lang, rest)} ${esc(T.more)} (d = ${fmt(lang, D.gpt3.dModel)})</span>`;
    $("#embLegend").innerHTML = Object.entries(D.embedGroups)
      .map(([g, c]) => `<li style="--c:${c}">${esc(T.groups[g])}</li>`).join("");
  }

  /* ── Embeddings: 3D canvas (manual projection, no WebGL needed) ── */
  const E = (W.embed = { yaw: 0.5, pitch: -0.32, scrollYaw: 0, appear: 0, lang: "de", _raf: 0 });
  E.request = function () {
    if (E._raf) return;
    E._raf = requestAnimationFrame(() => { E._raf = 0; E.render(); });
  };
  E.render = function () {
    const cv = $("#embCanvas");
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    }
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const a = Math.max(0, Math.min(1, E.appear));
    if (a <= 0) return;
    const yaw = E.yaw + E.scrollYaw, pitch = E.pitch;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const R = Math.min(w, h) * 0.42, cx0 = w / 2, cy0 = h / 2;
    const proj = ([x, y, z]) => {
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      const y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      const s = 2.8 / (2.8 - z2);
      return { x: cx0 + x1 * s * R, y: cy0 - y1 * s * R, s, z: z2 };
    };
    // axes
    ctx.lineWidth = 1;
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach((ax) => {
      const p0 = proj(ax.map((v) => -v)), p1 = proj(ax);
      ctx.strokeStyle = `rgba(228,221,212,${0.12 * a})`;
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    });
    const pts = D.embedPoints.map((p) => ({ ...p, q: proj(p.p) })).sort((m, n) => m.q.z - n.q.z);
    // dashed links from the focus word to its two nearest neighbours
    const f = pts.find((p) => p.focus);
    if (f) {
      const near = pts.filter((p) => p !== f)
        .map((p) => ({ p, d: Math.hypot(...p.p.map((v, i) => v - f.p[i])) }))
        .sort((m, n) => m.d - n.d).slice(0, 2);
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = `rgba(255,138,46,${0.8 * a})`;
      near.forEach(({ p }) => { ctx.beginPath(); ctx.moveTo(f.q.x, f.q.y); ctx.lineTo(p.q.x, p.q.y); ctx.stroke(); });
      ctx.setLineDash([]);
    }
    ctx.font = `500 ${Math.max(10, Math.min(13, w / 50))}px "DM Mono", monospace`;
    ctx.textBaseline = "middle";
    for (const p of pts) {
      const col = D.embedGroups[p.g];
      const r = (p.focus ? 7 : 4.5) * p.q.s * a;
      ctx.globalAlpha = a * (0.45 + 0.55 * (p.q.z + 1) / 2);
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(p.q.x, p.q.y, r, 0, Math.PI * 2); ctx.fill();
      if (p.focus) {
        ctx.strokeStyle = col; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.q.x, p.q.y, r + 6, 0, Math.PI * 2); ctx.stroke();
      }
      if (a > 0.5) {
        ctx.fillStyle = p.focus ? "#ffffff" : "rgba(228,221,212,0.85)";
        ctx.fillText(p[E.lang], p.q.x + r + 5, p.q.y);
      }
    }
    ctx.globalAlpha = 1;
  };
  function bindEmbedDrag() {
    const cv = $("#embCanvas");
    let drag = null;
    cv.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", (e) => {
      if (!drag) return;
      E.yaw += (e.clientX - drag.x) * 0.01;
      E.pitch = Math.max(-1.2, Math.min(1.2, E.pitch + (e.clientY - drag.y) * 0.006));
      drag = { x: e.clientX, y: e.clientY };
      E.request();
    });
    const end = () => { drag = null; };
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointercancel", end);
    // keyboard: arrows rotate
    cv.tabIndex = 0;
    cv.addEventListener("keydown", (e) => {
      const k = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }[e.key];
      if (!k) return;
      e.preventDefault();
      E.yaw += k[0]; E.pitch = Math.max(-1.2, Math.min(1.2, E.pitch + k[1])); E.request();
    });
    new ResizeObserver(() => E.request()).observe(cv);
  }

  /* ── Transformer tunnel ──────────────────────────────── */
  const TUN = (W.tunnel = { labels: [1, 2, 3, 4, 5, "…", 94, 95, 96], gap: 420, planes: [] });
  function buildTunnel(T) {
    const cam = $("#tunCam");
    cam.innerHTML = TUN.labels.map((l) =>
      l === "…"
        ? `<div class="plane gap"><span class="ptag">… ${esc(T.layer)} 6 – 93 …</span></div>`
        : `<div class="plane"><span class="ptag">${esc(T.layer)} ${l}</span><div class="pbody"><div class="blk a">${esc(T.attn)}</div><span class="plus">+</span><div class="blk m">${esc(T.mlp)}</div></div><div class="beams"><i></i><i></i><i></i><i></i><i></i></div></div>`
    ).join("");
    TUN.planes = [...cam.children];
    TUN.update(TUN.p || 0);
  }
  TUN.update = function (p) {
    TUN.p = p;
    const n = TUN.planes.length, g = TUN.gap, start = 300;
    const travel = (n - 1) * g + start - 160;
    const cam = p * travel;
    TUN.planes.forEach((el, i) => {
      const z = cam - (i * g + start);
      let o = 1;
      if (z > 420) o = Math.max(0, 1 - (z - 420) / 200);   // passing the camera
      if (z < -4 * g) o = Math.max(0, 1 + (z + 4 * g) / g); // far away
      el.style.transform = `translateZ(${z.toFixed(1)}px)`;
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o < 0.01 ? "hidden" : "visible";
    });
    // HUD: which layer is the camera at (interpolated across the gap plane)
    const k = Math.max(0, Math.min(n - 1, (cam - start + 420) / g));
    const i0 = Math.floor(k), fr = k - i0;
    const val = (i) => (TUN.labels[i] === "…" ? 49 : TUN.labels[i]);
    const a = val(i0), b = val(Math.min(n - 1, i0 + 1));
    const no = Math.round(a + (b - a) * fr);
    const hud = $("#layerNo");
    if (hud) hud.textContent = String(Math.max(1, Math.min(96, no)));
  };

  /* ── Attention ───────────────────────────────────────── */
  const ATT = (W.attention = { head: 0, sel: null, lang: "de" });
  ATT.weights = function (h) {
    const toks = D.tokens[ATT.lang], head = D.heads[h];
    return toks.map((q, qi) => {
      const raw = toks.slice(0, qi + 1).map((k, ki) => head.score(q, k, qi, ki));
      const p = W.softmax(raw);
      return toks.map((_, ki) => (ki <= qi ? p[ki] : null));
    });
  };
  function buildAttention(lang, T) {
    ATT.lang = lang;
    const toks = D.tokens[lang], n = toks.length;
    if (ATT.sel === null || ATT.sel >= n) ATT.sel = n - 1;
    $("#attHeads").innerHTML = T.heads.map((h, i) => `<button type="button" data-h="${i}">${esc(h)}</button>`).join("");
    $("#attHeads").setAttribute("aria-label", T.heads.length + " heads");
    const tokEl = $("#attTokens");
    tokEl.style.setProperty("--n", n);
    tokEl.setAttribute("aria-label", T.pick);
    tokEl.innerHTML = toks.map((k, i) => `<button type="button" data-i="${i}">${spaceMark(k.t)}</button>`).join("");
    const m = $("#attMatrix");
    m.style.setProperty("--n", n);
    let html = `<span class="lab" data-row="h"></span>` + toks.map((k) => `<span class="lab" data-row="h">${spaceMark(k.t)}</span>`).join("");
    toks.forEach((q, qi) => {
      html += `<span class="lab rlab" data-row="${qi}" data-r="${qi}">${spaceMark(q.t)}</span>`;
      toks.forEach((_, ki) => {
        html += ki <= qi
          ? `<span class="cell" data-row="${qi}" data-r="${qi}" data-c="${ki}"><i class="fill"></i><span></span></span>`
          : `<span class="cell mask" data-row="${qi}"></span>`;
      });
    });
    m.innerHTML = html;
    ATT.update();
  }
  ATT.update = function () {
    const w = ATT.weights(ATT.head), lang = ATT.lang;
    document.querySelectorAll("#attHeads button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.h === ATT.head)));
    document.querySelectorAll("#attTokens button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.i === ATT.sel)));
    document.querySelectorAll("#attMatrix .cell:not(.mask)").forEach((c) => {
      const v = w[+c.dataset.r][+c.dataset.c];
      c.style.setProperty("--w", (0.08 + 0.92 * v).toFixed(3));
      c.lastElementChild.textContent = fmt(lang, v, 2).replace(/^0(?=[.,])/, "");
      c.classList.toggle("row-sel", +c.dataset.r === ATT.sel);
    });
    document.querySelectorAll("#attMatrix .rlab").forEach((l) => l.classList.toggle("row-sel", +l.dataset.r === ATT.sel));
    ATT.drawArcs(w[ATT.sel]);
  };
  ATT.drawArcs = function (row) {
    const svg = $("#attArcs"), box = svg.parentElement;
    const btns = [...document.querySelectorAll("#attTokens button")];
    if (!btns.length || !row) return;
    const bw = box.clientWidth, bh = svg.clientHeight || 60;
    svg.setAttribute("viewBox", `0 0 ${bw} ${bh}`);
    const cx = (b) => b.offsetLeft + b.offsetWidth / 2;
    const x0 = cx(btns[ATT.sel]);
    svg.innerHTML = row.map((v, i) => {
      if (v === null) return "";
      const x1 = cx(btns[i]);
      const hgt = i === ATT.sel ? bh * 0.5 : Math.min(bh * 0.95, 18 + Math.abs(x1 - x0) * 0.45);
      const d = i === ATT.sel
        ? `M${x0 - 8} ${bh} C ${x0 - 22} ${bh - hgt}, ${x0 + 22} ${bh - hgt}, ${x0 + 8} ${bh}`
        : `M${x0} ${bh} Q ${(x0 + x1) / 2} ${bh - hgt * 2} ${x1} ${bh}`;
      return `<path d="${d}" stroke-width="${(1 + 9 * v).toFixed(2)}" opacity="${(0.2 + 0.8 * v).toFixed(2)}"/>`;
    }).join("");
  };
  function bindAttention() {
    $("#attHeads").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-h]");
      if (b) { ATT.head = +b.dataset.h; ATT.update(); }
    });
    $("#attTokens").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]");
      if (b) { ATT.sel = +b.dataset.i; ATT.update(); }
    });
    new ResizeObserver(() => ATT.update()).observe($("#attTokens"));
  }

  /* ── Softmax ─────────────────────────────────────────── */
  const SMX = (W.smx = { T: 1, counts: {}, lang: "de", tr: null });
  const ZMIN = -4, ZMAX = 5;
  function buildSoftmax(lang, T) {
    SMX.lang = lang; SMX.tr = T;
    const L = D.logits[lang];
    const zero = ((0 - ZMIN) / (ZMAX - ZMIN)) * 100;
    $("#smxBars").innerHTML = L.map(([t, z], i) => {
      const w = (Math.abs(z) / (ZMAX - ZMIN)) * 100;
      const left = z >= 0 ? zero : zero - w;
      return `<div class="srow" data-i="${i}"><span class="lbl">${spaceMark(t)}</span>` +
        `<span class="track" style="--zero:${zero}%"><i class="zero"></i>` +
        `<i class="lbar" style="left:${left}%;width:${w}%;--origin:${z >= 0 ? "0%" : "100%"}"></i>` +
        `<span class="pwrap"><i class="pbar"></i></span></span>` +
        `<span class="val"><span class="vl">${z >= 0 ? "+" : "−"}${fmt(lang, Math.abs(z), 1)}</span><span class="vp"></span></span></div>`;
    }).join("");
    SMX.counts = {};
    SMX.update();
    SMX.renderDrawn();
    $("#smxSlot").textContent = "▁";
  }
  SMX.probs = () => W.softmax(D.logits[SMX.lang].map((r) => r[1]), SMX.T);
  SMX.update = function () {
    const p = SMX.probs();
    document.querySelectorAll("#smxBars .srow").forEach((row, i) => {
      row.querySelector(".pbar").style.setProperty("--p", p[i].toFixed(4));
      row.querySelector(".vp").textContent = fmt(SMX.lang, p[i] * 100, p[i] < 0.001 ? 2 : 1) + " %";
    });
    $("#tOut").value = fmt(SMX.lang, SMX.T, 2);
  };
  SMX.renderDrawn = function () {
    const L = D.logits[SMX.lang];
    const parts = Object.entries(SMX.counts).sort((a, b) => b[1] - a[1])
      .map(([i, c]) => `${esc(L[i][0].trim())} ×${c}`);
    $("#smxDrawn").textContent = parts.length ? parts.join(" · ") : SMX.tr.none;
  };
  SMX.sample = function () {
    const p = SMX.probs();
    let u = Math.random(), i = 0;
    while (i < p.length - 1 && (u -= p[i]) > 0) i++;
    SMX.counts[i] = (SMX.counts[i] || 0) + 1;
    const slot = $("#smxSlot");
    slot.textContent = D.logits[SMX.lang][i][0].trim();
    document.querySelectorAll("#smxBars .srow").forEach((r, k) => r.classList.toggle("hit", k === i));
    SMX.renderDrawn();
    if (window.gsap && !document.documentElement.classList.contains("static")) {
      gsap.fromTo(slot, { scale: 1.35, color: "#ffffff" }, { scale: 1, color: "#f5e642", duration: 0.5, ease: "back.out(2)", clearProps: "color" });
    }
    return i;
  };
  function bindSoftmax() {
    const r = $("#tRange");
    r.addEventListener("input", () => { SMX.T = Math.max(0.1, Math.min(2, parseFloat(r.value) || 1)); SMX.update(); });
    $("#sampleBtn").addEventListener("click", () => SMX.sample());
    $("#resetBtn").addEventListener("click", () => {
      SMX.T = 1; r.value = "1"; SMX.counts = {};
      $("#smxSlot").textContent = "▁";
      document.querySelectorAll("#smxBars .srow").forEach((row) => row.classList.remove("hit"));
      SMX.update(); SMX.renderDrawn();
    });
  }

  /* ── Public API ──────────────────────────────────────── */
  let bound = false;
  W.build = function (lang, dict) {
    buildTools();
    buildTokens(lang);
    buildEmbedLookup(lang, dict.embed);
    E.lang = lang;
    buildTunnel(dict.layers);
    buildAttention(lang, dict.attention);
    buildSoftmax(lang, dict.softmax);
    if (!bound) { bindEmbedDrag(); bindAttention(); bindSoftmax(); bound = true; }
    E.request();
  };
})();
