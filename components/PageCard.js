"use client";

import { SUBJECT_COLORS } from "@/lib/pages";

export default function PageCard({ file, title, subject, description }) {
  const colors = SUBJECT_COLORS[subject] ?? SUBJECT_COLORS["Allgemein"];

  return (
    <a
      href={`/pages/${file}`}
      target="_blank"
      rel="noopener noreferrer"
      className="card"
      style={{
        "--tag-bg": colors.bg,
        "--tag-text": colors.text,
        "--tag-border": colors.border,
      }}
    >
      <div className="card-inner">
        <span className="subject-tag">{subject}</span>
        <h2 className="card-title">{title}</h2>
        <p className="card-desc">{description}</p>
        <div className="card-footer">
          <span className="open-label">Öffnen →</span>
        </div>
      </div>
    </a>
  );
}
