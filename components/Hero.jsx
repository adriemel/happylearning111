import StickFigure from "./StickFigure";
import { T } from "@/lib/i18n";

export default function Hero({ lang }) {
  const t = T[lang];
  return (
    <section className="hero">
      <div className="hero-badge">
        <span className="mono">v2.0</span>
      </div>
      <div className="title-row">
        <h1 className="hero-title">
          <span className="title-script">Lern</span>hub
        </h1>
        <StickFigure size={44} />
      </div>
      <p className="hero-sub">{t.sub}</p>
      <div className="divider" />
    </section>
  );
}
