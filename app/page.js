import PageCard from "@/components/PageCard";
import { PAGES } from "@/lib/pages";

export default function Home() {
  return (
    <main className="main">
      <div className="hero">
        <div className="hero-badge">
          <span className="mono">v1.0</span>
        </div>
        <h1 className="hero-title">
          <span className="title-script">Lern</span>hub
        </h1>
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
