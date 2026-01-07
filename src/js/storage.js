// generic storage helpers
const STORAGE_KEYS = {
  NOTES: "notes",
  PREFERENCES: "preferences",
  DRAFT: "draft",
  AUTH: "auth_user",
  USERS: "app_users",
};

//  save notes to localStorage
export const saveNotes = (notes) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return { success: true, error: null };
  } catch (error) {
    // check if it's a quota error
    if (error.name === "QuotaExceededError" || error.code === 22) {
      console.error("Storage quota exceeded!");

      // return error info for user feedback
      return {
        success: false,
        error: "quota",
        message:
          "Storage quota exceeded. Please delete some notes to free up space.",
      };
    } else {
      console.error("Error saving notes:", error);

      // return error info for user feedback
      return {
        success: false,
        error: "unknown",
        message: "Failed to save notes. Please try again.",
      };
    }
  }
};

export const loadNotes = () => {
  try {
    const storedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
    return storedNotes ? JSON.parse(storedNotes) : [];
  } catch (error) {
    console.error("Error loading notes:", error);
    return [];
  }
};

// save preferences to localStorage
export const savePreferences = (prefs) => {
  try {
    // get current preferences or default to empty object
    const currentPrefs = loadPreferences() || {};
    // merge new preferences with current preferences
    const updatedPrefs = { ...currentPrefs, ...prefs };
    // save updated preferences to localStorage
    localStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify(updatedPrefs)
    );
    return { success: true, error: null };
  } catch (error) {
    if (error.name === "QuotaExceededError" || error.code === 22) {
      return {
        success: false,
        error: "quota",
        message:
          "Storage quota exceeded. Please delete some preferences to free up space.",
      };
    } else {
      console.error("Error saving preferences:", error);
      return {
        success: false,
        error: "unknown",
        message: "Failed to save preferences. Please try again.",
      };
    }
  }
};

// load preferences from localStorage
export const loadPreferences = () => {
  try {
    const storedPrefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return storedPrefs ? JSON.parse(storedPrefs) : {};
  } catch (error) {
    console.error("Error loading preferences:", error);
    return {};
  }
};

// save draft to localStorage
export const saveDraft = (draft) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
    return { success: true, error: null };
  } catch (error) {
    console.error("Error saving draft:", error);
    return {
      success: false,
      error: "unknown",
      message: "Failed to save draft. Please try again.",
    };
  }
};

// load draft from localStorage
export const loadDraft = () => {
  try {
    const storedDraft = sessionStorage.getItem(STORAGE_KEYS.DRAFT);
    return storedDraft
      ? JSON.parse(storedDraft)
      : { success: true, error: null };
  } catch (error) {
    console.error("Error loading draft:", error);
    return {
      success: false,
      error: "unknown",
      message: "Failed to load draft. Please try again.",
      draft: null,
    };
  }
};

// clear draft from sessionStorage
export const clearDraft = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.DRAFT);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error clearing draft:", error);
    return {
      success: false,
      error: "unknown",
      message: "Failed to clear draft. Please try again.",
    };
  }
};

// save auth to localStorage
export const saveAuth = (auth) => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
    return { success: true, error: null };
  } catch (error) {
    console.error("Error saving auth:", error);
    return {
      success: false,
      error: "unknown",
      message: "Failed to save auth. Please try again.",
    };
  }
};

// load auth from localStorage
export const loadAuth = () => {
  try {
    const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
    return storedAuth ? JSON.parse(storedAuth) : [];
  } catch (error) {
    console.error("Error loading auth:", error);
    return [];
  }
};

// clear auth from localStorage
export const clearAuth = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error clearing auth:", error);
    return {
      success: false,
      error: "unknown",
      message: "Failed to clear auth. Please try again.",
    };
  }
};

// save users to localStorage
export const saveUsers = (users) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { success: true, error: null };
  } catch (error) {
    console.error("Error saving users:", error);
    return {
      success: false,
      error: "unknown",
      message: "Failed to save users. Please try again.",
    };
  }
};

// load users from localStorage
export const loadUsers = () => {
  try {
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    console.log(storedUsers);
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
};
