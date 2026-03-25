/**
 * LERNHUB PAGE REGISTRY
 * ─────────────────────
 * Add a new entry here to make it appear on the landing page.
 * The `file` value must match the filename in /public/pages/.
 */

export const PAGES = [
  {
    file: "BrownMovement.html",
    title: "Brownsche Molekularbewegung",
    subject: "Chemie",
    description:
      "Interaktive Simulation der zufälligen Bewegung von Teilchen in der Luft.",
  },
  {
    file: "schatten_v2.html",
    title: "Licht & Schatten",
    subject: "Physik",
    description:
      "Optik-Erkundung: Wie entstehen Schatten? Kernschatten, Halbschatten und Lichtquellen interaktiv erklärt.",
  },
  {
    file: "bruchrechnung-v5.html",
    title: "Bruchrechnung",
    subject: "Mathematik",
    description:
      "Übungen und visuelle Erklärungen rund ums Rechnen mit Brüchen — Addition, Subtraktion, Multiplikation.",
  },
  {
    file: "mondphasen.html",
    title: "Mondphasen",
    subject: "Physik",
    description:
      "Wie entstehen Mondphasen? Licht, Schatten und der Lauf des Mondes um die Erde anschaulich visualisiert.",
  },
  {
    file: "stoffgemische-labor.html",
    title: "Heterogene Stoffgemische",
    subject: "Chemie",
    description:
      "Virtuelles Chemielabor: Trennverfahren für heterogene Gemische.",
  },
  {
    file: "Fabulator.html",
    title: "Fabulator",
    subject: "Deutsch",
    description:
      "Kreatives Schreibwerkzeug zum Erfinden von Fabeln — mit Charakteren, Moral und eigener Geschichte.",
  },
  {
    file: "pangaea_ai_training_wiki.html",
    title: "KI-Training & Pangaea",
    subject: "Allgemein",
    description:
      "Kompaktes Wiki über die Grundlagen des KI-Trainings für PANGAEA Data Curators.",
  },
  {
    file: "html-lernen.html",
    title: "HTML Lernen",
    subject: "Allgemein",
    description:
      "Einstieg in HTML: Tags, Struktur, Attribute — für alle, die verstehen wollen, wie Webseiten gebaut werden.",
  },
];

/** Subject → accent color mapping used by the card component */
export const SUBJECT_COLORS = {
  Physik: { bg: "#1a2a4a", text: "#7eb8f7", border: "#3d6da8" },
  Mathematik: { bg: "#2a1f0a", text: "#f5a742", border: "#a06020" },
  Chemie: { bg: "#0d2a1a", text: "#4ade80", border: "#1a6640" },
  Deutsch: { bg: "#2a0d2a", text: "#e879f9", border: "#7a2080" },
  Allgemein: { bg: "#1a1a2a", text: "#a0a8c8", border: "#404880" },
};
