import { loadNotes, saveNotes } from "./storage.js";
import { showToast } from "./ui.js";

/**
 * Validates the structure of imported notes data
 * @param {any} data - The data to validate
 * @returns {{isValid: boolean, notes: Array, errors: Array}}
 */

export function validateImportedData(data) {
  const errors = [];

  // check if data is an object
  if (!data || typeof data !== "object") {
    errors.push("Invalid data format. Expected an object.");
    return { isValid: false, notes: [], errors };
  }

  // check if data has a notes array
  let notesArray = Array.isArray(data.notes)
    ? data.notes
    : Array.isArray(data)
    ? data
    : [];

  if (!Array.isArray(notesArray) || notesArray.length === 0) {
    errors.push("No notes found in the imported file.");
    return { isValid: false, notes: [], errors };
  }

  // validate each note structure
  const validNotes = [];
  notesArray.forEach((note) => {
    const noteErrors = [];

    // Required fields validation
    if (!note.id || typeof note.id !== "string") {
      noteErrors.push(`Note ${index + 1}: Missing or invalid 'id' field`);
    }

    if (!note.title || typeof note.title !== "string") {
      noteErrors.push(`Note ${index + 1}: Missing or invalid 'title' field`);
    }

    if (note.content === undefined || typeof note.content !== "string") {
      noteErrors.push(`Note ${index + 1}: Missing or invalid 'content' field`);
    }

    if (!Array.isArray(note.tags)) {
      noteErrors.push(`Note ${index + 1}: 'tags' must be an array`);
    }

    if (noteErrors.length === 0) {
      validNotes.push(note);
    } else {
      errors.push(...noteErrors);
    }
  });

  return {
    isValid: errors.length === 0,
    notes: validNotes,
    errors: errors,
  };
}

/**
 * Checks if a note already exists (by ID)
 * @param {Array} existingNotes - Array of existing notes
 * @param {Object} note - Note to check
 * @returns {boolean}
 */
function isDuplicateNote(existingNotes, note) {
  return existingNotes.some((existingNote) => existingNote.id === note.id);
}

/**
 * Helper function to read file as text
 * @param {File} file - File to read
 * @returns {Promise<string>}
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (error) => {
      reject(new Error("Failed to read file: " + error.message));
    };

    reader.readAsText(file);
  });
}

/**
 * Imports notes from a JSON file
 * @param {File} file - The JSON file to import
 * @param {Object} options - Import options
 * @param {boolean} options.skipDuplicates - Skip duplicate notes (default: true)
 * @param {boolean} options.mergeStrategy - 'skip' (default) or 'replace' for duplicates
 * @returns {Promise<{success: boolean, imported: number, skipped: number, errors: Array, message?: string}>}
 */

export async function importNotes(file, options = {}) {
  const {
    skipDuplicates = true,
    mergeStrategy = "skip", // 'skip' or 'replace'
  } = options;

  try {
    // Read file content
    const fileContent = await readFileAsText(file);

    // Parse JSON
    let importedData;
    try {
      importedData = JSON.parse(fileContent);
    } catch (parseError) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: ["Invalid JSON format: " + parseError.message],
      };
    }

    // Validate imported data
    const validation = validateImportedData(importedData);
    
    if (!validation.isValid && validation.notes.length === 0) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: validation.errors
      };
    }

    // Get existing notes
    const existingNotes = loadNotes();
    const existingNoteIds = new Set(existingNotes.map(note => note.id));
    
    // Process notes for import
    let importedCount = 0;
    let skippedCount = 0;
    const notesToAdd = [];
    const errors = [...validation.errors]; // Include validation errors

    validation.notes.forEach(note => {
        // Check for duplicates
      if (isDuplicateNote(existingNotes, note)) {
        if (skipDuplicates && mergeStrategy === 'skip') {
          skippedCount++;
          return; // Skip this note
        } else if (mergeStrategy === 'replace') {
          // Remove existing note and add new one
          const existingIndex = existingNotes.findIndex(n => n.id === note.id);
          if (existingIndex !== -1) {
            existingNotes.splice(existingIndex, 1);
          }
          notesToAdd.push(note);
          importedCount++;
          return;
        }
      }

       // Normalize dates
       if (note.createdAt) {
        note.createdAt = new Date(note.createdAt).toISOString();
      } else {
        note.createdAt = new Date().toISOString();
      }
      
      if (note.lastEdited) {
        note.lastEdited = new Date(note.lastEdited).toISOString();
      } else {
        note.lastEdited = new Date().toISOString();
      }
      
      // Ensure tags is an array
      if (!Array.isArray(note.tags)) {
        note.tags = [];
      }
      
      // Ensure isArchived is boolean
      if (typeof note.isArchived !== 'boolean') {
        note.isArchived = false;
      }
      
      notesToAdd.push(note);
      importedCount++;
    });

    // Save all notes (existing + new)
    const allNotes = [...existingNotes, ...notesToAdd];
    const saveResult = saveNotes(allNotes);
    
    if (!saveResult.success) {
      return {
        success: false,
        imported: 0,
        skipped: skippedCount,
        errors: [saveResult.message || 'Failed to save imported notes']
      };
    }

    // Build success message
    let message = `Successfully imported ${importedCount} note${importedCount !== 1 ? 's' : ''}`;
    if (skippedCount > 0) {
      message += `, skipped ${skippedCount} duplicate${skippedCount !== 1 ? 's' : ''}`;
    }
    if (errors.length > 0) {
      message += `, ${errors.length} error${errors.length !== 1 ? 's' : ''} encountered`;
    }
    
    return {
      success: true,
      imported: importedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : [],
      message: message
    };
  } catch (error) {
    console.error('Error importing notes:', error);
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [error.message || 'Failed to import notes']
    };
  }
}


/**
 * Sets up file input for import
 * @param {HTMLInputElement|string} fileInput - File input element or selector
 * @param {Object} options - Import options
 * @param {boolean} options.skipDuplicates - Skip duplicate notes (default: true)
 * @param {string} options.mergeStrategy - 'skip' (default) or 'replace' for duplicates
 * @param {Function} options.onSuccess - Optional success callback
 * @param {Function} options.onError - Optional error callback
 * @returns {Function} Cleanup function
 */

export function setupImportFileInput(fileInput, options = {}){
    const {
        skipDuplicates = true,
        mergeStrategy = 'skip',
        onSuccess,
        onError
      } = options;
    
      const inputElement = typeof fileInput === 'string' 
    ? document.querySelector(fileInput) 
    : fileInput;
  
  if (!inputElement) {
    console.warn('Import file input not found');
    return () => {};
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      return;
    }

    // Validate file type
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        showToast('error', 'Please select a valid JSON file', { duration: 4000 });
        inputElement.value = ''; // Reset input
        return;
    }

    
    // Show loading state (optional)
    const loadingToast = showToast('saved', 'Importing notes...', { duration: 0 });

    try{
        const result = await importNotes(file, { skipDuplicates, mergeStrategy });
      
        // Remove loading toast
        if (loadingToast) {
          document.querySelectorAll('.toast-notification').forEach(toast => {
            if (toast.textContent.includes('Importing')) {
              toast.remove();
            }
          });
        }

        if (result.success) {
            showToast('saved', result.message || `Successfully imported ${result.imported} notes`, {
              duration: 5000
            });
            
            // Dispatch event to refresh notes
            document.dispatchEvent(new CustomEvent('notesImported', {
              detail: { imported: result.imported, skipped: result.skipped }
            }));
            
            if (onSuccess) {
              onSuccess(result);
            }
          } else {
            const errorMessage = result.errors.length > 0
              ? result.errors[0]
              : 'Failed to import notes';
            showToast('error', errorMessage, { duration: 5000 });
            
            if (onError) {
              onError(result);
            }
          }
    }catch(error){
        showToast('error', 'An error occurred during import: ' + error.message, { duration: 5000 });
      
      if (onError) {
        onError({ success: false, error: error.message });
      }
    } finally {
        // Reset file input
      inputElement.value = '';
    }
  };

  inputElement.addEventListener('change', handleFileChange);
  
  // Return cleanup function
  return () => {
    inputElement.removeEventListener('change', handleFileChange);
  };
}



/**
 * Sets up import button that triggers file input
 * @param {HTMLElement|string} button - Button element or selector
 * @param {HTMLInputElement|string} fileInput - File input element or selector
 * @returns {Function} Cleanup function
 */
export function setupImportButton(button, fileInput) {
    const buttonElement = typeof button === 'string' 
      ? document.querySelector(button) 
      : button;
    
    const inputElement = typeof fileInput === 'string' 
      ? document.querySelector(fileInput) 
      : fileInput;
    
    if (!buttonElement || !inputElement) {
      console.warn('Import button or file input not found');
      return () => {};
    }
    
    const handleClick = () => {
      inputElement.click();
    };
    
    buttonElement.addEventListener('click', handleClick);
    
    // Return cleanup function
    return () => {
      buttonElement.removeEventListener('click', handleClick);
    };
  };
