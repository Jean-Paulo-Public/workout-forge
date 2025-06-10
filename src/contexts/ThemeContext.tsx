
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Defina um tema padrão inicial. Será atualizado após a montagem no cliente.
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Este efeito é executado no cliente após a hidratação.
    // É seguro acessar localStorage e window.matchMedia aqui.
    setMounted(true);
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme) {
      setThemeState(storedTheme);
    } else {
      setThemeState(systemPrefersDark ? 'dark' : 'light');
    }
  }, []); // Executa uma vez na montagem do cliente

  useEffect(() => {
    // Este efeito aplica o tema ao documento.
    // Só é executado se 'mounted' for true e 'theme' mudar.
    if (mounted) {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    // setThemeState irá disparar o efeito acima se mounted for true
    setThemeState(newTheme);
  }, []); // mounted não é necessário como dependência aqui, pois o efeito acima lida com isso

  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []); // mounted não é necessário aqui

  // O valor fornecido pelo contexto.
  // 'theme' será inicialmente 'light' (ou o padrão do useState)
  // e então será atualizado após a execução do primeiro useEffect.
  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  // Renderiza sempre o Provider.
  // Os children inicialmente renderizarão com o tema padrão ('light').
  // Após a hidratação no lado do cliente e a execução do primeiro useEffect,
  // o estado do tema será atualizado, causando uma nova renderização com o tema correto.
  // Isso evita o erro "useTheme must be used within a ThemeProvider".
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
