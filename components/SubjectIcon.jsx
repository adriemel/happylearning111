// Subject icons for the classroom boards: SVG bodies copied from Lucide (lucide-static 1.80.0, 24x24 grid,
// stroke icons). Lucide is ISC-licensed: Copyright (c) 2026 Lucide Icons and Contributors. Permission to use,
// copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided
// that the above copyright notice and this permission notice appear in all copies. https://lucide.dev/license
// To change a subject's icon, paste the inner SVG of another icon from https://lucide.dev here.

const ICONS = {
  "Mathematik": "<line x1=\"9\" x2=\"9\" y1=\"4\" y2=\"20\" /> <path d=\"M4 7c0-1.7 1.3-3 3-3h13\" /> <path d=\"M18 20c-1.7 0-3-1.3-3-3V4\" />", // pi
  "Physik": "<circle cx=\"12\" cy=\"12\" r=\"1\" /> <path d=\"M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z\" /> <path d=\"M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z\" />", // atom
  "Chemie": "<path d=\"M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2\" /> <path d=\"M6.453 15h11.094\" /> <path d=\"M8.5 2h7\" />", // flask-conical
  "Biologie": "<path d=\"M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3\" /> <path d=\"M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4\" /> <path d=\"M5 21h14\" />", // sprout
  "Erdkunde": "<path d=\"M21.54 15H17a2 2 0 0 0-2 2v4.54\" /> <path d=\"M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17\" /> <path d=\"M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05\" /> <circle cx=\"12\" cy=\"12\" r=\"10\" />", // earth
  "Deutsch": "<path d=\"M14.086 18.412A2 2 0 0112.67 19H5v-7.672a2 2 0 01.586-1.414L11.75 3.75a6 6 0 118.49 8.49z\" /> <path d=\"M16 8 2 22\" /> <path d=\"M17.488 15H9\" />", // feather
  "Englisch": "<path d=\"m5 8 6 6\" /> <path d=\"m4 14 6-6 2-3\" /> <path d=\"M2 5h12\" /> <path d=\"M7 2h1\" /> <path d=\"m22 22-5-10-5 10\" /> <path d=\"M14 18h6\" />", // languages
  "Musik": "<path d=\"M21 16V3a1 1 0 0 0-1.28-.96l-10 2.917a1 1 0 0 0-.72.96V19\" /> <circle cx=\"18\" cy=\"16\" r=\"3\" /> <circle cx=\"6\" cy=\"19\" r=\"3\" />", // music
  "Allgemein": "<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z\" />", // wrench
  "AI für Kinder": "<path d=\"M12 13h4\" /> <path d=\"M12 18h6a2 2 0 012 2v1\" /> <path d=\"M12 8h8\" /> <path d=\"M12 9a4.17 4.17 0 01-3 4\" /> <path d=\"M16 8V5a2 2 0 012-2\" /> <path d=\"M6 18a4 4 0 01-2-7.465\" /> <path d=\"M6.004 5.125a4 4 0 00-2.526 5.77\" /> <path d=\"M6.294 6.294A3 3 0 1112 5v13a4 4 0 11-7.967-.518\" /> <circle cx=\"16\" cy=\"13\" r=\"0.5\" fill=\"currentColor\" /> <circle cx=\"18\" cy=\"3\" r=\"0.5\" fill=\"currentColor\" /> <circle cx=\"20\" cy=\"21\" r=\"0.5\" fill=\"currentColor\" /> <circle cx=\"20\" cy=\"8\" r=\"0.5\" fill=\"currentColor\" />", // brain-circuit
  "Games": "<line x1=\"6\" x2=\"10\" y1=\"11\" y2=\"11\" /> <line x1=\"8\" x2=\"8\" y1=\"9\" y2=\"13\" /> <line x1=\"15\" x2=\"15.01\" y1=\"12\" y2=\"12\" /> <line x1=\"18\" x2=\"18.01\" y1=\"10\" y2=\"10\" /> <path d=\"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z\" />", // gamepad-2
};
const FALLBACK = "<path d=\"M12 5v16\" /> <path d=\"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z\" />"; // book-open, for subjects without an entry

export default function SubjectIcon({ subject, className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
      dangerouslySetInnerHTML={{ __html: ICONS[subject] || FALLBACK }} />
  );
}
