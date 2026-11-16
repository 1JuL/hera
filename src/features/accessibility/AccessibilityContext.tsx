import React, { createContext, useContext, useState, useEffect } from 'react';

export type ScaleLevel = 'normal' | 'large' | 'xlarge';
export type ThemeMode = 'light' | 'dark';

export interface AccessibilitySettings {
  theme: ThemeMode;
  titleSize: ScaleLevel;
  subtitleSize: ScaleLevel;
  auxSize: ScaleLevel;
}

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setTitleSize: (size: ScaleLevel) => void;
  setSubtitleSize: (size: ScaleLevel) => void;
  setAuxSize: (size: ScaleLevel) => void;
  applySeniorPreset: () => void;
  resetDefaults: () => void;
}

const STORAGE_KEY = 'hera_accessibility_v1';

const DEFAULT_SETTINGS: AccessibilitySettings = {
  theme: 'light',
  titleSize: 'normal',
  subtitleSize: 'normal',
  auxSize: 'large', // Defaulting auxiliary text to 'large' per user feedback
};

const SCALE_VALUES: Record<ScaleLevel, string> = {
  normal: '1',
  large: '1.15',
  xlarge: '1.3',
};

const AUX_SCALE_VALUES: Record<ScaleLevel, string> = {
  normal: '1',
  large: '1.18',
  xlarge: '1.35',
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }

    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.style.setProperty('--scale-title', SCALE_VALUES[settings.titleSize]);
    root.style.setProperty('--scale-subtitle', SCALE_VALUES[settings.subtitleSize]);
    root.style.setProperty('--scale-aux', AUX_SCALE_VALUES[settings.auxSize]);
  }, [settings]);

  const setTheme = (theme: ThemeMode) => setSettings((prev) => ({ ...prev, theme }));
  const toggleTheme = () =>
    setSettings((prev) => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  const setTitleSize = (titleSize: ScaleLevel) =>
    setSettings((prev) => ({ ...prev, titleSize }));
  const setSubtitleSize = (subtitleSize: ScaleLevel) =>
    setSettings((prev) => ({ ...prev, subtitleSize }));
  const setAuxSize = (auxSize: ScaleLevel) => setSettings((prev) => ({ ...prev, auxSize }));

  const applySeniorPreset = () => {
    setSettings((prev) => ({
      ...prev,
      titleSize: 'xlarge',
      subtitleSize: 'xlarge',
      auxSize: 'xlarge',
    }));
  };

  const resetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        setTheme,
        toggleTheme,
        setTitleSize,
        setSubtitleSize,
        setAuxSize,
        applySeniorPreset,
        resetDefaults,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextValue => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return ctx;
};
