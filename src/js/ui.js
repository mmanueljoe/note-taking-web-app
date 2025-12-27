import { formatDate, escapeHtml } from "./utils.js";

export const renderNote = (note) => {
  const noteElement = document.createElement("div");
  noteElement.classList.add("note-card");

  noteElement.innerHTML = `
    <h3 class="note-title">${escapeHtml(note.title)}</h3>
    <div class="note-tags">
      ${note.tags
        .map((tag) => `<span class="note-tag">${escapeHtml(tag)}</span>`)
        .join("")}
    </div>
    <span class="note-date">${formatDate(note.lastEdited)}</span>
  `;

  noteElement.addEventListener("click", () => {
    renderNoteDetails(note);
  });

  // Make it look clickable
  noteElement.style.cursor = "pointer";

  return noteElement;
};

export const renderAllNotes = (notes) => {
  // select container
  const navContainer = document.querySelector(".app-main-container-nav");
  const contentContainer = navContainer.querySelector(".content");

  // clear existing content
  contentContainer.innerHTML = "";

  // if no notes, show a placeholder message
  if (!notes || notes.length === 0) {
    renderEmptyState();
    return;
  }

  // create container for notes cards
  const noteList = document.createElement("div");
  noteList.classList.add("notes-list");

  // loop through notes and render each note card
  notes.forEach(note => {
    const noteCard = renderNote(note);
    noteList.appendChild(noteCard);
  });

  // append note list to content container
  contentContainer.appendChild(noteList);
};

// Show validation error for form fields
export const showValidationError = (field, message) => {
  // Find the field element (could be input, textarea, etc.)
  const fieldElement = typeof field === "string" 
    ? document.querySelector(field) 
    : field;
  
  if (!fieldElement) return;

  // Remove existing error message
  const existingError = fieldElement.parentElement.querySelector(".validation-error");
  if (existingError) {
    existingError.remove();
  }

  // Add error class to field
  fieldElement.classList.add("error");

  // Create error message element
  const errorElement = document.createElement("p");
  errorElement.classList.add("validation-error");
  errorElement.textContent = message;
  errorElement.setAttribute("role", "alert");

  // Insert error message after the field
  fieldElement.parentElement.appendChild(errorElement);
};

// Clear validation error
export const clearValidationError = (field) => {
  const fieldElement = typeof field === "string" 
    ? document.querySelector(field) 
    : field;
  
  if (!fieldElement) return;

  fieldElement.classList.remove("error");
  const existingError = fieldElement.parentElement.querySelector(".validation-error");
  if (existingError) {
    existingError.remove();
  }
};

// Update tag list display (for tag management UI)
export const updateTagList = (tags) => {
  // This function would update a tag list UI element
  // For example, a sidebar showing all available tags
  const tagListContainer = document.querySelector(".tags-list");
  
  if (!tagListContainer) return;

  // Clear existing tags
  tagListContainer.innerHTML = "";

  if (!tags || tags.length === 0) {
    tagListContainer.innerHTML = "<p>No tags yet</p>";
    return;
  }

  // Create tag items
  tags.forEach(tag => {
    const tagItem = document.createElement("div");
    tagItem.classList.add("tag-item");
    tagItem.textContent = tag;
    tagListContainer.appendChild(tagItem);
  });
};


// Toggle between all notes and archived notes view
export const toggleArchiveView = (showArchived = false) => {
  // Update the header title
  const headerTitle = document.querySelector(".app-main-container-header h2");
  if (headerTitle) {
    headerTitle.textContent = showArchived ? "Archived Notes" : "All Notes";
  }

  // Update active state of navigation links
  const allNotesLink = document.querySelector(".add-notes-link");
  const archivedNotesLink = document.querySelector('a[href*="archived"]');
  
  if (allNotesLink && archivedNotesLink) {
    if (showArchived) {
      allNotesLink.classList.remove("is-active");
      archivedNotesLink.classList.add("is-active");
    } else {
      allNotesLink.classList.add("is-active");
      archivedNotesLink.classList.remove("is-active");
    }
  }

  // Return the state for use in other functions
  return showArchived;
};




// Clear note form (for creating/editing notes)
export const clearNoteForm = () => {
  // Find form inputs (title, content, tags)
  const titleInput = document.querySelector('input[name="note-title"], #note-title');
  const contentInput = document.querySelector('textarea[name="note-content"], #note-content');
  const tagInputs = document.querySelectorAll('input[type="checkbox"][name^="tag"]');
  
  if (titleInput) titleInput.value = "";
  if (contentInput) contentInput.value = "";
  
  // Uncheck all tag checkboxes
  tagInputs.forEach(input => {
    input.checked = false;
  });
  
  // Clear any validation errors
  const errorElements = document.querySelectorAll(".validation-error");
  errorElements.forEach(error => error.remove());
  
  const errorFields = document.querySelectorAll(".error");
  errorFields.forEach(field => field.classList.remove("error"));
};

// === helper functions ===
// render empty state
export const renderEmptyState = () => {
  const contentContainer = document.querySelector(".app-main-container-nav").querySelector(".content");
  contentContainer.innerHTML = `
   <p>
      You don't have any notes yet. Start a new note to capture your
      thoughts and ideas.
    </p>
  `;
};

// render note details
export const renderNoteDetails = (note) => {
  const container = document.querySelector(".app-main-container-content");

  // clear existing content
  container.innerHTML = "";

  // create main wrapper
  const detailWrapper = document.createElement("div");
  detailWrapper.classList.add("note-details-wrapper");
  container.appendChild(detailWrapper);

  // create header section
  const headerSection = document.createElement("div");
  headerSection.classList.add("note-details-header");
  detailWrapper.appendChild(headerSection);

  //  back button (mobile, tablet)
  const backButton = document.createElement("button");
  backButton.classList.add("back-button mobile-tablet-only");
  backButton.innerHTML = `
    <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M6.31047 12.621L0 6.3105L6.31047 0L7.37097 1.0605L2.12097 6.3105L7.37097 11.5605L6.31047 12.621Z" fill="currentColor"/>
    </svg>
    <span class="back-button-label">Back</span>
  `;
  backButton.addEventListener("click", () => {
    // Clear detail view and show list again
    container.innerHTML = "";
    // Dispatch event to reload notes list
    document.dispatchEvent(new CustomEvent("showNotesList"));
  });

  // actions buttons container (desktop, top right corner)
  const actionButtons = document.createElement("div");
  actionButtons.classList.add("note-actions desktop-only");

  // Archive/Restore button (toggles based on note status)
  const archiveButton = document.createElement("button");
  archiveButton.classList.add("archive-button");
  const isArchived = note.isArchived || false;
  
  archiveButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M3.09026 6.16962C3.4082 6.03519 3.7749 6.18396 3.90932 6.50189L5.00629 9.09638L7.58326 8.0068C7.9012 7.87239 8.2679 8.02114 8.40233 8.33904C8.53675 8.65704 8.388 9.02371 8.07005 9.15813L4.91741 10.491C4.59948 10.6255 4.23278 10.4767 4.09836 10.1588L2.758 6.98867C2.62357 6.67074 2.77234 6.30404 3.09026 6.16962Z" fill="currentColor"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M10.7624 4.71991C7.89009 4.71991 5.55539 7.008 5.4832 9.85328C5.47445 10.1983 5.18762 10.4709 4.84255 10.4622C4.49749 10.4534 4.22485 10.1666 4.2336 9.82153C4.32299 6.29821 7.21239 3.46991 10.7624 3.46991C14.366 3.46991 17.2915 6.39544 17.2915 9.99894C17.2915 13.6097 14.3655 16.528 10.7624 16.528C8.52867 16.528 6.56351 15.41 5.38176 13.708C5.18489 13.4244 5.25516 13.035 5.53869 12.8382C5.82223 12.6413 6.21167 12.7115 6.40854 12.9951C7.36759 14.3764 8.957 15.278 10.7624 15.278C13.6761 15.278 16.0415 12.9184 16.0415 9.99894C16.0415 7.0858 13.6756 4.71991 10.7624 4.71991Z" fill="currentColor"/>
    </svg>
    <span class="archive-button-label">${isArchived ? "Restore Note" : "Archive Note"}</span>
  `;
  archiveButton.addEventListener("click", () => {
    // Toggle archive status - will be handled in main.js
    // This will dispatch a custom event or call a callback
    const event = new CustomEvent("archiveNote", {
      detail: { noteId: note.id, isArchived: !isArchived }
    });
    document.dispatchEvent(event);
  });

  //  delete button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.3769 3.10322L13.0587 4.53105H15.2582C15.9345 4.53105 16.4827 5.05735 16.4827 5.70658V6.57714C16.4827 7.02103 16.1079 7.38087 15.6455 7.38087H4.17071C3.70833 7.38087 3.3335 7.02103 3.3335 6.57714V5.70658C3.3335 5.05735 3.88173 4.53105 4.55802 4.53105H6.75754L7.43937 3.10322C7.64395 2.67474 8.08995 2.40002 8.58095 2.40002H11.2353C11.7263 2.40002 12.1722 2.67474 12.3769 3.10322Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.2 7.44061V14.3892C15.2 15.7209 14.0895 16.8004 12.7195 16.8004H7.09717C5.72725 16.8004 4.6167 15.7209 4.6167 14.3892V7.44061" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8.49951 10.2531V13.8598M11.3165 10.2531V13.8598" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <span class="delete-button-label">Delete Note</span>
  `;
  deleteButton.addEventListener("click", () => {
    // Confirm deletion
    if (confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      // Dispatch event to delete note
      const event = new CustomEvent("deleteNote", {
        detail: { noteId: note.id }
      });
      document.dispatchEvent(event);
    }
  });

  actionButtons.appendChild(archiveButton);
  actionButtons.appendChild(deleteButton);

  headerSection.appendChild(backButton);
  headerSection.appendChild(actionButtons);

  // create content section
  const contentSection = document.createElement("div");
  contentSection.classList.add("note-details-content");

  // create title element
  const title = document.createElement("h1");
  title.classList.add("note-details-title");
  title.textContent = note.title;

  // create tags element
  const metaRow = document.createElement("div");
  metaRow.classList.add("note-details-meta");

  const tagsDisplay = document.createElement("div");
  tagsDisplay.classList.add("note-details-tags");
  tagsDisplay.innerHTML = `
    <span>
     <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.01055 3.9783C2.01249 3.03712 2.72405 2.19324 3.64772 2.03432C3.83712 2.00124 6.05872 2.00578 6.97787 2.00643C7.88727 2.00708 8.6624 2.33399 9.30454 2.97485C10.668 4.3357 12.0301 5.69785 13.3903 7.06132C14.1953 7.86759 14.2063 9.10519 13.4046 9.91405C12.2481 11.0816 11.0857 12.2433 9.9188 13.3999C9.1106 14.2009 7.873 14.1905 7.06607 13.3856C5.69029 12.0137 4.31452 10.6418 2.94459 9.26405C2.41465 8.73092 2.10201 8.08679 2.0326 7.33372C1.97681 6.73179 2.00925 4.49397 2.01055 3.9783Z" stroke="#2B303B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.60475 5.54289C6.60215 6.12277 6.11761 6.59953 5.53189 6.59823C4.95006 6.59693 4.46552 6.11175 4.46877 5.53381C4.47266 4.93057 4.95006 4.46031 5.55719 4.4629C6.13318 4.46485 6.60734 4.95327 6.60475 5.54289Z" stroke="#2B303B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    Tags
    </span>
    <span class="note-details-tags-value">${note.tags.join(", ")}</span>  
  `;

  const statusDisplay = document.createElement("div");
  statusDisplay.classList.add("note-details-status");
  statusDisplay.innerHTML = `
  <span class="note-details-status-label">
   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
   <path fill-rule="evenodd" clip-rule="evenodd" d="M3.772 4.23187C3.95224 4.05162 4.24447 4.05162 4.42471 4.23186L5.00871 4.81583C5.18895 4.99607 5.18895 5.2883 5.00871 5.46855C4.82847 5.64879 4.53624 5.64879 4.356 5.46855L3.77201 4.88458C3.59176 4.70434 3.59176 4.41211 3.772 4.23187ZM5.00861 10.5293C5.18891 10.7095 5.18899 11.0018 5.0088 11.1821L3.94961 12.2418C3.76942 12.4221 3.47719 12.4222 3.2969 12.242C3.1166 12.0618 3.11652 11.7696 3.29671 11.5893L4.3559 10.5295C4.53609 10.3492 4.82832 10.3491 5.00861 10.5293ZM10.0703 10.5293C10.2505 10.3491 10.5428 10.3492 10.723 10.5295L11.7822 11.5893C11.9623 11.7696 11.9623 12.0618 11.782 12.242C11.6017 12.4222 11.3095 12.4221 11.1293 12.2418L10.0701 11.1821C9.88992 11.0018 9.88998 10.7095 10.0703 10.5293Z" fill="currentColor"/>
   <path fill-rule="evenodd" clip-rule="evenodd" d="M7.53852 3.05566C7.79341 3.05566 8.00005 3.2623 8.00005 3.5172V3.95892C8.00005 4.21382 7.79341 4.42046 7.53852 4.42046C7.28362 4.42046 7.07698 4.21382 7.07698 3.95892V3.5172C7.07698 3.2623 7.28362 3.05566 7.53852 3.05566ZM1.88232 7.99927C1.88232 7.74438 2.08896 7.53773 2.34386 7.53773H3.49815C3.75304 7.53773 3.95968 7.74438 3.95968 7.99927C3.95968 8.25416 3.75304 8.46081 3.49815 8.46081H2.34386C2.08896 8.46081 1.88232 8.25416 1.88232 7.99927ZM11.1174 7.99927C11.1174 7.74438 11.324 7.53773 11.5789 7.53773H13.077C13.3319 7.53773 13.5385 7.74438 13.5385 7.99927C13.5385 8.25416 13.3319 8.46081 13.077 8.46081H11.5789C11.324 8.46081 11.1174 8.25416 11.1174 7.99927ZM7.53852 11.5782C7.79341 11.5782 8.00005 11.7848 8.00005 12.0397V13.5378C8.00005 13.7927 7.79341 13.9993 7.53852 13.9993C7.28362 13.9993 7.07698 13.7927 7.07698 13.5378V12.0397C7.07698 11.7848 7.28362 11.5782 7.53852 11.5782Z" fill="currentColor"/>
  </svg>
    Status
  </span>
   <span class="note-details-status-value">${
     note.isArchived ? "Archived" : "Active"
   }</span>  
  `;

  const dateDisplay = document.createElement("div");
  dateDisplay.classList.add("note-details-date");
  dateDisplay.innerHTML = `
  <span class="note-details-date-label">
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.16699 2.5C5.12919 2.5 2.66699 4.96219 2.66699 8C2.66699 11.0372 5.12923 13.5 8.16699 13.5C11.2048 13.5 13.667 11.0372 13.667 8C13.667 4.96219 11.2048 2.5 8.16699 2.5ZM1.66699 8C1.66699 4.40991 4.57691 1.5 8.16699 1.5C11.7571 1.5 14.667 4.40991 14.667 8C14.667 11.5894 11.7571 14.5 8.16699 14.5C4.57687 14.5 1.66699 11.5894 1.66699 8Z" fill="currentColor"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.94824 5.21777C8.22438 5.21777 8.44824 5.44163 8.44824 5.71777V8.16619L10.3212 9.28553C10.5583 9.42719 10.6356 9.73419 10.494 9.97126C10.3523 10.2083 10.0453 10.2856 9.80824 10.1439L7.69171 8.87906C7.54071 8.78879 7.44824 8.62586 7.44824 8.44986V5.71777C7.44824 5.44163 7.67211 5.21777 7.94824 5.21777Z" fill="currentColor"/>
 </svg>
 Last Edited
</span>
  <span class="note-details-date-value">${formatDate(note.lastEdited)}</span>
  `;

  metaRow.appendChild(tagsDisplay);
  metaRow.appendChild(statusDisplay);
  metaRow.appendChild(dateDisplay);


  // content display
  const contentDisplay = document.createElement("div");
  contentDisplay.classList.add("note-details-body");
  // Preserve line breaks in content
  const contentText = escapeHtml(note.content || "");
  contentDisplay.innerHTML = contentText.replace(/\n/g, "<br>");

  contentSection.appendChild(title);
  contentSection.appendChild(metaRow);
  contentSection.appendChild(contentDisplay);

  // footer section
  const footerSection = document.createElement("div");
  footerSection.classList.add("note-details-footer");

  const saveButton = document.createElement("button");
  saveButton.classList.add("save-button");
  saveButton.textContent = "Save Note";
  saveButton.addEventListener("click", () => {
    // Get updated values from the detail view
    const updatedTitle = title.textContent;
    const updatedContent = contentDisplay.textContent;
    
    // Dispatch event to save note
    const event = new CustomEvent("saveNote", {
      detail: { 
        noteId: note.id,
        title: updatedTitle,
        content: updatedContent
      }
    });
    document.dispatchEvent(event);
  });

  const cancelButton = document.createElement("button");
  cancelButton.classList.add("cancel-button");
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", () => {
    // Clear detail view
    container.innerHTML = "";
    // Dispatch event to reload notes list
    document.dispatchEvent(new CustomEvent("showNotesList"));
  });

  footerSection.appendChild(saveButton);
  footerSection.appendChild(cancelButton);


  detailWrapper.appendChild(headerSection);
  detailWrapper.appendChild(contentSection);
  detailWrapper.appendChild(footerSection);

  container.appendChild(detailWrapper);
};
