"use client";

import { useRef } from "react";
import { useSearch } from "./hooks/useSearch";

function BrandMini() {
  return (
    <div className="brand-mini">
      <span className="brand-script">Lern</span>
      <span>hub</span>
      <span className="ver">v2.0</span>
    </div>
  );
}

function Search({ value, onChange, placeholder }) {
  const ref = useRef();
  useSearch(ref, () => onChange(""));

  return (
    <div className="search">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
      </svg>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <kbd>⌘K</kbd>
    </div>
  );
}

function LangToggle({ lang, onChange }) {
  return (
    <div className="lang-toggle" role="group">
      <button className={lang === "de" ? "on" : ""} onClick={() => onChange("de")}>DE</button>
      <button className={lang === "en" ? "on" : ""} onClick={() => onChange("en")}>EN</button>
    </div>
  );
}

function TweaksButton({ onClick, open }) {
  return (
    <button className="iconbtn" onClick={onClick} title="Tweaks" aria-pressed={open}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    </button>
  );
}

export default function TopBar({ query, onQuery, lang, onLang, tweaksOpen, onTweaksToggle, searchPlaceholder }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <BrandMini />
        <Search value={query} onChange={onQuery} placeholder={searchPlaceholder} />
        <div className="toprite">
          <LangToggle lang={lang} onChange={onLang} />
          <TweaksButton open={tweaksOpen} onClick={onTweaksToggle} />
        </div>
      </div>
    </header>
  );
}
