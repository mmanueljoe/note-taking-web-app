import {loadPreferences, savePreferences} from './storage.js';


// 
export const applyTheme = (themeName) => {
  const body = document.body;
  const html = document.documentElement;

  // remove existing themes classes
  body.classList.remove('light', 'dark', 'system');
  html.classList.remove('light', 'dark', 'system');

  if(themeName === 'system'){
    // use prefers-color-scheme to determine theme
      body.classList.add('system');
      applySystemTheme();
    }else{
      body.classList.add('light');
    }
  };
export const applyFont = (fontName) => {
  return fontName;
};


const applySystemTheme = () => {
  return;
}