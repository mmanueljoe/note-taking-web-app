import * as storage from './storage.js';
import * as noteManager from './noteManager.js';
import * as ui from './ui.js';
import * as theme from './theme.js';
import * as geolocation from './geolocation.js';
import { formatDate } from './utils.js';
import { isAuthenticated } from './auth.js';
import { initRichTextEditor } from './richText.js';
import { getSharedNoteFromUrl } from './share.js';


// check if user is authenticated
function checkAuth(){
    // Don't check auth on login/signup pages
    const currentPath = window.location.pathname;
    if (currentPath.includes('/auth/')) {
        return true; // Skip auth check on auth pages
    }
    
    if(!isAuthenticated()){
        // redirect to login page
        window.location.href = './auth/login.html';
        return false;
    }
    return true;
}

// validation rules
const VALIDATION_RULES = {
    title: {
        required: true,
        minLength: 3,
        maxLength: 100,
        message: 'Title is required and must be between 3 and 100 characters.',
    },
    content: {
        required: true,
        minLength: 10,
        maxLength: 1000,
        message: 'Content is required and must be between 10 and 1000 characters.',
    },
    tags: {
        required: true,
        minLength: 1,
        maxLength: 10,
        message: 'Tags are required and must be between 1 and 10 tags.',
    },
    location: {
        required: false,
        message: 'Location is optional.',
    },
}

// validate a single field
function validateField(fieldId, value){
    const field = VALIDATION_RULES[fieldId];
    if(!field) return {isValid: true};

    const trimmedValue = value.trim();

    if(field.required && !trimmedValue){
        return {
            isValid: false,
            message: `${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)} is required.`
        };
    }

    if(field.minLength && trimmedValue.length < field.minLength){
        return {
            isValid: false,
            message: field.message || `${fieldId} must be at least ${field.minLength} characters.`
        };
    }

    return { isValid: true};
}

// check if entire form is valid
function isFormValid(){
    const titleInput = document.getElementById("note-title");
    const contentInput = document.getElementById("note-content");

    if(!titleInput || !contentInput) return false;

    const titleValidation = validateField("title", titleInput.value);
    const contentValidation = validateField('content', contentInput.value);

    return titleValidation.isValid && contentValidation.isValid;
}

// update submit button state
function updateSubmitButtonState(){
    const submitButton = document.getElementById("create-note-btn");

    if(!submitButton) return;

    const valid = isFormValid();
    submitButton.disabled = !valid;
    submitButton.classList.toggle('disabled', !valid);
}

// helper function to refresh everything
function refreshNotes() {
    // check what view the user is currently on
    const isArchivedView = document.querySelector('.archived-notes-link.is-active');

    if(isArchivedView){
        const archivedNotes = noteManager.getArchivedNotes();
        ui.renderAllNotes(archivedNotes, null, 'archived');
    } else {
        const unarchivedNotes = noteManager.getUnarchivedNotes();
        ui.renderAllNotes(unarchivedNotes, null, 'all');
    }

    // render tags links
    const uniqueTags = ui.getAllUniqueTags();
    ui.renderTagLinks(uniqueTags);
}


// Track previous viewport state
// Note: Tablet (< 1024px) is treated the same as mobile - both use content area for notes
// Desktop (>= 1024px) uses nav sidebar for notes
let previousViewport = window.innerWidth >= 1024 ? 'desktop' : 'mobile-tablet';

// Handle viewport changes (mobile/tablet < 1024px, desktop >= 1024px)
function handleViewportChange() {
    // Breakpoint: < 1024px = mobile/tablet (same behavior), >= 1024px = desktop
    const currentViewport = window.innerWidth >= 1024 ? 'desktop' : 'mobile-tablet';
    
    // Only handle if viewport actually changed
    if (currentViewport !== previousViewport) {
        const isDesktop = currentViewport === 'desktop';
        const contentContainer = document.querySelector('.app-main-container-content');
        
        if (isDesktop) {
            // Switched to desktop: clear content area and re-render notes in nav
            // (Mobile and tablet both use content area, desktop uses nav sidebar)
            if (contentContainer) {
                // Preserve tags menu and note details wrapper
                // const tagsMenu = contentContainer.querySelector('#tags-menu-sm');
                // const noteDetails = contentContainer.querySelector('.note-details-wrapper');
                const children = Array.from(contentContainer.children);
                children.forEach((child) => {
                    // Only remove notes list, not tags menu or note details
                    if (child.id !== 'tags-menu-sm' && !child.classList.contains('note-details-wrapper')) {
                        child.remove();
                    }
                });
            }
            
            // Re-render notes in the correct location (nav container for desktop)
            const currentViewType = document.querySelector('.archived-notes-link.is-active') ? 'archived' : 'all';
            const archivedNotes = noteManager.getArchivedNotes();
            const unarchivedNotes = noteManager.getUnarchivedNotes();
            
            if (currentViewType === 'archived') {
                ui.renderAllNotes(archivedNotes, null, 'archived');
            } else {
                ui.renderAllNotes(unarchivedNotes, null, 'all');
            }
            
            // Remove has-note-selected class if no note is selected
            const appMainContainer = document.querySelector('.app-main-container');
            const selectedNote = document.querySelector('.note-card.is-selected');
            const noteDetails = document.querySelector('.note-details-wrapper');
            if (!selectedNote && !noteDetails && appMainContainer) {
                appMainContainer.classList.remove('has-note-selected');
                const actionsColumn = document.querySelector('.app-main-container-actions');
                if (actionsColumn) {
                    actionsColumn.remove();
                }
            }
        } else {
            // Switched to mobile/tablet: ensure notes are in content area
            // (Both mobile and tablet use the same layout - content area for notes)
            const currentViewType = document.querySelector('.archived-notes-link.is-active') ? 'archived' : 'all';
            const archivedNotes = noteManager.getArchivedNotes();
            const unarchivedNotes = noteManager.getUnarchivedNotes();
            
            if (currentViewType === 'archived') {
                ui.renderAllNotes(archivedNotes, null, 'archived');
            } else {
                ui.renderAllNotes(unarchivedNotes, null, 'all');
            }
        }
        
        previousViewport = currentViewport;
    }
}

// Initialize app, set up event listeners, and load data
const initializeApp = () => {
    // Don't initialize on settings page
    if(document.querySelector('.settings-section')){
        return;
    }
    
    // check if user is authenticated
    if(!checkAuth()){
        return;
    }

    // get all notes
    const allNotes = noteManager.getAllNotes();

    // render all notes
    ui.renderAllNotes(allNotes);

    // Set initial active state for "All Notes" link
    ui.setMenuLinkActive('.all-notes-link');


    //  get unique tags
    const uniqueTags = ui.getAllUniqueTags();

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

        // remove 3-column layout
        const appMainContainer = document.querySelector('.app-main-container');
        if(appMainContainer){
            appMainContainer.classList.remove('has-note-selected');
        }

        // clear actions columns
        const actionsColumn = document.querySelector('.app-main-container-actions');
        if(actionsColumn){
            actionsColumn.innerHTML = "";
        }

        // show toast notification
        ui.showToastDeleted();
    });

    // === save note (from detail view) ===
    document.addEventListener("saveNote", (e) => {
        const {noteId, title, content, tags} = e.detail;

        // update the note
        noteManager.updateNote(noteId, {title, content, tags});

        // refresh the display
        refreshNotes();
        
        // show toast notification
        ui.showToastSaved();
    });

    // === all notes link ===
    const allNotesLink = document.querySelector(".all-notes-link");
    if(allNotesLink) {
        allNotesLink.addEventListener("click", (e) => {
            e.preventDefault();

            // clear content area
            const contentContainer = document.querySelector('.app-main-container-content');
            if(contentContainer){
                const formWrapper = contentContainer.querySelector('.note-details-wrapper');
                if(formWrapper){
                    formWrapper.remove();
                }
            }

            //clear the has-note-selected class if it exists
            const appMainContainer = document.querySelector('.app-main-container');
            if(appMainContainer){
                appMainContainer.classList.remove('has-note-selected');
            }

            // clear the actions column
            const actionsColumn = document.querySelector('.app-main-container-actions');
            if(actionsColumn){
                actionsColumn.remove();
            }
            
            // render the notes
            const unarchivedNotes = noteManager.getUnarchivedNotes();
            ui.renderAllNotes(unarchivedNotes, null, "all");

            ui.toggleArchiveView(false);
        });
    }

    // === archived note ===
    const archiveNoteLink = document.querySelector(".archived-notes-link");
    if(archiveNoteLink) {
        archiveNoteLink.addEventListener("click", (e) => {
            e.preventDefault();

            //clear the content area
            const contentContainer = document.querySelector('.app-main-container-content');
            if(contentContainer){
                const formWrapper = contentContainer.querySelector('.note-details-wrapper');
                if(formWrapper){
                    formWrapper.remove();
                }
            }

            // remove has-note-selected class if it exists
            const appMainContainer = document.querySelector('.app-main-container');
            if(appMainContainer){
                appMainContainer.classList.remove('has-note-selected');
            }

            // clear the actions column
            const actionsColumn = document.querySelector('.app-main-container-actions');
            if(actionsColumn){
                actionsColumn.remove();
            }

            // render the notes
            const archivedNotes = noteManager.getArchivedNotes();
            ui.renderAllNotes(archivedNotes, null, 'archived');

            ui.toggleArchiveView(true);
        });
    }


    // === filter notes by tag ===
    document.addEventListener("filterNotesByTag", (e) => {
        const { tag } = e.detail;
        const filteredNotes = noteManager.filterByTag(tag);
        ui.renderAllNotes(filteredNotes, tag, "all");
    });

    // show all notes (backbutton)
    document.addEventListener("showAllNotes", () => {
        // Clear all active states and set all notes link as active
        ui.clearMenuActiveStates();
        const allNotesLink = document.querySelector(".all-notes-link");
        if (allNotesLink) allNotesLink.classList.add("is-active");

        const allNotes = noteManager.getAllNotes();
        ui.renderAllNotes(allNotes, null, 'all');
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

        noteManager.updateNote(noteId, {isArchived: isArchived});

        // close note details view if it was open
        const contentContainer = document.querySelector('.app-main-container-content');
        if(contentContainer){
            const noteDetails = contentContainer.querySelector('.note-details-wrapper');
            if(noteDetails){
                noteDetails.remove();
            }
        }

        // remove has-note-selected class if it exists
        const appMainContainer = document.querySelector('.app-main-container');
        if(appMainContainer){
            appMainContainer.classList.remove('has-note-selected');
        }

        // clear the actions column
        const actionsColumn = document.querySelector('.app-main-container-actions');
        if(actionsColumn){
            actionsColumn.remove();
        }

        refreshNotes();
        
        // show toast notification
        ui.showToastArchived(isArchived);
    });

    // show archived notes (from toast link)
    document.addEventListener("showArchivedNotes", () => {
        const archivedNotes = noteManager.getArchivedNotes();
        ui.renderAllNotes(archivedNotes);
        ui.toggleArchiveView(true);
        
        // Update nav link active state
        const archiveLink = document.querySelector(".archived-notes-link");
        const allNotesLink = document.querySelector(".all-notes-link");
        if (archiveLink) archiveLink.classList.add("is-active");
        if (allNotesLink) allNotesLink.classList.remove("is-active");
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

                    // Check what view the user is currently on
                    const isArchivedView = document.querySelector('.archived-notes-link.is-active');
                    
                    // Get all notes first
                    let notesToSearch;
                    if (isArchivedView) {
                        // Search only in archived notes
                        notesToSearch = noteManager.getArchivedNotes();
                    } else {
                        // Search only in unarchived notes
                        notesToSearch = noteManager.getUnarchivedNotes();
                    }

                    // Filter the notes by search query
                    const results = notesToSearch.filter(
                        (note) =>
                            note.title.toLowerCase().includes(query.toLowerCase()) ||
                            note.content.toLowerCase().includes(query.toLowerCase()) ||
                            note.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
                    );
                    
                    // Clear note details area when searching
                    const contentContainer = document.querySelector('.app-main-container-content');
                    if(contentContainer){
                        const noteDetails = contentContainer.querySelector('.note-details-wrapper');
                        if(noteDetails){
                            noteDetails.remove();
                        }
                    }
                    
                    // Remove has-note-selected class
                    const appMainContainer = document.querySelector('.app-main-container');
                    if(appMainContainer){
                        appMainContainer.classList.remove('has-note-selected');
                    }

                    // Clear actions column
                    const actionsColumn = document.querySelector('.app-main-container-actions');
                    if(actionsColumn){
                        actionsColumn.remove();
                    }
                    
                    // Render results in nav (without auto-selecting)
                    ui.renderAllNotes(results, null, isArchivedView ? 'archived' : 'all', false, query);

                    const headerTitle = document.querySelector(".app-main-container-header h2");
                    if(headerTitle){
                        headerTitle.textContent = `Search Results for "${query}"`;
                    }
                }
            }, 500);
  
        });
    }

    // search link (mobile/tablet only)
    const searchLink = document.querySelector(".search-link.mobile-tablet-only");
    if(searchLink){
        searchLink.addEventListener("click", (e) => {
            e.preventDefault();

            // clear active states and set search
            ui.clearMenuActiveStates();
            searchLink.classList.add('is-active');


            ui.renderSearchView();
        });
    }

    // Handle mobile/tablet search
    document.addEventListener("searchNotesMobile", (e) => {
        const { query } = e.detail;
        const results = noteManager.searchNotes(query);
        ui.renderSearchResults(query, results);
    });


    // === note click event delegation ===
    // const notesContainer = document.querySelector('.app-main-container-nav .content');
    // if(notesContainer){
    //     notesContainer.addEventListener('click', (e) => {
    //         e.preventDefault();

    //         // find the closest note card
    //         const noteCard = e.target.closest('.note-card');
    //         if(!noteCard) return;

    //         // get note id
    //         const noteId = noteCard.getAttribute('data-note-id');

    //         // show note details
    //         const note = noteManager.getNoteById(noteId);
    //         if(note){
    //             ui.renderNoteDetails(note);
    //         }
    //     });
    // }
    document.addEventListener('click', (e) => {

        const noteCard = e.target.closest('.note-card');
        if(!noteCard) return;


        const noteId = noteCard.getAttribute('data-note-id');
        if(!noteId) return;


        const note = noteManager.getNoteById(noteId);
        if(note){
            ui.renderNoteDetails(note);
        }
    });


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

        // arrow keys for note list navigation
        // Only work when not typing in input/textarea and note list is visible
        if((e.key === 'ArrowUp' || e.key === 'ArrowDown') && 
           !e.target.matches('input, textarea') && 
           !e.target.isContentEditable &&
           !document.querySelector('.modal')) { // Don't navigate when modal is open
            
            const noteList = document.querySelector('.notes-list');
            if(!noteList) return;
            
            const noteCards = Array.from(noteList.querySelectorAll('.note-card'));
            if(noteCards.length === 0) return;
            
            // Find currently focused/selected note card
            let currentIndex = -1;
            const focusedCard = document.activeElement;
            const selectedCard = noteList.querySelector('.note-card.is-selected');
            
            if(focusedCard && focusedCard.classList.contains('note-card')) {
                currentIndex = noteCards.indexOf(focusedCard);
            } else if(selectedCard) {
                currentIndex = noteCards.indexOf(selectedCard);
            }
            
            // Determine next index
            let nextIndex;
            if(e.key === 'ArrowDown') {
                nextIndex = currentIndex < noteCards.length - 1 ? currentIndex + 1 : 0;
            } else { // ArrowUp
                nextIndex = currentIndex > 0 ? currentIndex - 1 : noteCards.length - 1;
            }
            
            // Remove selection from all cards
            noteCards.forEach(card => {
                card.classList.remove('is-selected');
            });
            
            // Focus and select the next card
            const nextCard = noteCards[nextIndex];
            nextCard.classList.add('is-selected');
            nextCard.focus();
            
            // Scroll into view if needed
            nextCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // On desktop, also show note details
            if(window.innerWidth >= 1024) {
                const noteId = nextCard.getAttribute('data-note-id');
                if(noteId) {
                    const note = noteManager.getNoteById(noteId);
                    if(note) {
                        ui.renderNoteDetails(note);
                    }
                }
            }
            
            e.preventDefault();
        }
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


    // Handle viewport resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            handleViewportChange();
        }, 150); // Debounce resize events
    });
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
// show create note form

let createRte;

function showCreateNoteForm() {
    const container = document.querySelector('.app-main-container-content');
    if(!container) return false;

    // Preserve tags menu when clearing
    const tagsMenu = container.querySelector("#tags-menu-sm");
    
    // Clear existing content but preserve tags menu
    const children = Array.from(container.children);
    children.forEach(child => {
        if(child.id !== "tags-menu-sm") {
            child.remove();
        }
    });

    if(tagsMenu){
        tagsMenu.style.display = "none";
        tagsMenu.classList.remove("is-active");
    }

    // Update header title based on screen size
  const headerTitle = document.querySelector(".app-main-container-header h2");
  if (headerTitle) {
    const isMobileOrTablet = window.innerWidth < 1024;
    if (isMobileOrTablet) {
      // Hide on mobile/tablet
      headerTitle.textContent = "";
    //   headerTitle.style.display = "none";
    }else {
        headerTitle.textContent = "Create New Note";
        headerTitle.style.display = "block";
    }
  }

    // create form wrapper
    const formWrapper = document.createElement("div");
    formWrapper.classList.add("note-details-wrapper");

    // Create header section for mobile/tablet
    const headerSection = document.createElement("div");
    headerSection.classList.add("note-details-header", "mobile-tablet-only");
    
    // Create mobile/tablet actions row
    const mobileActionsRow = document.createElement("div");
    mobileActionsRow.classList.add("note-details-header-actions", "mobile-tablet-only");
    
    mobileActionsRow.innerHTML = `
        <div class="note-details-left">
            <button class="back-button mobile-tablet-only" data-action="back">
                <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.31047 12.621L0 6.3105L6.31047 0L7.37097 1.0605L2.12097 6.3105L7.37097 11.5605L6.31047 12.621Z" fill="currentColor"/>
                </svg>
                <span class="back-button-label">Go Back</span>
            </button>
        </div>
        
        <div class="note-details-right">
            <button class="cancel-button mobile-tablet-only" data-action="cancel">Cancel</button>
            <button class="save-button mobile-tablet-only" data-action="create">Save Note</button>
        </div>
    `;

    // Back button handler
    const backButton = mobileActionsRow.querySelector('[data-action="back"]');
    backButton.addEventListener("click", () => {
        // Preserve tags menu when clearing
        const tagsMenu = container.querySelector("#tags-menu-sm");
        
        const children = Array.from(container.children);
        children.forEach(child => {
            if(child.id !== "tags-menu-sm") {
                child.remove();
            }
        });
        
        if(tagsMenu) {
            tagsMenu.style.display = "none";
            tagsMenu.classList.remove("is-active");
        }

        document.dispatchEvent(new CustomEvent("showAllNotes"));
    });

    // Cancel button handler
    const cancelButton = mobileActionsRow.querySelector('[data-action="cancel"]');
cancelButton.addEventListener("click", () => {
  // Preserve tags menu when clearing
  const tagsMenu = container.querySelector("#tags-menu-sm");
        
  const children = Array.from(container.children);
  children.forEach(child => {
    if (child.id !== "tags-menu-sm") {
      child.remove();
    }
  });
        
  if (tagsMenu) {
    tagsMenu.style.display = "none";
    tagsMenu.classList.remove("is-active");
  }

  // Make sure layout is reset (optional but safe)
    const appMainContainer = document.querySelector('.app-main-container');
    if (appMainContainer) {
        appMainContainer.classList.remove('has-note-selected');
    }
    const actionsColumn = document.querySelector('.app-main-container-actions');
    if (actionsColumn) {
        actionsColumn.remove();
    }

    // Re-render notes list (same idea as desktop cancel/back)
    document.dispatchEvent(new CustomEvent("showAllNotes"));
    });

    // Create Note button handler
    const createButton = mobileActionsRow.querySelector('[data-action="create"]');
    createButton.addEventListener("click", (e) => {
        e.preventDefault();
        handleCreateNote();
    });

    headerSection.appendChild(mobileActionsRow);
    formWrapper.appendChild(headerSection);

    // Create form content section
    const formContentSection = document.createElement("div");
    formContentSection.classList.add("note-details-content");

       // create form html
    formContentSection.innerHTML = `
       <form id="create-note-form">
         <input 
           type="text" 
           id="note-title" 
           name="note-title" 
           class="note-details-title editable" 
           placeholder="Enter a title..." 
           required
         />
         <div class="note-details-meta">
           <div class="note-details-tags">
             <span>
               <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path fill-rule="evenodd" clip-rule="evenodd" d="M2.01055 3.9783C2.01249 3.03712 2.72405 2.19324 3.64772 2.03432C3.83712 2.00124 6.05872 2.00578 6.97787 2.00643C7.88727 2.00708 8.6624 2.33399 9.30454 2.97485C10.668 4.3357 12.0301 5.69785 13.3903 7.06132C14.1953 7.86759 14.2063 9.10519 13.4046 9.91405C12.2481 11.0816 11.0857 12.2433 9.9188 13.3999C9.1106 14.2009 7.873 14.1905 7.06607 13.3856C5.69029 12.0137 4.31452 10.6418 2.94459 9.26405C2.41465 8.73092 2.10201 8.08679 2.0326 7.33372C1.97681 6.73179 2.00925 4.49397 2.01055 3.9783Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                 <path fill-rule="evenodd" clip-rule="evenodd" d="M6.60475 5.54289C6.60215 6.12277 6.11761 6.59953 5.53189 6.59823C4.95006 6.59693 4.46552 6.11175 4.46877 5.53381C4.47266 4.93057 4.95006 4.46031 5.55719 4.4629C6.13318 4.46485 6.60734 4.95327 6.60475 5.54289Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
               Tags 
             </span>
             <input 
               type="text" 
               id="note-tags" 
               name="note-tags" 
               class="note-details-tags-input editable" 
               placeholder="Add tags separated by commas(e.g. Work, Planning)"
             />
           </div>
           <div class="note-details-date">
             <span class="note-details-date-label">
               <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path fill-rule="evenodd" clip-rule="evenodd" d="M8.16699 2.5C5.12919 2.5 2.66699 4.96219 2.66699 8C2.66699 11.0372 5.12923 13.5 8.16699 13.5C11.2048 13.5 13.667 11.0372 13.667 8C13.667 4.96219 11.2048 2.5 8.16699 2.5ZM1.66699 8C1.66699 4.40991 4.57691 1.5 8.16699 1.5C11.7571 1.5 14.667 4.40991 14.667 8C14.667 11.5894 11.7571 14.5 8.16699 14.5C4.57687 14.5 1.66699 11.5894 1.66699 8Z" fill="currentColor"/>
                 <path fill-rule="evenodd" clip-rule="evenodd" d="M7.94824 5.21777C8.22438 5.21777 8.44824 5.44163 8.44824 5.71777V8.16619L10.3212 9.28553C10.5583 9.42719 10.6356 9.73419 10.494 9.97126C10.3523 10.2083 10.0453 10.2856 9.80824 10.1439L7.69171 8.87906C7.54071 8.78879 7.44824 8.62586 7.44824 8.44986V5.71777C7.44824 5.44163 7.67211 5.21777 7.94824 5.21777Z" fill="currentColor"/>
               </svg>
               Last Edited
             </span>
             <span class="note-details-date-value" id="note-last-edited">
                <!-- ${formatDate(new Date())} -->
                Not yet saved
             </span>
           </div>
           <div class="form-group" id="location-group">
             <button type="button" class="location-button" id="location-button">Add Location</button>
           </div>
         </div>
         <div id="note-content-wrapper" 
         ></div>
       </form>
     `;

    const contentWrapper = formContentSection.querySelector('#note-content-wrapper');
    createRte = initRichTextEditor(contentWrapper, { placeholder: 'Start typing your note here...' });

    formWrapper.appendChild(formContentSection);

    // footer section (desktop only)
    const footerSection = document.createElement("div");
    footerSection.classList.add("note-details-footer", "desktop-only");

    footerSection.innerHTML = `
        <button class="save-button desktop-only">Save Note</button>
        <button class="cancel-button desktop-only">Cancel</button>
    `;

    const saveDesktopButton = footerSection.querySelector(".save-button");
    const cancelDesktopButton = footerSection.querySelector(".cancel-button");

    saveDesktopButton.addEventListener("click", (e) => {
        e.preventDefault();
        handleCreateNote();
    });

    cancelDesktopButton.addEventListener("click", (e) => {
        e.preventDefault();
        // Preserve tags menu when clearing
        const tagsMenu = container.querySelector("#tags-menu-sm");
        
        const children = Array.from(container.children);
        children.forEach(child => {
            if(child.id !== "tags-menu-sm") {
                child.remove();
            }
        });
        
        if(tagsMenu) {
            tagsMenu.style.display = "none";
            tagsMenu.classList.remove("is-active");
        }

        // remove has-note-selected class if it exists
        const appMainContainer = document.querySelector('.app-main-container');
        if(appMainContainer){
            appMainContainer.classList.remove('has-note-selected');
        }

        // clear the actions column
        const actionsColumn = document.querySelector('.app-main-container-actions');
        if(actionsColumn){
            actionsColumn.remove();
        }
        document.dispatchEvent(new CustomEvent("showAllNotes"));
    });

    formWrapper.appendChild(footerSection);
    container.appendChild(formWrapper);

    // add location permission request button to form
    const locationButton = document.getElementById("location-button");
    if(locationButton) {
      locationButton.addEventListener('click', async () =>{
        try{
            const location = await geolocation.requestLocationPermission();

            locationButton.setAttribute('data-location', JSON.stringify(location));
            locationButton.textContent = 'Location Added';
        }catch(error){
            console.error("Error requesting location:", error);

            ui.showToast('error',error.message, {duration: 4000});

            locationButton.textContent = 'Location Failed';

            setTimeout(() => {
                locationButton.textContent = 'Add Location';
            }, 3000);

            // show error message to user through ui
            ui.showValidationError('location', error.message);
        }
    });
    }

    // add event listener to create note button (desktop)
    const createNoteBtn = document.getElementById("create-note-btn");
    if(createNoteBtn) {
        createNoteBtn.addEventListener("click", (e) => {
            e.preventDefault();
           handleCreateNote();
        });
    }
    
    // add event listener to cancel button (desktop)
    const cancelBtn = document.getElementById("create-cancel-btn");
    if(cancelBtn) {
        cancelBtn.addEventListener("click", (e) => {
            e.preventDefault();
            // Preserve tags menu when clearing
            const tagsMenu = container.querySelector("#tags-menu-sm");
            
            const children = Array.from(container.children);
            children.forEach(child => {
                if(child.id !== "tags-menu-sm") {
                    child.remove();
                }
            });
            
            if(tagsMenu) {
                tagsMenu.style.display = "none";
                tagsMenu.classList.remove("is-active");
            }
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
        if(tagsInput) {
            if(Array.isArray(savedDraft.tags)) {
                tagsInput.value = savedDraft.tags.join(", ") || "";
            } else {
                tagsInput.value = savedDraft.tags || "";
            }
        };
        console.log("Draft restored:", savedDraft);
    }

    setupFormValidation();
}

// setup form validation listeners
function setupFormValidation(){
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    const tagsInput = document.getElementById('note-tags');

    if(!titleInput || !contentInput) return;

    // validate blur
    titleInput.addEventListener('blur', () => {
        const validation = validateField('title', titleInput.value);
        if(!validation.isValid){
            ui.showValidationError('#note-title', validation.message);
        } else {
            ui.clearValidationError('#note-title');
        }
        updateSubmitButtonState();
    });

    contentInput.addEventListener('blur', () => {
        const validation = validateField('content', contentInput.value);
        if(!validation.isValid){
            ui.showValidationError('#note-content', validation.message);
        } else {
            ui.clearValidationError('#note-content');
        }
        updateSubmitButtonState();
    });

    // clear errors on input (real-time feedback)
    titleInput.addEventListener('input', () => {
        ui.clearValidationError('#note-title');
        updateSubmitButtonState();
    });
    contentInput.addEventListener('input', () => {
        ui.clearValidationError('#note-content');
        updateSubmitButtonState();
    });
    tagsInput.addEventListener('input', () => {
        ui.clearValidationError('#note-tags');
        updateSubmitButtonState();
    });

    // initial state check
    updateSubmitButtonState();
}

// handle create note submission
function handleCreateNote() {
    const titleInputEl = document.getElementById("note-title");
    const contentHtml = createRte?.getHTML() || '';
    const tagsInputEl = document.getElementById("note-tags");
    const locationButton = document.querySelector(".location-button");

    let location = null;
    if(locationButton && locationButton.hasAttribute('data-location')) {
        location = JSON.parse(locationButton.getAttribute('data-location'));
    }

    const title = titleInputEl.value.trim();
    const content = contentHtml.trim();

    // validate inputs with dynamic DOM errors
    const titleValidation = validateField('title', title);
    const contentValidation = validateField('content', content);

    let hasErrors = false;

    if(!titleValidation.isValid){
        ui.showValidationError('#note-title', titleValidation.message);
        hasErrors = true;
    }
    if(!contentValidation.isValid){
        ui.showValidationError('#note-content', contentValidation.message);
        hasErrors = true;
    }

    if (hasErrors) {
        if (!titleValidation.isValid) {
          titleInputEl.focus();
        } else if (!contentValidation.isValid) {
          createRte?.editor?.focus();
        }
        return;
      }
    // parse tags into array
    const tags = tagsInputEl.trim().split(",").map(tag => tag.trim());

    // validate inputs
    if(!title || !content) {
        alert("Please enter a title and content");
        return;
    }

    try{
        // create note object
    const plain = createRte?.getPlainText() || '';
    if(plain.length < 10){
        ui.showValidationError('#note-content', 'Content must be at least 10 characters long');
        return;
    } else {
        ui.clearValidationError('#note-content');
    }

    const newNote = noteManager.createNote(title, contentHtml, tags);
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

    // show toast notification with link to view note
    ui.showToastCreated(newNote.id);

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
    if(document.querySelector('.settings-section')){
        return;
    }

    if(!checkAuth){
        return;
    }

    const sharedNote = getSharedNoteFromUrl();
    if(sharedNote){
        // skip normal list view and show read-only view of shared note
        ui.renderSharedNoteReadOnly(sharedNote);
        return;
    }
    initializeApp()
});
