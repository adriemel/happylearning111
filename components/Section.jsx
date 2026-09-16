import { useId, useState } from "react";
import PageCard from "./PageCard";
import { T } from "@/lib/i18n";
import { SUBJECT_META } from "@/lib/subjects";

export default function Section({ subject, items, lang, open, onToggle }) {
  const [limit, setLimit] = useState(6);
  const id = useId();
  const meta = SUBJECT_META[subject];
  const t = T[lang];
  return (
    <section className="topic-section">
      <h3>
        <button className="topic-toggle" aria-expanded={open} aria-controls={id} id={`${id}-heading`} onClick={onToggle}>
          <span className="topic-name">{meta?.[lang] || subject}</span>
          <span className="topic-blurb">{meta?.blurb?.[lang]}</span>
          <span className="topic-count">{items.length} {items.length === 1 ? t.page : t.pages}</span>
          <span className="topic-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
      </h3>
      <div id={id} role="region" aria-labelledby={`${id}-heading`} hidden={!open} className="topic-content">
        {open && <>
          <div className="grid">{items.slice(0, limit).map(p => <PageCard key={p.id} page={p} lang={lang} />)}</div>
          {items.length > limit && <button className="library-action load-more" onClick={() => setLimit(n => n + 6)}>{t.morePages}</button>}
        </>}
      </div>
    </section>
  );
}
