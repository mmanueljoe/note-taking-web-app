import * as storage from './storage.js';
import * as noteManager from './noteManager.js';
import * as ui from './ui.js';
import * as theme from './theme.js';
import * as geolocation from './geolocation.js';
import { formatDate } from './utils.js';

// helper function to refresh everything
function refreshNotes() {
    const allNotes = noteManager.getAllNotes();
    ui.renderAllNotes(allNotes);

    const uniqueTags = ui.getAllUniqueTags();
    ui.renderTagLinks(uniqueTags);
}

// Initialize app, set up event listeners, and load data
const initializeApp = () => {
    // get all notes
    const allNotes = noteManager.getAllNotes();
    console.log(allNotes);

    // render all notes
    ui.renderAllNotes(allNotes);


    //  get unique tags
    const uniqueTags = ui.getAllUniqueTags();
    console.log(uniqueTags);

    // render tags links (desktop)
    ui.renderTagLinks(uniqueTags);

    // initialize tags menu(mobile/tablet)
    ui.initializeTagsMenu();

    // initialize theme from localStorage
    theme.initThemeFromStorage();

    // setup event listeners
    setupEventListeners();

}


// event listeners
function setupEventListeners() {

    // === create note ===
    // create note desktop only
    const desktopCreateBtn = document.querySelector(".add-note-btn.desktop-only");
    if(desktopCreateBtn) {
        desktopCreateBtn.addEventListener("click", () => {
            showCreateNoteForm();
        });
    }

    // create note mobile/tablet only
    const mobileTabletCreateBtn = document.querySelector(".addNote-btn.mobile-tablet-only");
    if(mobileTabletCreateBtn) {
        mobileTabletCreateBtn.addEventListener("click", () => {
            showCreateNoteForm();
        });
    }

    // === delete note ===
    document.addEventListener("deleteNote", (e) => {
        const { noteId } = e.detail;
        noteManager.deleteNote(noteId);
        refreshNotes();

        // clear note detail view if it was open
        const detailContainer = document.querySelector('.app-main-container-content');
        if(detailContainer){
            detailContainer.innerHTML = "";
        }

        // show success message
    });

    // === update note ===
    document.addEventListener("updateNote", (e) => {
        const {noteId, title, content, tags} = e.detail;

        // update the note
        noteManager.updateNote(noteId, {title, content, tags});

        // refresh the display
        refreshNotes();
        
    });

    // === all notes link ===
    const allNotesLink = document.querySelector(".all-notes-link");
    if(allNotesLink) {
        allNotesLink.addEventListener("click", (e) => {
            e.preventDefault();
            const unarchivedNotes = noteManager.getUnarchivedNotes();
            ui.renderAllNotes(unarchivedNotes);

            ui.toggleArchiveView(false);
        });
    }


    // === archived note ===
    const archiveNoteLink = document.querySelector(".archived-notes-link");
    if(archiveNoteLink) {
        archiveNoteLink.addEventListener("click", (e) => {
            e.preventDefault();
            const archivedNotes = noteManager.getArchivedNotes();
            ui.renderAllNotes(archivedNotes);

            ui.toggleArchiveView(true);
        });
    }


    // === filter notes by tag ===
    document.addEventListener("filterByTag", (e) => {
        const { tag } = e.detail;
        const filteredNotes = noteManager.filterByTag(tag);
        ui.renderAllNotes(filteredNotes, tag);
    });

    // show all notes (backbutton)
    document.addEventListener("showAllNotes", () => {
        const allNotes = noteManager.getAllNotes();
        ui.renderAllNotes(allNotes);
    });

    // show note details
    document.addEventListener("showNoteDetails", (e) => {
        const { noteId } = e.detail;
        const note = noteManager.getNoteById(noteId);
        ui.renderNoteDetails(note);
    });

    // archive note
    document.addEventListener("archiveNote", (e) => {
        const { noteId, isArchived } = e.detail;
        noteManager.updateNote(noteId, {isArchived: !isArchived});
        refreshNotes();
    });

    // === search functionality ===
    const searchInput = document.querySelector(".search-container input[type='text']");
    if(searchInput){
        // debounce
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);

            const query = e.target.value.trim();

            searchTimeout = setTimeout(() => {
                if(query.length === 0){
                    refreshNotes();
                    return;
                } else {
                    const results = noteManager.searchNotes(query);
                    ui.renderAllNotes(results);

                    const headerTitle = document.querySelector(".app-main-container-header h2");
                    if(headerTitle){
                        headerTitle.textContent = `Search Results for "${query}"`;
                    }
                }
            }, 500);
  
        });
    }


    // === note click event delegation ===
    const notesContainer = document.querySelector('.app-main-container-nav .content');
    if(notesContainer){
        notesContainer.addEventListener('click', (e) => {
            e.preventDefault();

            // find the closest note card
            const noteCard = e.target.closest('.note-card');
            if(!noteCard) return;

            // get note id
            const noteId = noteCard.getAttribute('data-note-id');

            // show note details
            const note = noteManager.getNoteById(noteId);
            if(note){
                ui.renderNoteDetails(note);
            }
        });
    }


    // === note keyboard navigation ===
    document.addEventListener('keydown', (e) => {
        // enter key on form inputs
        if(e.key === 'Enter' && e.target.matches('input, textarea')) {
            const form = e.target.closest('form');
            if(form && e.target.matches('textarea')) {
                e.preventDefault();

                const submitButton = form.querySelector('button[type="submit"]');
                if(submitButton) {
                    submitButton.click();
                }
            }
        }

        // escape key on form inputs
        if(e.key === 'Escape'){
            const detailContainer = document.querySelector('.app-main-container-content');
            if(detailContainer) {
                detailContainer.innerHTML = "";
                document.dispatchEvent(new CustomEvent("showNotesList"));
            }
 
        }

        // arrow keys for note list navigation (implement later)
    });

    // keyboard navigation for note cards
    const noteContainer = document.querySelector('.app-main-container-nav .content');
    if(noteContainer){
        noteContainer.addEventListener('keydown', (e) => {
            if(e.target.classList.contains('note-card')) {
                e.preventDefault();
                const noteId = e.target.getAttribute('data-note-id');
                if(noteId){
                    const note = noteManager.getNoteById(noteId);
                    if(note) {
                        ui.renderNoteDetails(note);
                    }
                }
            }
        });
    }
}


// === helper functions ===

// function manageFocus(action, element){
//     if(action === 'set'){
//         element?.focus();
//     } else if(action === 'trap'){
//         // trap focus within a container(for modals)
//         const focusableElements = element.querySelectorAll('button, input, textarea, [href], select, [tabindex]:not([tabindex="-1"])');

//         const firstFocusable = focusableElements[0];
//         const lastFocusable = focusableElements[focusableElements.length - 1];

//         element.addEventListener('keydown', (e) => {
//             if(e.key === 'Tab'){
//                 if(e.shiftKey && document.activeElement === firstFocusable){
//                     e.preventDefault();
//                     lastFocusable.focus();
//                 } else if(!e.shiftKey && document.activeElement === lastFocusable){
//                     e.preventDefault();
//                     firstFocusable.focus();
//                 }
//             }
//         });
//     } 
// }


// show create note form
function showCreateNoteForm() {
    const container = document.querySelector('.app-main-container-content');
    if(!container) return false;

    // clear existing content
    container.innerHTML = "";

    // create form wrapper
    const formWrapper = document.createElement("div");
    formWrapper.classList.add("note-details-wrapper");

    // create form html
    formWrapper.innerHTML = `
      <form id="create-note-form">
        <div class="form-group">
          <input type="text" id="note-title" name="note-title" placeholder="Enter a title..." required>
        </div>
        <div class="form-group">
        <label for="note-tags">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path fill-rule="evenodd" clip-rule="evenodd" d="M2.01055 3.9783C2.01249 3.03712 2.72405 2.19324 3.64772 2.03432C3.83712 2.00124 6.05872 2.00578 6.97787 2.00643C7.88727 2.00708 8.6624 2.33399 9.30454 2.97485C10.668 4.3357 12.0301 5.69785 13.3903 7.06132C14.1953 7.86759 14.2063 9.10519 13.4046 9.91405C12.2481 11.0816 11.0857 12.2433 9.9188 13.3999C9.1106 14.2009 7.873 14.1905 7.06607 13.3856C5.69029 12.0137 4.31452 10.6418 2.94459 9.26405C2.41465 8.73092 2.10201 8.08679 2.0326 7.33372C1.97681 6.73179 2.00925 4.49397 2.01055 3.9783Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
             <path fill-rule="evenodd" clip-rule="evenodd" d="M6.60475 5.54289C6.60215 6.12277 6.11761 6.59953 5.53189 6.59823C4.95006 6.59693 4.46552 6.11175 4.46877 5.53381C4.47266 4.93057 4.95006 4.46031 5.55719 4.4629C6.13318 4.46485 6.60734 4.95327 6.60475 5.54289Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="form-group-label">
              Tags
            </span>
        </label>
        <input type="text" id="note-tags" name="note-tags" placeholder="Add tags separated by commas(e.g. Work, Planning)" required>
        </div>
        <div class="form-group">
        <label for="note-last-edited">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.16699 2.5C5.12919 2.5 2.66699 4.96219 2.66699 8C2.66699 11.0372 5.12923 13.5 8.16699 13.5C11.2048 13.5 13.667 11.0372 13.667 8C13.667 4.96219 11.2048 2.5 8.16699 2.5ZM1.66699 8C1.66699 4.40991 4.57691 1.5 8.16699 1.5C11.7571 1.5 14.667 4.40991 14.667 8C14.667 11.5894 11.7571 14.5 8.16699 14.5C4.57687 14.5 1.66699 11.5894 1.66699 8Z" fill="currentColor"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.94824 5.21777C8.22438 5.21777 8.44824 5.44163 8.44824 5.71777V8.16619L10.3212 9.28553C10.5583 9.42719 10.6356 9.73419 10.494 9.97126C10.3523 10.2083 10.0453 10.2856 9.80824 10.1439L7.69171 8.87906C7.54071 8.78879 7.44824 8.62586 7.44824 8.44986V5.71777C7.44824 5.44163 7.67211 5.21777 7.94824 5.21777Z" fill="currentColor"/>
            </svg>
            <span class="form-group-label">
              Last Edited
            </span>
        </label>
        <span id="note-last-edited" class="form-group-value">
            ${formatDate(new Date())}
        </span>
        </div>
        <div class="form-group">
          <textarea id="note-content" name="note-content" placeholder="Start typing your note here..." required></textarea>
        </div>
        <div class="form-group">
          <button type="submit" class="create-note-btn" id="create-note-btn">Create Note</button>
          <button type="button" class="cancel-btn" id="create-cancel-btn">Cancel</button>
        </div>
      </form>
    `;

    container.appendChild(formWrapper);


    // add location permission request button to form
    const locationButton = document.createElement("button");
    locationButton.type = "button";
    locationButton.classList.add("location-button");
    locationButton.textContent = "Add Location";
    locationButton.addEventListener('click', async () =>{
        try{
            const location = await geolocation.requestLocationPermission();

            locationButton.setAttribute('data-location', JSON.stringify(location));
            locationButton.textContent = 'Location Added';
        }catch(error){
            console.error("Error requesting location:", error);

            // show error message to user through ui
            ui.showValidationError('location', error.message);
        }
    });

    // add event listener to create note button
    const createNoteBtn = document.getElementById("create-note-btn");
    if(createNoteBtn) {
        createNoteBtn.addEventListener("click", (e) => {
            e.preventDefault();
           handleCreateNote();
        });
    }
    
    // add event listener to cancel button
    const cancelBtn = document.getElementById("create-cancel-btn");
    if(cancelBtn) {
        cancelBtn.addEventListener("click", (e) => {
            e.preventDefault();
            container.innerHTML = "";
        });
    }
    // add event listener to form
    const form = document.getElementById("create-note-form");
    if(form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            handleCreateNote();
        });
    }

    // add event listener to draft save button
    const titleInput = document.getElementById("note-title");
    const contentInput = document.getElementById("note-content");
    const tagsInput = document.getElementById("note-tags");
    
    // debounce function for autosave
    let draftTimeout;
    const autosaveDraft = () => {
        clearTimeout(draftTimeout);
        draftTimeout = setTimeout(() => {
            const draft = {
                title: titleInput.value.trim(),
                content: contentInput.value,
                tags: tagsInput.value.trim().split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
                lastEdited: formatDate(new Date()),
            }
            storage.saveDraft(draft);
            console.log("Draft saved:", draft);
        }, 1000);
    };

    // input listeners for auto-save
    if(titleInput){
        titleInput.addEventListener("input", autosaveDraft);
    }
    if(contentInput){
        contentInput.addEventListener("input", autosaveDraft);
    }
    if(tagsInput){
        tagsInput.addEventListener("input", autosaveDraft);
    }

    // restore draft on form load
    const savedDraft = storage.loadDraft();
    if(savedDraft){
        if(titleInput) titleInput.value = savedDraft.title || "";
        if(contentInput) contentInput.value = savedDraft.content || "";
        if(tagsInput) tagsInput.value = savedDraft.tags.join(", ") || "";
        if(tagsInput) tagsInput.value = savedDraft.tags.join(", ");
        console.log("Draft restored:", savedDraft);
    }

    // clear draft on form submission
    // form.addEventListener("submit", () => {
    //     storage.clearDraft();
    //     console.log("Draft cleared");
    // });
}

// handle create note submission
function handleCreateNote() {
    const titleInput = document.getElementById("note-title").value;
    const contentInput = document.getElementById("note-content").value;
    const tagsInput = document.getElementById("note-tags").value;
    const locationButton = document.querySelector(".location-button");

    let location = null;
    if(locationButton && locationButton.hasAttribute('data-location')) {
        location = JSON.parse(locationButton.getAttribute('data-location'));
    }

    const title = titleInput.trim();
    const content = contentInput.trim();

    // parse tags into array
    const tags = tagsInput.trim().split(",").map(tag => tag.trim());

    // validate inputs
    if(!title || !content) {
        alert("Please enter a title and content");
        return;
    }

    try{
        // create note object
    const newNote = noteManager.createNote(title, content, tags);
    newNote.location = location;

    // save note to storage
    // noteManager.saveNotes([...storage.getNotes(), newNote]);
    const allNotes = noteManager.getAllNotes();
    allNotes.push(newNote);

    const result = storage.saveNotes(allNotes);
    if(!result.success){
        alert(result.message); // remember to show error in ui 
        return;
    }

    // clear draft on successful note creation
    storage.clearDraft();
    console.log("Draft cleared");

    // refresh notes
    refreshNotes();

    // clear form/ close create view
    // const container = document.querySelector('.app-main-container-content');
    // if(container) {
    //     container.innerHTML = "";
    // }

    // show success message

    // show newly created note in detail view
    // ui.renderNoteDetails(newNote);
    } catch (error) {
        console.error("Error creating note:", error);
        // alert("Failed to create note. Please try again.");
    }
    
}
// initialize app
document.addEventListener("DOMContentLoaded", () => {
    initializeApp()
});
