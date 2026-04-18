"use client";

import { useState, useEffect } from "react";

const DEFAULTS = { density: "cozy", descriptions: "show", lang: "de" };
const KEY = "lernhub-tweaks";

export function useTweaks() {
  const [tweaks, setTweaks] = useState(DEFAULTS);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      setTweaks((prev) => ({ ...prev, ...saved }));
    } catch {}
  }, []);

  const set = (patch) =>
    setTweaks((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });

  return [tweaks, set];
}
