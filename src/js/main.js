// import * as storage from './storage.js';
// import * as noteManager from './noteManager.js';
// import * as ui from './ui.js';
// import * as themes from './themes.js';
import { initThemeFromStorage } from './theme.js';

// Initialize app, set up event listeners, and load data
const initializeApp = () => {
    // initialize theme from localStorage
    initThemeFromStorage();
}

if(document.body){
    initializeApp();
}


