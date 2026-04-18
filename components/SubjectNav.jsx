import { T } from "@/lib/i18n";
import { SUBJECT_META } from "@/lib/subjects";

export default function SubjectNav({ subjects, counts, active, onSelect, lang }) {
  const t = T[lang];
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <nav className="subjectnav">
      <div className="subjectnav-inner">
        <button
          className={"chip " + (active === "all" ? "on" : "")}
          onClick={() => onSelect("all")}
        >
          {t.all}
          <span className="chip-count">{total}</span>
        </button>
        {subjects.map((s) => (
          <button
            key={s}
            className={"chip " + (active === s ? "on" : "")}
            onClick={() => onSelect(s)}
          >
            {SUBJECT_META[s][lang]}
            <span className="chip-count">{counts[s] || 0}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
