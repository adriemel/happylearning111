/*
 * Demo numbers for the widgets. All values are illustrative, not taken from a
 * real model, except the GPT-3 sizes (Brown et al. 2020, arXiv:2005.14165).
 */
window.AIX = window.AIX || {};
window.AIX.data = {
  gpt3: { dModel: 12288, nLayers: 96, nHeads: 96, vocab: 50257 },

  // Answer prefix the model is completing. role drives the attention heads.
  tokens: {
    de: [
      { t: "Morgen", id: 39162, role: "time" },
      { t: " wird", id: 7618, role: "verb" },
      { t: " es", id: 1658, role: "pron" },
      { t: " in", id: 304, role: "prep" },
      { t: " Bremen", id: 61847, role: "place" },
    ],
    en: [
      { t: "Tomorrow", id: 37216, role: "time" },
      { t: ",", id: 11, role: "punct" },
      { t: " Bremen", id: 61847, role: "place" },
      { t: " will", id: 481, role: "verb" },
      { t: " be", id: 307, role: "verb" },
    ],
  },
  rare: {
    de: { word: "Niederschlagsmenge", parts: [["Nieder", 28311], ["schlags", 90455], ["menge", 19034]] },
    en: { word: "precipitation", parts: [["prec", 12580], ["ip", 541], ["itation", 3780]] },
  },

  // Token whose embedding row is looked up (index into tokens[lang]).
  embedToken: { de: 4, en: 2 },
  vectorPreview: [0.21, -0.83, 0.47, 0.05, -0.36, 0.92, -0.14, 0.58],

  // 3D sketch of an embedding space. Coordinates in [-1, 1].
  embedGroups: {
    weather: "#9ff3ff", city: "#ff8a2e", time: "#b5f23d", animal: "#ff6b9d",
  },
  embedPoints: [
    { de: "Regen", en: "rain", g: "weather", p: [0.62, 0.34, -0.18] },
    { de: "Schnee", en: "snow", g: "weather", p: [0.71, 0.44, -0.30] },
    { de: "Gewitter", en: "thunderstorm", g: "weather", p: [0.52, 0.55, -0.05] },
    { de: "Wind", en: "wind", g: "weather", p: [0.84, 0.10, -0.24] },
    { de: "Nebel", en: "fog", g: "weather", p: [0.58, 0.18, -0.38] },
    { de: "regnerisch", en: "rainy", g: "weather", p: [0.66, 0.30, 0.04] },
    { de: "sonnig", en: "sunny", g: "weather", p: [0.46, 0.08, -0.22] },
    { de: "Bremen", en: "Bremen", g: "city", p: [-0.62, 0.22, 0.40], focus: true },
    { de: "Hamburg", en: "Hamburg", g: "city", p: [-0.55, 0.32, 0.46] },
    { de: "Kiel", en: "Kiel", g: "city", p: [-0.70, 0.30, 0.30] },
    { de: "Berlin", en: "Berlin", g: "city", p: [-0.44, 0.12, 0.56] },
    { de: "München", en: "Munich", g: "city", p: [-0.38, 0.02, 0.62] },
    { de: "Paris", en: "Paris", g: "city", p: [-0.30, 0.26, 0.72] },
    { de: "morgen", en: "tomorrow", g: "time", p: [0.12, -0.62, 0.48] },
    { de: "heute", en: "today", g: "time", p: [0.02, -0.68, 0.40] },
    { de: "gestern", en: "yesterday", g: "time", p: [0.20, -0.74, 0.34] },
    { de: "Montag", en: "Monday", g: "time", p: [-0.04, -0.50, 0.62] },
    { de: "Woche", en: "week", g: "time", p: [0.16, -0.46, 0.66] },
    { de: "Hund", en: "dog", g: "animal", p: [-0.18, 0.62, -0.62] },
    { de: "Katze", en: "cat", g: "animal", p: [-0.28, 0.70, -0.54] },
    { de: "Pferd", en: "horse", g: "animal", p: [-0.06, 0.52, -0.74] },
    { de: "Möwe", en: "seagull", g: "animal", p: [-0.36, 0.48, -0.40] },
  ],

  // Attention heads: raw score rules by role, softmax with causal mask in widgets.js.
  heads: [
    { id: "prev", score: (q, k, qi, ki) => (ki === qi - 1 ? 3.2 : ki === qi ? 1.0 : 0) },
    {
      id: "place",
      score: (q, k, qi, ki) => (k.role === "place" || k.role === "time" ? 2.6 : 0) + (ki === qi ? 0.4 : 0),
    },
    { id: "start", score: (q, k, qi, ki) => (ki === 0 ? 2.8 : 0.3) },
  ],

  // Candidate next tokens with logits.
  logits: {
    de: [[" regnerisch", 4.2], [" windig", 3.5], [" nass", 2.6], [" stürmisch", 2.1],
         [" bewölkt", 1.9], [" kalt", 1.5], [" sonnig", -0.4], [" Pizza", -3.2]],
    en: [[" rainy", 4.2], [" windy", 3.5], [" wet", 2.6], [" stormy", 2.1],
         [" cloudy", 1.9], [" cold", 1.5], [" sunny", -0.4], [" pizza", -3.2]],
  },

  // Tool loop payloads (SI units).
  toolCall: { name: "get_weather", input: { city: "Bremen", date: "2026-11-28" } },
  toolResult: { date: "2026-11-28", precip_mm: 6.2, wind_ms: 11, t_max_c: 7 },
  contextTokens: [38, 124, 22, 14], // system, tools, history, new message (approx.)
};
