import {loadPreferences, savePreferences} from './storage.js';


// 
export const applyTheme = (themeName) => {
  const body = document.body;
  const html = document.documentElement;

  // remove existing themes classes
  body.classList.remove( 'dark', 'system');
  html.classList.remove('dark', 'system');

  if(themeName === 'system'){
    // use prefers-color-scheme to determine theme
      body.classList.add('system');
      applySystemTheme();
    }else if(themeName === 'dark'){
      body.classList.add('dark');
      html.classList.add('dark');
    }else{
      // default to light
      body.classList.remove('dark');
      html.classList.remove('dark');
    }

    // save theme to localStorage
    savePreferences({colorTheme: themeName});

    return themeName;
};


// apply system theme based on user's OS preference
const applySystemTheme = () => {
  const body = document.body;
  const html = document.documentElement;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if(prefersDark){
    body.classList.add('dark');
    html.classList.add('dark');
  }else{
    body.classList.remove('dark');
    html.classList.remove('dark');
  }
};

// listen for system theme changes
const systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
systemThemeMediaQuery.addEventListener('change', () => {
  if(document.body.classList.contains('system')){
    applySystemTheme();
  }
});


// apply font theme
export const applyFont = (fontName) => {
  const body = document.body;
  const html = document.documentElement;

  // remove existing font classes
  body.classList.remove('font-sans-serif', 'font-serif', 'font-monospace');
  html.classList.remove('font-sans-serif', 'font-serif', 'font-monospace');

  // add new font class
  const fontClass = `font-${fontName}`;
  body.classList.add(fontClass);
  html.classList.add(fontClass);

  // save font to localStorage
  savePreferences({fontTheme: fontName});

  return fontName;
};


// initialize theme from localStorage on page load
export const initThemeFromStorage = () => {
  const preferences = loadPreferences();

  // apply color theme
  if(preferences.colorTheme){
    applyTheme(preferences.colorTheme);
  }else{
    // default to light
    applyTheme('light');
  }

  // apply font theme
  if(preferences.fontTheme){
    applyFont(preferences.fontTheme);
  }else{
    // default to sans-serif
    applyFont('sans-serif');
  }
}