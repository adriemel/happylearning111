"use client";

import { useState, useEffect, useMemo } from "react";
import { PANELS } from "@/lib/pages";
import { SUBJECT_META } from "@/lib/subjects";
import { T } from "@/lib/i18n";
import { useTweaks } from "./hooks/useTweaks";
import TopBar from "./TopBar";
import Hero from "./Hero";
import Section from "./Section";
import PageCard from "./PageCard";
import Tweaks from "./Tweaks";

const BATCH = 12;

export default function LernhubApp() {
  const [tweaks, set] = useTweaks();
  const [query, setQuery] = useState("");
  const [openSubject, setOpenSubject] = useState(null);
  const [topicLimit, setTopicLimit] = useState(BATCH);
  const [resultLimit, setResultLimit] = useState(BATCH);
  const [recentLimit, setRecentLimit] = useState(3);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const lang = tweaks.lang || "de";
  const t = T[lang];
  const searching = !!query.trim();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-density", tweaks.density);
    root.setAttribute("data-descriptions", tweaks.descriptions);
    root.lang = lang;
  }, [tweaks, lang]);

  const subjects = useMemo(() => [...new Set(PANELS.map(p => p.subject))]
    .sort((a, b) => (SUBJECT_META[a]?.[lang] || a).localeCompare(SUBJECT_META[b]?.[lang] || b, lang)), [lang]);
  const recent = useMemo(() => PANELS.filter(p => p.addedAt)
    .slice().sort((a, b) => b.addedAt.localeCompare(a.addedAt) || a.id.localeCompare(b.id)), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    return PANELS.filter(p => [p.title[lang], p.desc[lang], p.subject, SUBJECT_META[p.subject]?.[lang]]
      .some(value => value?.toLocaleLowerCase(lang).includes(q)))
      .sort((a, b) => a.title[lang].localeCompare(b.title[lang], lang));
  }, [query, lang]);

  return (
    <>
      <TopBar query={query} onQuery={value => { setQuery(value); setResultLimit(BATCH); }}
        lang={lang} onLang={value => { set({ lang: value }); setResultLimit(BATCH); }}
        tweaksOpen={tweaksOpen} onTweaksToggle={() => setTweaksOpen(v => !v)} searchPlaceholder={t.search} />
      <main className="main">
        <Hero lang={lang} />
        {searching ? (
          <section aria-labelledby="results-heading">
            <header className="library-heading">
              <h2 id="results-heading">{t.searchResults}</h2>
              <span className="library-count" role="status">{filtered.length} {t.pages}</span>
              <button className="library-action" onClick={() => setQuery("")}>{t.clearSearch}</button>
            </header>
            {filtered.length === 0 ? (
              <div className="empty"><div className="empty-mark">∅</div><div className="empty-title">{t.noResults}</div><div>{t.noResultsSub}</div></div>
            ) : <div className="grid">{filtered.slice(0, resultLimit).map(p => <PageCard key={p.id} page={p} lang={lang} />)}</div>}
            {filtered.length > resultLimit && <button className="library-action load-more" onClick={() => setResultLimit(n => n + BATCH)}>{t.morePages}</button>}
          </section>
        ) : (
          <>
            {recent.length > 0 && <section className="recent-section" aria-labelledby="recent-heading">
              <header className="library-heading">
                <h2 id="recent-heading">{t.recent}</h2>
                <span className="library-count">{t.newestFirst}</span>
                {recent.length > 3 && <button className="library-action" aria-expanded={recentLimit > 3} onClick={() => setRecentLimit(n => n > 3 ? 3 : BATCH)}>{recentLimit > 3 ? t.showLess : t.allAdditions}</button>}
              </header>
              <div className="grid recent-grid">{recent.slice(0, recentLimit).map(p => <PageCard key={p.id} page={p} lang={lang} showDate />)}</div>
              {recentLimit > 3 && recent.length > recentLimit && <button className="library-action load-more" onClick={() => setRecentLimit(n => n + BATCH)}>{t.morePages}</button>}
            </section>}
            <section className="topic-library" aria-labelledby="topics-heading">
              <header className="library-heading">
                <h2 id="topics-heading">{t.yourTopics}</h2>
                <span className="library-count">{subjects.length} {t.subjects} · A–Z</span>
              </header>
              {subjects.slice(0, topicLimit).map(subject => <Section key={subject} subject={subject}
                items={PANELS.filter(p => p.subject === subject)} lang={lang}
                open={openSubject === subject} onToggle={() => setOpenSubject(current => current === subject ? null : subject)} />)}
              {subjects.length > topicLimit && <button className="library-action load-more" onClick={() => setTopicLimit(n => n + BATCH)}>{t.moreTopics}</button>}
            </section>
          </>
        )}
        <footer className="footer"><span className="mono">{t.footer}</span></footer>
      </main>
      <Tweaks open={tweaksOpen} tweaks={tweaks} set={set} lang={lang} />
    </>
  );
}
