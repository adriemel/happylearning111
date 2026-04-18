"use client";

import { useState, useEffect, useMemo } from "react";
import { PANELS } from "@/lib/pages";
import { SUBJECT_ORDER, SUBJECT_META } from "@/lib/subjects";
import { T } from "@/lib/i18n";
import { useTweaks } from "./hooks/useTweaks";
import TopBar from "./TopBar";
import Hero from "./Hero";
import SubjectNav from "./SubjectNav";
import Section from "./Section";
import Tweaks from "./Tweaks";

export default function LernhubApp() {
  const [tweaks, set] = useTweaks();
  const [query, setQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState("all");
  const [tweaksOpen, setTweaksOpen] = useState(false);

  const lang = tweaks.lang || "de";
  const t = T[lang];

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-density", tweaks.density);
    root.setAttribute("data-descriptions", tweaks.descriptions);
    root.lang = lang;
  }, [tweaks, lang]);

  const setLang = (l) => set({ lang: l });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PANELS.filter((p) => {
      if (activeSubject !== "all" && p.subject !== activeSubject) return false;
      if (!q) return true;
      return (
        p.title[lang].toLowerCase().includes(q) ||
        p.desc[lang].toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q) ||
        SUBJECT_META[p.subject][lang].toLowerCase().includes(q)
      );
    });
  }, [query, activeSubject, lang]);

  const bySubject = useMemo(() => {
    const m = {};
    SUBJECT_ORDER.forEach((s) => (m[s] = []));
    filtered.forEach((p) => { if (m[p.subject]) m[p.subject].push(p); });
    return m;
  }, [filtered]);

  const counts = useMemo(() => {
    const m = {};
    SUBJECT_ORDER.forEach((s) => (m[s] = PANELS.filter((p) => p.subject === s).length));
    return m;
  }, []);

  const visibleSubjects = SUBJECT_ORDER.filter((s) => bySubject[s]?.length > 0);

  return (
    <>
      <TopBar
        query={query}
        onQuery={setQuery}
        lang={lang}
        onLang={setLang}
        tweaksOpen={tweaksOpen}
        onTweaksToggle={() => setTweaksOpen((v) => !v)}
        searchPlaceholder={t.search}
      />

      <main className="main">
        <Hero lang={lang} />

        <SubjectNav
          subjects={SUBJECT_ORDER}
          counts={counts}
          active={activeSubject}
          onSelect={setActiveSubject}
          lang={lang}
        />

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-mark">∅</div>
            <div className="empty-title">{t.noResults}</div>
            <div>{t.noResultsSub}</div>
          </div>
        ) : (
          visibleSubjects.map((s) => (
            <Section key={s} subject={s} items={bySubject[s]} lang={lang} />
          ))
        )}

        <footer className="footer">
          <span className="mono">{t.footer}</span>
        </footer>
      </main>

      <Tweaks open={tweaksOpen} tweaks={tweaks} set={set} lang={lang} />
    </>
  );
}
