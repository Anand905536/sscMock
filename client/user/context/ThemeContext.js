
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const theme = savedTheme === "light" ? "light" : "dark";
    const isDark = theme === "dark";

    const root = document.documentElement;

    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = theme;

    setDarkMode(isDark);
    setIsThemeReady(true);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    const newTheme = newMode ? "dark" : "light";

    const root = document.documentElement;

    localStorage.setItem("theme", newTheme);

    root.setAttribute("data-theme", newTheme);
    root.classList.toggle("dark", newMode);
    root.style.colorScheme = newTheme;

    setDarkMode(newMode);

    window.dispatchEvent(new Event("themeChange"));
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        setDarkMode,
        toggleDarkMode,
        isThemeReady,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
