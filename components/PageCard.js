import { T } from "@/lib/i18n";
import { SUBJECT_META } from "@/lib/subjects";

export default function PageCard({ page, lang }) {
  const t = T[lang];
  return (
    <a
      className="card"
      href={page.href}
      target="_blank"
      rel="noopener noreferrer"
      data-subject={page.subject}
    >
      <div className="card-inner">
        <div className="card-top">
          <span className="subject-tag">{SUBJECT_META[page.subject][lang]}</span>
          <span className="card-lang">{page.lang}</span>
        </div>
        <h3 className="card-title">{page.title[lang]}</h3>
        <p className="card-desc">{page.desc[lang]}</p>
        <div className="card-footer">
          <span className="open-label">{t.open} →</span>
          {page.apiNeeded && <span className="api-badge">API</span>}
        </div>
      </div>
    </a>
  );
}
