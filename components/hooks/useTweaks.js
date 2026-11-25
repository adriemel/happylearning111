"use client";

import { useState, useEffect, useMemo } from "react";

// view: "room" | "list" | null. null = not chosen yet; then the default follows
// prefers-reduced-motion ("list" when reduced, else "room") and is not persisted.
const DEFAULTS = { density: "cozy", descriptions: "show", lang: "de", view: null };
const KEY = "lernhub-tweaks";
const VIEWS = ["room", "list"];

export function useTweaks() {
  const [tweaks, setTweaks] = useState(DEFAULTS);
  const [defaultView, setDefaultView] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (!VIEWS.includes(saved.view)) saved.view = null;
      setTweaks((prev) => ({ ...prev, ...saved }));
    } catch {}
    setDefaultView(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "list" : "room");
  }, []);

  const set = (patch) =>
    setTweaks((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });

  // view stays null until mounted, so the server render never guesses the motion preference.
  const resolved = useMemo(() => ({ ...tweaks, view: tweaks.view || defaultView }), [tweaks, defaultView]);
  return [resolved, set];
}
