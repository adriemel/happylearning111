import { T } from "@/lib/i18n";

export default function Tweaks({ open, tweaks, set, lang }) {
  const t = T[lang];
  return (
    <aside className={"tweaks " + (open ? "open" : "")}>
      <h4>{t.tweaks}</h4>
      <label>
        <span>{t.density}</span>
        <div className="tweak-row">
          {["compact", "cozy", "spacious"].map((d) => (
            <button
              key={d}
              className={tweaks.density === d ? "on" : ""}
              onClick={() => set({ density: d })}
            >
              {t[d]}
            </button>
          ))}
        </div>
      </label>
      <label>
        <span>{t.descriptions}</span>
        <div className="tweak-row">
          <button
            className={tweaks.descriptions === "show" ? "on" : ""}
            onClick={() => set({ descriptions: "show" })}
          >
            {t.show}
          </button>
          <button
            className={tweaks.descriptions === "hide" ? "on" : ""}
            onClick={() => set({ descriptions: "hide" })}
          >
            {t.hide}
          </button>
        </div>
      </label>
    </aside>
  );
}
