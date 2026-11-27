/*
 * Interactive, data-driven pieces. No scroll logic here: story.js drives them
 * (render(p) functions are pure functions of progress, so scrubbing works both ways).
 * Rebuilt on language change via build(lang, dict).
 */
(function () {
  "use strict";
  const A = window.AIX;
  const D = A.data;
  const W = (A.widgets = {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CHIP_COLORS = ["var(--cyan)", "var(--magenta)", "var(--yellow)", "var(--violet)", "var(--green)", "var(--orange)", "var(--blue)", "var(--pink)"];

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const spaceMark = (t) => esc(t).replace(/^ /, '<span class="sp">␣</span>');
  const fmt = (lang, n, d = 0) => n.toLocaleString(lang === "de" ? "de-DE" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  W.esc = esc;
  W.fmt = fmt;

  // Deterministic PRNG (mulberry32): the same id always gives the same "vector".
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const vec = (seed, n) => { const r = rng(seed * 7919 + 13); return Array.from({ length: n }, () => r() * 2 - 1); };
  const cellColor = (v) => {
    const pct = Math.round(Math.min(1, Math.abs(v)) * 85 + 10);
    return `color-mix(in srgb, var(${v < 0 ? "--neg" : "--pos"}) ${pct}%, var(--bg))`;
  };
  // Vector rows show the (made-up) numbers on top of the colour cue.
  let curLang = "de";
  const num = (v) => (v < 0 ? "−" : "+") + fmt(curLang, Math.abs(v), 2);
  const cellHTML = (v) => `<i class="${Math.abs(v) > 0.5 ? "dk" : ""}" style="--cell:${cellColor(v)}"><span>${num(v)}</span></i>`;
  const paintCell = (c, v) => {
    c.style.setProperty("--cell", cellColor(v));
    c.classList.toggle("dk", Math.abs(v) > 0.5);
    c.firstElementChild.textContent = num(v);
  };
  const rowHTML = (label, values, cls = "") =>
    `<div class="erow ${cls}"><span class="lab">${label}</span>${values.map(cellHTML).join("")}<span class="more">…</span></div>`;
  const wordSeed = (s) => { let h = 7; for (const ch of s) h = (h * 31 + ch.codePointAt(0)) | 0; return Math.abs(h) % 100000; };
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  W.softmax = function (z, T = 1) {
    const m = Math.max(...z.map((v) => v / T));
    const e = z.map((v) => Math.exp(v / T - m));
    const s = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / s);
  };

  // Schedule helper: items with weights → (p) => { k, phi } (index and local progress).
  function schedule(weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    const starts = [];
    let acc = 0;
    for (const w of weights) { starts.push(acc / total); acc += w; }
    return (p) => {
      p = clamp01(p);
      let k = starts.length - 1;
      while (k > 0 && starts[k] > p) k--;
      const len = weights[k] / total;
      return { k, phi: clamp01((p - starts[k]) / len) };
    };
  }

  /* ── Tokens ──────────────────────────────────────────── */
  function buildTokens(lang) {
    $("#tokRow").innerHTML = D.tokens[lang].map(([t, id], i) => {
      const sub = i > 0 && !t.startsWith(" ") && /\p{L}/u.test(t);
      return `<span class="chip" data-sub="${sub ? 1 : 0}" style="--c:${CHIP_COLORS[i % CHIP_COLORS.length]}">` +
        `<span class="chip-t"><span class="chip-bg"></span><span class="chip-txt">${spaceMark(t)}</span></span>` +
        `<span class="chip-id">${id}</span></span>`;
    }).join("");
  }

  /* ── Embedding matrix browse ─────────────────────────── */
  const EMB = (W.emb = { toks: [], sched: null, lastId: null, lastKey: "" });
  const NC = 5, STACK = 8;
  function buildEmbed(lang, T) {
    EMB.toks = D.tokens[lang];
    EMB.lang = lang;
    EMB.sched = schedule(EMB.toks.map((_, i) => (i < 4 ? 1 : 0.32)));
    $("#emWindow").innerHTML = Array.from({ length: 9 }, () =>
      `<div class="erow"><span class="lab"></span>${"<i><span></span></i>".repeat(NC)}<span class="more">…</span></div>`).join("");
    $("#emStack").innerHTML = '<span class="emb-up" id="emUp"></span>' +
      EMB.toks.map(([t, id]) => rowHTML(spaceMark(t), vec(id, NC))).join("");
    $("#emMore").textContent = `… + ${fmt(lang, D.gpt3.dModel - NC)} ${T.more} (d = ${fmt(lang, D.gpt3.dModel)})`;
    EMB.lastId = null; EMB.lastKey = "";
    EMB.render(EMB.p || 0);
  }
  EMB.paintWindow = function (center, hit) {
    if (center === EMB.lastId && hit === EMB.lastHit) return;
    EMB.lastId = center; EMB.lastHit = hit;
    $$("#emWindow .erow").forEach((row, r) => {
      const id = center + r - 4;
      const lab = row.firstElementChild;
      const cells = row.querySelectorAll("i");
      row.classList.toggle("hit", hit && r === 4);
      if (id < 0 || id >= D.vocabShown) {
        lab.textContent = "";
        row.style.visibility = "hidden";
        return;
      }
      row.style.visibility = "";
      lab.textContent = fmt(EMB.lang, id);
      const v = vec(id, NC);
      cells.forEach((c, j) => paintCell(c, v[j]));
    });
  };
  EMB.render = function (p) {
    EMB.p = p;
    if (!EMB.sched) return;
    const { k, phi } = EMB.sched(p);
    const toks = EMB.toks, n = toks.length;
    const from = k === 0 ? 0 : toks[k - 1][1], to = toks[k][1];
    const roll = clamp01(phi / 0.6);
    EMB.paintWindow(Math.round(from + (to - from) * ease(roll)), roll >= 1);
    const cur = $("#emCur");
    const txt = `${toks[k][0].replace(/^ /, "␣")}  →  #${fmt(EMB.lang, to)}`;
    if (cur.textContent !== txt) cur.textContent = txt;
    // the stack shows the newest STACK rows; older ones scroll away upwards
    const last = p >= 1 ? n - 1 : (phi > 0.7 ? k : k - 1);
    const first = Math.max(0, last - STACK + 1);
    const lit = p < 1 && phi > 0.7 ? k : -1;
    const key = `${first}|${last}|${lit}`;
    if (key === EMB.lastKey) return;
    EMB.lastKey = key;
    $$("#emStack .erow").forEach((row, j) => {
      row.style.display = j >= first && j <= last ? "" : "none";
      row.classList.toggle("lit", j === lit);
    });
    $("#emUp").textContent = first > 0 ? `⋮ +${first}` : "";
  };

  /* ── Meaning space: 3D canvas (manual projection, no WebGL needed) ── */
  const E = (W.embed = { yaw: 0.6, pitch: -0.3, scrollYaw: 0, appear: 0, links: 0, lang: "de", _raf: 0 });
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
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const a = clamp01(E.appear);
    if (a <= 0) return;
    const yaw = E.yaw + E.scrollYaw, pitch = E.pitch;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const R = Math.min(w, h) * 0.44, cx0 = w / 2, cy0 = h / 2;
    const proj = ([x, y, z]) => {
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      const y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      const s = 2.8 / (2.8 - z2);
      return { x: cx0 + x1 * s * R, y: cy0 - y1 * s * R, s, z: z2 };
    };
    // neon grid floor of the space (y = -1)
    ctx.lineWidth = 1;
    for (let i = -4; i <= 4; i++) {
      const v = i / 4;
      ctx.strokeStyle = `rgba(180,107,255,${0.22 * a})`;
      let p0 = proj([v, -0.95, -1]), p1 = proj([v, -0.95, 1]);
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
      p0 = proj([-1, -0.95, v]); p1 = proj([1, -0.95, v]);
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    }
    const pts = D.embedPoints.map((p) => ({ ...p, q: proj(p.p) }));
    const byName = Object.fromEntries(pts.map((p) => [p.de, p]));
    // drop lines to the floor (depth cue)
    pts.forEach((p) => {
      const f = proj([p.p[0], -0.95, p.p[2]]);
      ctx.strokeStyle = `rgba(241,233,255,${0.08 * a})`;
      ctx.beginPath(); ctx.moveTo(p.q.x, p.q.y); ctx.lineTo(f.x, f.y); ctx.stroke();
    });
    if (E.links > 0) {
      ctx.setLineDash([4, 5]); ctx.lineWidth = 1.6;
      ctx.strokeStyle = `rgba(255,210,63,${0.9 * a * E.links})`;
      D.embedLinks.forEach(([m, n]) => {
        const p = byName[m], q = byName[n];
        if (p && q) { ctx.beginPath(); ctx.moveTo(p.q.x, p.q.y); ctx.lineTo(q.q.x, q.q.y); ctx.stroke(); }
      });
      ctx.setLineDash([]);
    }
    ctx.font = `500 ${Math.max(10, Math.min(13, w / 48))}px "DM Mono", monospace`;
    ctx.textBaseline = "middle";
    pts.sort((m, n) => m.q.z - n.q.z).forEach((p) => {
      const col = D.embedGroups[p.g];
      const r = (p.focus ? 6.5 : 4.2) * p.q.s * a;
      ctx.globalAlpha = a * (0.45 + 0.55 * (p.q.z + 1) / 2);
      ctx.shadowColor = col; ctx.shadowBlur = p.focus ? 14 : 6;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(p.q.x, p.q.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      if (p.focus) { ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.q.x, p.q.y, r + 5, 0, Math.PI * 2); ctx.stroke(); }
      if (a > 0.5) { ctx.fillStyle = p.focus ? "#ffffff" : "rgba(241,233,255,0.8)"; ctx.fillText(p[E.lang], p.q.x + r + 5, p.q.y); }
    });
    ctx.globalAlpha = 1;
  };
  function buildSpace(T) {
    $("#embLegend").innerHTML = Object.entries(D.embedGroups).map(([g, c]) => `<li style="--c:${c}">${esc(T.groups[g])}</li>`).join("");
  }
  function bindSpace() {
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
    cv.tabIndex = 0;
    cv.addEventListener("keydown", (e) => {
      const k = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }[e.key];
      if (!k) return;
      e.preventDefault();
      E.yaw += k[0]; E.pitch = Math.max(-1.2, Math.min(1.2, E.pitch + k[1])); E.request();
    });
    new ResizeObserver(() => E.request()).observe(cv);
  }

  /* ── Transformer tunnel: layers as sieves ─────────────── */
  const TUN = (W.tunnel = { labels: [1, 2, 3, 4, 5, "…", 94, 95, 96], gap: 420, planes: [], lastL: -1 });
  // vector of "?" after layer L: drifts from its embedding to its final vector (softmax scene)
  TUN.vecAt = function (L) {
    const t = clamp01((L - 1) / 95), s = t * t * (3 - 2 * t);
    return TUN.a.map((a, j) => Math.max(-0.99, Math.min(0.99,
      a * (1 - s) + TUN.b[j] * s + 0.35 * Math.sin(Math.PI * t) * Math.sin(5 * Math.PI * t + 1.7 * j))));
  };
  function buildTunnel(lang, T) {
    const lastId = D.tokens[lang][D.tokens[lang].length - 1][1];
    TUN.a = vec(lastId, NC);
    TUN.b = vec(lastId + 4242, NC);
    TUN.tr = T;
    const cam = $("#tunCam");
    cam.innerHTML = TUN.labels.map((l) =>
      l === "…"
        ? `<div class="plane gap"><span class="ptag">… ${esc(T.layer)} 6 – 93 …</span></div>`
        : `<div class="plane"><span class="ptag">${esc(T.layer)} ${l}</span><div class="pbody"><div class="blk a">${esc(T.attn)}</div><span class="plus">+</span><div class="blk m">${esc(T.mlp)}</div></div>` +
          `<div class="pvec">${TUN.vecAt(l).map((v) => `<i style="--cell:${cellColor(v)}"></i>`).join("")}</div></div>`
    ).join("");
    TUN.planes = [...cam.children];
    $("#tunVec").innerHTML = `<span class="lab">?</span>${"<i><span></span></i>".repeat(NC)}<span class="more">…</span>`;
    TUN.lastL = -1;
    TUN.update(TUN.p || 0);
  }
  TUN.update = function (p) {
    TUN.p = p;
    const n = TUN.planes.length, g = TUN.gap, start = 300;
    const cam = p * ((n - 1) * g + start - 160);
    TUN.planes.forEach((el, i) => {
      const z = cam - (i * g + start);
      let o = 1;
      if (z > 420) o = Math.max(0, 1 - (z - 420) / 200);
      if (z < -4 * g) o = Math.max(0, 1 + (z + 4 * g) / g);
      el.style.transform = `translateZ(${z.toFixed(1)}px)`;
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o < 0.01 ? "hidden" : ""; // "" inherits: hidden with its station
    });
    const k = Math.max(0, Math.min(n - 1, (cam - start + 420) / g));
    const i0 = Math.floor(k), fr = k - i0;
    const val = (i) => (TUN.labels[i] === "…" ? 49 : TUN.labels[i]);
    const a = val(i0), b = val(Math.min(n - 1, i0 + 1));
    const L = Math.max(1, Math.min(96, Math.round(a + (b - a) * fr)));
    if (L === TUN.lastL) return;
    TUN.lastL = L;
    const hud = $("#layerNo");
    if (hud) hud.textContent = String(L);
    const lab = $("#tunVecLab");
    if (lab && TUN.tr) lab.textContent = `${TUN.tr.vecLabel} ${L}`;
    const v = TUN.vecAt(L);
    $$("#tunVec i").forEach((c, j) => paintCell(c, v[j]));
  };

  /* ── Attention (simplified: spotlight on the sentence + matrix) ── */
  const ATT = (W.attention = { head: 1, sel: null, lang: "de", tr: null });
  ATT.weights = function (h) {
    const ws = D.words[ATT.lang], head = D.heads[h];
    return ws.map((q, qi) => {
      const p = W.softmax(ws.slice(0, qi + 1).map((k, ki) => head.score(q, k, qi, ki)));
      return ws.map((_, ki) => (ki <= qi ? p[ki] : null));
    });
  };
  function buildAttention(lang, T) {
    ATT.lang = lang; ATT.tr = T;
    const ws = D.words[lang], n = ws.length;
    if (ATT.sel === null || ATT.sel >= n) ATT.sel = D.attentionDefault;
    $("#attHeads").innerHTML = T.heads.map((h, i) => `<button type="button" data-h="${i}">${esc(h)}</button>`).join("");
    $("#attHeads").setAttribute("aria-label", T.headsLabel);
    const sent = $("#attSent");
    sent.setAttribute("aria-label", T.pick);
    sent.innerHTML = ws.map((w, i) => `<button type="button" data-i="${i}"><b>${esc(w.t)}</b><small></small></button>`).join("");
    const m = $("#attMatrix");
    m.style.setProperty("--n", n);
    let html = `<span class="corner" data-row="h"></span>` + ws.map((w) => `<span class="chd" data-row="h"><span>${esc(w.t)}</span></span>`).join("");
    ws.forEach((q, qi) => {
      html += `<span class="lab rlab" data-row="${qi}" data-r="${qi}">${esc(q.t)}</span>`;
      ws.forEach((_, ki) => {
        html += ki <= qi
          ? `<span class="cell" data-row="${qi}" data-r="${qi}" data-c="${ki}"><i class="fill"></i><span></span></span>`
          : `<span class="cell mask" data-row="${qi}"></span>`;
      });
    });
    m.innerHTML = html;
    ATT.update();
  }
  ATT.update = function () {
    const w = ATT.weights(ATT.head), ws = D.words[ATT.lang], row = w[ATT.sel];
    $$("#attHeads button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.h === ATT.head)));
    $("#attWho").textContent = ATT.tr.who.replace("{w}", ws[ATT.sel].t);
    $$("#attSent button").forEach((b) => {
      const i = +b.dataset.i, v = row[i];
      b.setAttribute("aria-pressed", String(i === ATT.sel));
      b.classList.toggle("sel", i === ATT.sel);
      b.classList.toggle("future", v === null);
      const small = b.lastElementChild;
      if (v === null) {
        small.textContent = "·";
        b.style.background = ""; b.style.boxShadow = "";
        b.title = ATT.tr.future;
      } else {
        small.textContent = Math.round(v * 100) + " %";
        b.style.background = `rgba(255,107,157,${(0.1 + 0.75 * v).toFixed(3)})`;
        b.style.boxShadow = `0 0 ${(4 + 34 * v).toFixed(0)}px rgba(255,107,157,${(0.15 + 0.85 * v).toFixed(2)})`;
        b.title = "";
      }
    });
    $$("#attMatrix .cell:not(.mask)").forEach((c) => {
      const v = w[+c.dataset.r][+c.dataset.c];
      c.style.setProperty("--w", (0.06 + 0.94 * v).toFixed(3));
      c.lastElementChild.textContent = String(Math.round(v * 100));
      c.classList.toggle("row-sel", +c.dataset.r === ATT.sel);
    });
    $$("#attMatrix .rlab").forEach((l) => l.classList.toggle("row-sel", +l.dataset.r === ATT.sel));
  };
  function bindAttention() {
    $("#attHeads").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-h]");
      if (b) { ATT.head = +b.dataset.h; ATT.update(); }
    });
    $("#attSent").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]");
      if (b) { ATT.sel = +b.dataset.i; ATT.update(); }
    });
  }

  /* ── Softmax ─────────────────────────────────────────── */
  const SMX = (W.smx = { T: 1, counts: {}, lang: "de", tr: null });
  const ZMIN = -4, ZMAX = 5;
  function buildSoftmax(lang, T) {
    SMX.lang = lang; SMX.tr = T;
    const toks = D.tokens[lang].slice(-6);
    $("#smxVecs").innerHTML = toks.map(([t, id], i) =>
      rowHTML(spaceMark(t), vec(id + 4242, NC), i === toks.length - 1 ? "last" : "")).join("") +
      `<span class="tag t-last">↑ ${esc(T.last)}</span><div id="smxNewWrap"></div>`;
    const L = D.logits[lang];
    const zero = ((0 - ZMIN) / (ZMAX - ZMIN)) * 100;
    $("#smxBars").innerHTML = L.map(([t, z], i) => {
      const w = (Math.abs(z) / (ZMAX - ZMIN)) * 100;
      const left = z >= 0 ? zero : zero - w;
      return `<div class="srow" data-i="${i}"><span class="lbl">${esc(t)}</span>` +
        `<span class="track" style="--zero:${zero}%"><i class="zero"></i>` +
        `<i class="lbar" style="left:${left}%;width:${w}%;--origin:${z >= 0 ? "0%" : "100%"}"></i>` +
        `<span class="pwrap"><i class="pbar"></i></span></span>` +
        `<span class="val"><span class="vl">${z >= 0 ? "+" : "−"}${fmt(lang, Math.abs(z), 1)}</span><span class="vp"></span></span></div>`;
    }).join("");
    SMX.counts = {};
    SMX.update();
    SMX.renderDrawn();
    $("#smxSlot").textContent = "▁";
    SMX.setNew(SMX.top());
  }
  SMX.top = () => { const L = D.logits[SMX.lang]; return L.reduce((a, b) => (b[1] > a[1] ? b : a))[0]; };
  // the drawn word becomes a new row of the vector table (next round)
  SMX.setNew = function (word) {
    $("#smxNewWrap").innerHTML = rowHTML(esc(word), vec(wordSeed(word), NC), "new") + `<span class="tag t-new">↑ ${esc(SMX.tr.added)}</span>`;
  };
  SMX.probs = () => W.softmax(D.logits[SMX.lang].map((r) => r[1]), SMX.T);
  SMX.update = function () {
    const p = SMX.probs();
    $$("#smxBars .srow").forEach((row, i) => {
      row.querySelector(".pbar").style.setProperty("--p", p[i].toFixed(4));
      row.querySelector(".vp").textContent = fmt(SMX.lang, p[i] * 100, p[i] < 0.001 ? 2 : 1) + " %";
    });
    $("#tOut").value = fmt(SMX.lang, SMX.T, 2);
  };
  SMX.renderDrawn = function () {
    const L = D.logits[SMX.lang];
    const parts = Object.entries(SMX.counts).sort((a, b) => b[1] - a[1]).map(([i, c]) => `${L[i][0]} ×${c}`);
    $("#smxDrawn").textContent = parts.length ? parts.join(" · ") : SMX.tr.none;
  };
  SMX.sample = function () {
    const p = SMX.probs();
    let u = Math.random(), i = 0;
    while (i < p.length - 1 && (u -= p[i]) > 0) i++;
    SMX.counts[i] = (SMX.counts[i] || 0) + 1;
    const slot = $("#smxSlot");
    slot.textContent = D.logits[SMX.lang][i][0];
    SMX.setNew(D.logits[SMX.lang][i][0]);
    $$("#smxBars .srow").forEach((r, k) => r.classList.toggle("hit", k === i));
    SMX.renderDrawn();
    if (window.gsap && !document.documentElement.classList.contains("static")) {
      gsap.fromTo(slot, { scale: 1.35 }, { scale: 1, duration: 0.5, ease: "back.out(2)" });
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
      $$("#smxBars .srow").forEach((row) => row.classList.remove("hit"));
      SMX.update(); SMX.renderDrawn(); SMX.setNew(SMX.top());
    });
  }

  /* ── Fast forward loop ───────────────────────────────── */
  const FF = (W.ff = { words: [], sched: null, lastK: -2 });
  function buildLoop(lang, dict) {
    FF.words = dict.answer.split(/\s+/);
    // first rounds slow, then accelerating; the last 6 % of progress holds the result
    FF.sched = schedule(FF.words.map((_, k) => Math.max(0.1, Math.pow(0.8, k))));
    $("#ffAnswer").innerHTML = FF.words.map((w) => `<span class="aw">${esc(w)}</span>`).join(" ");
    $("#ffVec").innerHTML = "<i></i>".repeat(9);
    $("#ffBars").innerHTML = "<i></i>".repeat(5);
    FF.lastK = -2;
    FF.render(FF.p || 0);
  }
  FF.render = function (p) {
    FF.p = p;
    if (!FF.sched) return;
    const done = p >= 0.94;
    const { k, phi } = FF.sched(Math.min(1, p / 0.94));
    const stage = done ? -1 : Math.min(4, Math.floor(phi * 5));
    $$("#ffPipe .ff-stage").forEach((s, i) => s.classList.toggle("on", i === stage));
    const prev = k === 0 ? "?" : FF.words[k - 1];
    const tokEl = $("#ffTok"), outEl = $("#ffOut");
    if (tokEl.textContent !== prev) tokEl.textContent = prev;
    const out = done ? "⏎" : (phi > 0.8 ? FF.words[k] : "");
    if (outEl.textContent !== out) outEl.textContent = out;
    const shown = done ? FF.words.length : k + (phi > 0.9 ? 1 : 0);
    if (shown !== FF.lastK) {
      $$("#ffAnswer .aw").forEach((s, i) => { s.classList.toggle("on", i < shown); s.classList.toggle("new", i === shown - 1 && !done); });
      $$("#ffVec i").forEach((c, j) => c.style.setProperty("--cell", cellColor(vec(k + 99, 9)[j])));
      const hs = vec(k + 555, 5).map((v) => 0.15 + Math.abs(v) * 0.85).sort((a, b) => b - a);
      $$("#ffBars i").forEach((b, j) => b.style.setProperty("--h", (hs[j] * 100).toFixed(0) + "%"));
      FF.lastK = shown;
    }
  };

  /* ── Public API ──────────────────────────────────────── */
  let bound = false;
  W.build = function (lang, dict) {
    curLang = lang;
    buildTokens(lang);
    buildEmbed(lang, dict.embed);
    buildSpace(dict.space);
    E.lang = lang;
    buildTunnel(lang, dict.layers);
    buildAttention(lang, dict.attention);
    buildSoftmax(lang, dict.softmax);
    buildLoop(lang, dict);
    if (!bound) { bindSpace(); bindAttention(); bindSoftmax(); bound = true; }
    E.request();
  };
})();
