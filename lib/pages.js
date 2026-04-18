export const PANELS = [
  {
    id: "brown",
    subject: "Chemie",
    file: "BrownMovement.html",
    href: "/pages/BrownMovement.html",
    lang: "DE",
    title: { de: "Brownsche Molekularbewegung", en: "Brownian Motion" },
    desc: {
      de: "Interaktive Simulation der zufälligen Bewegung von Teilchen in der Luft.",
      en: "Interactive simulation of random particle motion in air.",
    },
  },
  {
    id: "schatten",
    subject: "Physik",
    file: "schatten_v2.html",
    href: "/pages/schatten_v2.html",
    lang: "DE",
    title: { de: "Licht & Schatten", en: "Light & Shadow" },
    desc: {
      de: "Optik-Erkundung: Wie entstehen Schatten? Kernschatten, Halbschatten und Lichtquellen interaktiv erklärt.",
      en: "Optics: how shadows form. Umbra, penumbra and light sources explained interactively.",
    },
  },
  {
    id: "bruch",
    subject: "Mathematik",
    file: "bruchrechnung-v5.html",
    href: "/pages/bruchrechnung-v5.html",
    lang: "DE",
    title: { de: "Bruchrechnung", en: "Fractions" },
    desc: {
      de: "Übungen und visuelle Erklärungen rund ums Rechnen mit Brüchen — Addition, Subtraktion, Multiplikation.",
      en: "Exercises and visual explanations for fractions — addition, subtraction, multiplication.",
    },
  },
  {
    id: "mond",
    subject: "Physik",
    file: "mondphasen.html",
    href: "/pages/mondphasen.html",
    lang: "DE",
    title: { de: "Mondphasen", en: "Moon Phases" },
    desc: {
      de: "Wie entstehen Mondphasen? Licht, Schatten und der Lauf des Mondes um die Erde anschaulich visualisiert.",
      en: "How moon phases form. Light, shadow and the moon's orbit visualised.",
    },
  },
  {
    id: "stoffe",
    subject: "Chemie",
    file: "stoffgemische-labor.html",
    href: "/pages/stoffgemische-labor.html",
    lang: "DE",
    title: { de: "Heterogene Stoffgemische", en: "Heterogeneous Mixtures" },
    desc: {
      de: "Virtuelles Chemielabor: Trennverfahren für heterogene Gemische.",
      en: "Virtual chemistry lab: separation methods for heterogeneous mixtures.",
    },
  },
  {
    id: "fabulator",
    subject: "Deutsch",
    file: "Fabulator.html",
    href: "/pages/Fabulator.html",
    lang: "DE",
    apiNeeded: true,
    title: { de: "Fabulator", en: "Fabulator" },
    desc: {
      de: "Kreatives Schreibwerkzeug zum Erfinden von Fabeln — mit Charakteren, Moral und eigener Geschichte.",
      en: "Creative writing tool for inventing fables — characters, moral and your own story.",
    },
  },
  {
    id: "pangaea",
    subject: "Allgemein",
    file: "pangaea_ai_training_wiki.html",
    href: "/pages/pangaea_ai_training_wiki.html",
    lang: "EN",
    title: { de: "KI-Training & Pangaea", en: "AI Training & Pangaea" },
    desc: {
      de: "Kompaktes Wiki über die Grundlagen des KI-Trainings für PANGAEA Data Curators.",
      en: "Compact wiki on AI training fundamentals for PANGAEA Data Curators.",
    },
  },
  {
    id: "html",
    subject: "Allgemein",
    file: "html-lernen.html",
    href: "/pages/html-lernen.html",
    lang: "DE",
    title: { de: "HTML Lernen", en: "Learn HTML" },
    desc: {
      de: "Einstieg in HTML: Tags, Struktur, Attribute — für alle, die verstehen wollen, wie Webseiten gebaut werden.",
      en: "Getting started with HTML: tags, structure, attributes — for anyone who wants to understand how web pages are built.",
    },
  },
  {
    id: "python",
    subject: "Allgemein",
    file: "PythonExplainer.html",
    href: "/pages/PythonExplainer.html",
    lang: "EN",
    apiNeeded: true,
    title: { de: "Python Explainer", en: "Python Explainer" },
    desc: {
      de: "Python-Code verständlich erklärt für Nicht-Programmierende.",
      en: "Get python code explained for non-programmers.",
    },
  },
  {
    id: "planner",
    subject: "Allgemein",
    file: "my-day-planner.html",
    href: "/pages/my-day-planner.html",
    lang: "DE",
    title: { de: "My Day Planner", en: "My Day Planner" },
    desc: {
      de: "Plane Deinen Tag und lade den Plan auf dein Handy, oder mache daraus einen Comic.",
      en: "Plan your day and send it to your phone — or turn it into a comic.",
    },
  },
];

// Legacy export — kept so any remaining imports don't break
export const PAGES = PANELS.map((p) => ({
  file: p.file,
  title: p.title.de,
  subject: p.subject,
  description: p.desc.de,
}));

export const SUBJECT_COLORS = {
  Physik:     { bg: "var(--tag-physik-bg)",     text: "var(--tag-physik-text)",     border: "var(--tag-physik-border)" },
  Mathematik: { bg: "var(--tag-mathe-bg)",      text: "var(--tag-mathe-text)",      border: "var(--tag-mathe-border)" },
  Chemie:     { bg: "var(--tag-chemie-bg)",      text: "var(--tag-chemie-text)",     border: "var(--tag-chemie-border)" },
  Deutsch:    { bg: "var(--tag-deutsch-bg)",     text: "var(--tag-deutsch-text)",    border: "var(--tag-deutsch-border)" },
  Allgemein:  { bg: "var(--tag-allgemein-bg)",   text: "var(--tag-allgemein-text)",  border: "var(--tag-allgemein-border)" },
};
