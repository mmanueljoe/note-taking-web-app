// generic storage helpers
const STORAGE_KEYS = {
    NOTES: 'notes',
    PREFERENCES: 'preferences',
    DRAFT: 'draft',
}


//  save notes to localStorage
export const saveNotes = (notes) => {
    try {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
        return true;
    }catch(error){
        console.error('Error saving notes:', error);
        return false;
    }
}

export const loadNotes = () => {
    try {
        const storedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
        return storedNotes ? JSON.parse(storedNotes) : [];
    }catch(error){
        console.error('Error loading notes:', error);
        return [];
    }
}

// save preferences to localStorage
export const savePreferences = (prefs) => {
    try {
        // get current preferences or default to empty object
        const currentPrefs = loadPreferences() || {};
        // merge new preferences with current preferences
        const updatedPrefs = { ...currentPrefs, ...prefs };
        // save updated preferences to localStorage
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updatedPrefs));
        return true;
    }catch(error){
        console.error('Error saving preferences:', error);
        return false; 
    }
}


// load preferences from localStorage
export const loadPreferences = () => {
    try{
        const storedPrefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
        return storedPrefs ? JSON.parse(storedPrefs) : {};
    } catch(error){
        console.error('Error loading preferences:', error);
        return {};
    }
}


// save draft to localStorage
export const saveDraft = (draft) => {
    try{
        localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
        return true;
    }catch(error){
        console.error('Error saving draft:', error);
        return false;
    }
}

// load draft from localStorage
export const loadDraft = () => {
    try{
        const storedDraft = localStorage.getItem(STORAGE_KEYS.DRAFT);
        return storedDraft ? JSON.parse(storedDraft) : null;
    }catch(error){
        console.error('Error loading draft:', error);
        return null;
    }
}