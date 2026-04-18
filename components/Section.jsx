import PageCard from "./PageCard";
import { T } from "@/lib/i18n";
import { SUBJECT_META } from "@/lib/subjects";

export default function Section({ subject, items, lang }) {
  const meta = SUBJECT_META[subject];
  const t = T[lang];

  return (
    <section className="subject-section" id={"s-" + subject}>
      <header className="subject-header">
        <h2 className="subject-title">
          {meta[lang]}
          <span className="count">
            {String(items.length).padStart(2, "0")} {t.pages}
          </span>
        </h2>
        <span className="subject-blurb">{meta.blurb[lang]}</span>
      </header>
      <div className="grid">
        {items.map((p) => (
          <PageCard key={p.id} page={p} lang={lang} />
        ))}
      </div>
    </section>
  );
}
