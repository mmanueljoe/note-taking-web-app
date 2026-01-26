import { loadPreferences, savePreferences } from "./storage.js";

export const applyTheme = (themeName) => {
  const body = document.body;
  const html = document.documentElement;

 
  body.classList.remove("light", "dark", "system");
  html.classList.remove("light", "dark", "system");

  if (themeName === "system") {
    body.classList.add("system");
    applySystemTheme();
  } else if (themeName === "dark") {
    body.classList.add("dark");
    html.classList.add("dark");
  } else {
    body.classList.add("light");
    html.classList.add("light");
  }

  savePreferences({ colorTheme: themeName });

  return themeName;
};

const applySystemTheme = () => {
  const body = document.body;
  const html = document.documentElement;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    body.classList.add("dark");
    html.classList.add("dark");
  } else {
    body.classList.remove("dark");
    html.classList.remove("dark");
  }
};

const systemThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
systemThemeMediaQuery.addEventListener("change", () => {
  if (document.body.classList.contains("system")) {
    applySystemTheme();
  }
});

export const applyFont = (fontName) => {
  const body = document.body;
  const html = document.documentElement;

  body.classList.remove("font-sans-serif", "font-serif", "font-monospace");
  html.classList.remove("font-sans-serif", "font-serif", "font-monospace");

  const fontClass = `font-${fontName}`;
  body.classList.add(fontClass);
  html.classList.add(fontClass);

  savePreferences({ fontTheme: fontName });

  return fontName;
};

export const initThemeFromStorage = () => {
  const preferences = loadPreferences();

  if (preferences.colorTheme) {
    applyTheme(preferences.colorTheme);
  } else {
    applyTheme("system");
  }

  if (preferences.fontTheme) {
    applyFont(preferences.fontTheme);
  } else {
    applyFont("sans-serif");
  }
};
