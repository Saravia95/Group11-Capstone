import { createContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  toggleThemeHandler: (_newTheme: string) => {},
});

export const ThemeContextProvider = ({ children }: React.PropsWithChildren) => {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jv_theme') || '"dark"';
    }
    return 'dark';
  });

  useEffect(() => {
    document.body.classList.forEach((className) => {
      if (['light', 'dark', 'retro', 'neon'].includes(className)) {
        document.body.classList.remove(className);
      }
    });
    document.body.classList.add(theme);
    localStorage.setItem('jv_theme', theme);
  }, [theme]);

  const toggleThemeHandler = (newTheme: string) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleThemeHandler }}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
