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
            width="44"
            height="58"
            viewBox="0 0 44 58"
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
            {/* left arm — static */}
            <line x1="19" y1="22" x2="8" y2="27" />
            {/* right arm — outer g ONLY translates (no CSS on it),
                inner g ONLY rotates (no SVG transform on it).
                This avoids CSS overriding the SVG translate. */}
            <g transform="translate(19,22)">
              <g className="wave-arm">
                <line x1="0" y1="0" x2="11" y2="-3" />
              </g>
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
