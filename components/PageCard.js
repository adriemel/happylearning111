import { T } from "@/lib/i18n";
import { SUBJECT_META } from "@/lib/subjects";

export default function PageCard({ page, lang, showDate = false }) {
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
          <span className="subject-tag">{SUBJECT_META[page.subject]?.[lang] || page.subject}</span>
          <span className="card-lang">{page.lang}</span>
        </div>
        <h3 className="card-title">{page.title[lang]}</h3>
        {showDate && page.addedAt && <time className="card-date" dateTime={page.addedAt}>
          {t.added} {new Intl.DateTimeFormat(lang, { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${page.addedAt}T00:00:00Z`))}
        </time>}
        <p className="card-desc">{page.desc[lang]}</p>
        <div className="card-footer">
          <span className="open-label">{t.open} →</span>
          {page.apiNeeded && <span className="api-badge">API</span>}
        </div>
      </div>
    </a>
  );
}
