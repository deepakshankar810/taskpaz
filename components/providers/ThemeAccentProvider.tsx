'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type AccentVibe = 'default' | 'emerald' | 'cyber' | 'rose' | 'ocean' | 'sunset';

interface AccentVibeInfo {
  name: string;
  color: string;
  glow: string;
}

const VIBES: Record<AccentVibe, AccentVibeInfo> = {
  default: { name: 'Classic Blue', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
  emerald: { name: 'Emerald Forest', color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
  cyber: { name: 'Cyberpunk', color: '#d946ef', glow: 'rgba(217, 70, 239, 0.5)' },
  rose: { name: 'Rose Gold', color: '#fb7185', glow: 'rgba(251, 113, 133, 0.5)' },
  ocean: { name: 'Deep Ocean', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' },
  sunset: { name: 'Golden Sunset', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
};

interface ThemeAccentContextType {
  vibe: AccentVibe;
  setVibe: (vibe: AccentVibe) => void;
  availableVibes: typeof VIBES;
}

const ThemeAccentContext = createContext<ThemeAccentContextType | undefined>(undefined);

export function ThemeAccentProvider({ children }: { children: ReactNode }) {
  const [vibe, setVibeState] = useState<AccentVibe>('default');

  useEffect(() => {
    const saved = localStorage.getItem('theme_vibe') as AccentVibe;
    if (saved && VIBES[saved]) {
      setVibeState(saved);
      applyVibe(saved);
    }
  }, []);

  const applyVibe = (v: AccentVibe) => {
    const info = VIBES[v];
    document.documentElement.style.setProperty('--accent-primary', info.color);
    document.documentElement.style.setProperty('--accent-glow', info.glow);
    
    const r = parseInt(info.color.slice(1, 3), 16);
    const g = parseInt(info.color.slice(3, 5), 16);
    const b = parseInt(info.color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-primary-rgb', `${r}, ${g}, ${b}`);
  };

  const setVibe = (v: AccentVibe) => {
    setVibeState(v);
    localStorage.setItem('theme_vibe', v);
    applyVibe(v);
  };

  return (
    <ThemeAccentContext.Provider value={{ vibe, setVibe, availableVibes: VIBES }}>
      {children}
    </ThemeAccentContext.Provider>
  );
}

export function useThemeAccent() {
  const context = useContext(ThemeAccentContext);
  if (context === undefined) {
    throw new Error('useThemeAccent must be used within a ThemeAccentProvider');
  }
  return context;
}
