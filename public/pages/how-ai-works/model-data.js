/*
 * Demo numbers for the widgets. All values are illustrative, not taken from a
 * real model, except the GPT-3 sizes (Brown et al. 2020, arXiv:2005.14165).
 */
window.AIX = window.AIX || {};
window.AIX.data = {
  gpt3: { dModel: 12288, nLayers: 96, nHeads: 96, vocab: 50257 },
  vocabShown: 100000, // made-up vocabulary size for the embedding table

  // The question as tokens [text, id]. Leading space = part of the token.
  tokens: {
    de: [["Könnte", 48213], [" ein", 551], [" Eis", 19982], ["bär", 76310], [" einen", 4561], [" Pingu", 88120],
         ["in", 259], [" fressen", 61044], [",", 11], [" wenn", 9932], [" er", 1127], [" in", 304], [" der", 390],
         [" Ant", 7203], ["arktis", 95417], [" leben", 23671], [" würde", 14408], ["?", 30]],
    en: [["Could", 23722], [" a", 257], [" polar", 13132], [" bear", 6842], [" eat", 4483], [" a", 257],
         [" penguin", 59683], [" if", 611], [" it", 340], [" lived", 5615], [" on", 319], [" Ant", 3738],
         ["arctica", 87411], ["?", 30]],
  },

  // Attention works on whole words here (stated on the page). role drives the heads.
  words: {
    de: [{ t: "Könnte", role: "verb" }, { t: "ein", role: "det" }, { t: "Eisbär", role: "noun", subj: true },
         { t: "einen", role: "det" }, { t: "Pinguin", role: "noun" }, { t: "fressen", role: "verb" },
         { t: "wenn", role: "conj" }, { t: "er", role: "pron" }],
    en: [{ t: "Could", role: "verb" }, { t: "a", role: "det" }, { t: "polar bear", role: "noun", subj: true },
         { t: "eat", role: "verb" }, { t: "a", role: "det" }, { t: "penguin", role: "noun" },
         { t: "if", role: "conj" }, { t: "it", role: "pron" }],
  },
  heads: [
    { id: "prev", score: (q, k, qi, ki) => (ki === qi - 1 ? 3.2 : ki === qi ? 1.0 : 0) },
    {
      id: "ref",
      score: (q, k, qi, ki) => {
        if (ki === qi) return 0.3;
        if (k.role !== "noun") return 0;
        return q.role === "pron" ? (k.subj ? 2.7 : 2.1) : 1.0;
      },
    },
    { id: "start", score: (q, k, qi, ki) => (ki === 0 ? 2.8 : 0.3) },
  ],
  attentionDefault: 7, // selected word: "er" / "it"

  // 3D sketch of an embedding space, coordinates in [-1, 1].
  embedGroups: { animal: "#ff6b9d", place: "#ffd23f", cold: "#5ff4ff", verb: "#b5f23d" },
  embedPoints: [
    { de: "Eisbär", en: "polar bear", g: "animal", p: [-0.05, 0.42, 0.18], focus: true },
    { de: "Pinguin", en: "penguin", g: "animal", p: [0.12, 0.38, -0.12], focus: true },
    { de: "Robbe", en: "seal", g: "animal", p: [-0.18, 0.30, -0.05] },
    { de: "Fisch", en: "fish", g: "animal", p: [-0.30, 0.20, -0.22] },
    { de: "Hund", en: "dog", g: "animal", p: [-0.62, 0.42, 0.06] },
    { de: "Katze", en: "cat", g: "animal", p: [-0.70, 0.30, 0.16] },
    { de: "Möwe", en: "seagull", g: "animal", p: [-0.40, 0.55, -0.30] },
    { de: "Arktis", en: "Arctic", g: "place", p: [0.30, 0.52, 0.48] },
    { de: "Antarktis", en: "Antarctica", g: "place", p: [0.50, 0.40, -0.18], focus: true },
    { de: "Nordpol", en: "North Pole", g: "place", p: [0.42, 0.62, 0.55] },
    { de: "Südpol", en: "South Pole", g: "place", p: [0.62, 0.48, -0.30] },
    { de: "Grönland", en: "Greenland", g: "place", p: [0.22, 0.66, 0.66] },
    { de: "Eis", en: "ice", g: "cold", p: [0.30, 0.02, 0.30] },
    { de: "Schnee", en: "snow", g: "cold", p: [0.42, -0.06, 0.20] },
    { de: "kalt", en: "cold", g: "cold", p: [0.50, 0.06, 0.40] },
    { de: "fressen", en: "eat", g: "verb", p: [-0.20, -0.58, 0.10], focus: true },
    { de: "jagen", en: "hunt", g: "verb", p: [-0.32, -0.50, 0.28] },
    { de: "schwimmen", en: "swim", g: "verb", p: [0.02, -0.66, -0.20] },
    { de: "leben", en: "live", g: "verb", p: [0.10, -0.52, 0.34] },
  ],
  embedLinks: [["Eisbär", "Arktis"], ["Pinguin", "Antarktis"], ["Eisbär", "Pinguin"]],

  // Candidate first words of the answer with logits.
  logits: {
    de: [["Ja", 3.6], ["Theoretisch", 3.2], ["Wahrscheinlich", 2.6], ["Nein", 1.9],
         ["Eisbären", 1.6], ["Das", 1.2], ["Interessant", 0.4], ["Pizza", -3.0]],
    en: [["Yes", 3.6], ["In", 3.2], ["Probably", 2.6], ["No", 1.9],
         ["Polar", 1.6], ["That", 1.2], ["Interesting", 0.4], ["Pizza", -3.0]],
  },
};
