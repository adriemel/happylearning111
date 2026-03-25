import PageCard from "@/components/PageCard";
import { PAGES } from "@/lib/pages";

export default function Home() {
  return (
    <main className="main">
      <div className="hero">
        <div className="hero-badge">
          <span className="mono">v1.0</span>
        </div>
        <div className="title-row">
          <h1 className="hero-title">
            <span className="title-script">Lern</span>hub
          </h1>
          <svg
            className="stick-figure"
            width="38"
            height="56"
            viewBox="0 0 38 56"
            fill="none"
            stroke="#b5f23d"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {/* head */}
            <circle cx="19" cy="7" r="6" />
            {/* body */}
            <line x1="19" y1="13" x2="19" y2="34" />
            {/* left arm */}
            <line x1="19" y1="21" x2="9" y2="29" />
            {/* right arm — waving, origin at shoulder (19,21) */}
            <g transform="translate(19,21)" className="wave-arm">
              <line x1="0" y1="0" x2="11" y2="-8" />
            </g>
            {/* left leg */}
            <line x1="19" y1="34" x2="11" y2="48" />
            {/* right leg */}
            <line x1="19" y1="34" x2="27" y2="48" />
          </svg>
        </div>
        <p className="hero-sub">
          Interaktive Seiten zum Entdecken, Verstehen und Üben.
        </p>
        <div className="divider" />
      </div>

      <div className="grid">
        {PAGES.map((page) => (
          <PageCard key={page.file} {...page} />
        ))}
      </div>

      <footer className="footer">
        <span className="mono">Happy Learning</span>
      </footer>
    </main>
  );
}
