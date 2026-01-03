import { formatDate, escapeHtml } from "./utils.js";
import { getAllNotes, getArchivedNotes,filterByTag } from "./noteManager.js";

export const renderNote = (note) => {
  const noteElement = document.createElement("div");
  noteElement.classList.add("note-card");
  noteElement.setAttribute("data-note-id", note.id);
  noteElement.setAttribute("tabindex", "0");
  noteElement.setAttribute("role", "button");

  noteElement.innerHTML = `
    <h3 class="note-title">${escapeHtml(note.title)}</h3>
      <div class="note-tags">
      ${note.tags
        .map((tag) => `<span class="note-tag">${escapeHtml(tag)}</span>`)
        .join("")}
    </div>
    <span class="note-date">${formatDate(note.lastEdited)}</span>
  `;

  // Make it look clickable
  noteElement.style.cursor = "pointer";

  return noteElement;
};

export const renderAllNotes = (notes, filterTag = null, viewType = "all") => {
  // select container
  const isDesktop = window.innerWidth >= 1024;

  let targetContainer;
  if (isDesktop) {
    const navContainer = document.querySelector(".app-main-container-nav");
    if (!navContainer) return;
    targetContainer = navContainer.querySelector(".content");
    if (!targetContainer) return;
    targetContainer.innerHTML = "";
  } else {
    targetContainer = document.querySelector(".app-main-container-content");
    if (!targetContainer) return;

    const tagsMenu = targetContainer.querySelector("#tags-menu-sm");

    const children = Array.from(targetContainer.children);
    children.forEach((child) => {
      if (child.id !== "tags-menu-sm") {
        child.remove();
      }
    });

    if (tagsMenu) {
      tagsMenu.style.display = "none";
      tagsMenu.classList.remove("is-active");
    }
  }

  if (!targetContainer) return;

  // if no notes, show a placeholder message
  if (!notes || notes.length === 0) {
    renderEmptyState(viewType);
    updateHeader(filterTag, viewType);
    return;
  }

  // update header title
  updateHeader(filterTag, viewType);

  // If filtered by tag, add back button (mobile/tablet only) and update header
  if (filterTag && !isDesktop) {
    // Update header to show tag name
    const headerTitle = document.querySelector(".app-main-container-header h2");
    if (headerTitle) {
      headerTitle.textContent = `Tag: ${filterTag}`;
    }

    // Add back button in notes list area (mobile/tablet only)
    const backButton = document.createElement("button");
    backButton.classList.add(
      "back-button",
      "filter-back-button",
      "mobile-tablet-only"
    );

    backButton.innerHTML = `
      <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.31047 12.621L0 6.3105L6.31047 0L7.37097 1.0605L2.12097 6.3105L7.37097 11.5605L6.31047 12.621Z" fill="currentColor"/>
      </svg>
      <span class="back-button-label">Back to All Notes</span>
    `;
    backButton.addEventListener("click", () => {
      // Update header back to "All Notes"
      const headerTitle = document.querySelector(
        ".app-main-container-header h2"
      );
      if (headerTitle) {
        headerTitle.textContent = "All Notes";
      }
      // Dispatch event to show all notes
      document.dispatchEvent(new CustomEvent("showAllNotes"));
    });
    targetContainer.appendChild(backButton);
  } else {
    // If not filtered, ensure header shows "All Notes"
    const headerTitle = document.querySelector(".app-main-container-header h2");
    if (headerTitle && !headerTitle.textContent.includes("Archived")) {
      headerTitle.textContent = "All Notes";
    }
  }

  //  data attribute for event delegation
  targetContainer.setAttribute("data-notes-container", "true");

  //  note list container
  const noteList = document.createElement("div");
  noteList.classList.add("notes-list");

  // add attribute to note list
  noteList.setAttribute("data-notes-list", "true");

  //  render note cards
  notes.forEach((note) => {
    const noteCard = renderNote(note);

    // add data attribute with node id for identification
    noteCard.setAttribute("data-note-id", note.id);
    noteList.appendChild(noteCard);

    // auto-select first note card in desktop mode
    const isDesktop = window.innerWidth >= 1024;
    if(isDesktop && notes.length > 0){
      // select the first note card
      noteCard.classList.add('is-selected');

      // show note details
      renderNoteDetails(note);
    }
  });

  // append note list to content container
  targetContainer.appendChild(noteList);
};

// Show validation error for form fields
export const showValidationError = (field, message) => {
  // Find the field element (could be input, textarea, etc.)
  const fieldElement =
    typeof field === "string" ? document.querySelector(field) : field;

  if (!fieldElement) return;

  // Remove existing error message
  const existingError =
    fieldElement.parentElement.querySelector(".validation-error");
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
  const fieldElement =
    typeof field === "string" ? document.querySelector(field) : field;

  if (!fieldElement) return;

  fieldElement.classList.remove("error");
  const existingError =
    fieldElement.parentElement.querySelector(".validation-error");
  if (existingError) {
    existingError.remove();
  }
};

// Toast notification system with icons and links
export const showToast = (type, message, options = {}) => {
  const { duration = 4000, linkText, linkAction, noteId } = options;

  // Remove existing toasts
  const existingToasts = document.querySelectorAll(".toast-notification");
  existingToasts.forEach((toast) => {
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 300);
  });

  // Create toast container
  const toast = document.createElement("div");
  toast.classList.add("toast-notification", `toast-${type}`);
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "polite");

  // Icons for different toast types
  const icons = {
    created: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M10.6618 6.81467L7.58317 9.89334C7.48517 9.99134 7.35784 10.04 7.22984 10.04C7.10117 10.04 6.97384 9.99134 6.87584 9.89334L5.3365 8.35401C5.14117 8.15867 5.14117 7.84201 5.3365 7.64667C5.53184 7.45134 5.84784 7.45134 6.04317 7.64667L7.22984 8.83267L9.9545 6.10734C10.1498 5.91201 10.4665 5.91201 10.6618 6.10734C10.8572 6.30267 10.8572 6.61934 10.6618 6.81467ZM7.99984 1.66667C4.50784 1.66667 1.6665 4.50801 1.6665 8.00001C1.6665 11.4927 4.50784 14.3333 7.99984 14.3333C11.4918 14.3333 14.3332 11.4927 14.3332 8.00001C14.3332 4.50801 11.4918 1.66667 7.99984 1.66667Z" fill="currentColor"/>
</svg>
`,
    archived: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.6618 6.81467L7.58317 9.89334C7.48517 9.99134 7.35784 10.04 7.22984 10.04C7.10117 10.04 6.97384 9.99134 6.87584 9.89334L5.3365 8.35401C5.14117 8.15867 5.14117 7.84201 5.3365 7.64667C5.53184 7.45134 5.84784 7.45134 6.04317 7.64667L7.22984 8.83267L9.9545 6.10734C10.1498 5.91201 10.4665 5.91201 10.6618 6.10734C10.8572 6.30267 10.8572 6.61934 10.6618 6.81467ZM7.99984 1.66667C4.50784 1.66667 1.6665 4.50801 1.6665 8.00001C1.6665 11.4927 4.50784 14.3333 7.99984 14.3333C11.4918 14.3333 14.3332 11.4927 14.3332 8.00001C14.3332 4.50801 11.4918 1.66667 7.99984 1.66667Z" fill="currentColor"/>
</svg>
`,
    deleted: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.6618 6.81467L7.58317 9.89334C7.48517 9.99134 7.35784 10.04 7.22984 10.04C7.10117 10.04 6.97384 9.99134 6.87584 9.89334L5.3365 8.35401C5.14117 8.15867 5.14117 7.84201 5.3365 7.64667C5.53184 7.45134 5.84784 7.45134 6.04317 7.64667L7.22984 8.83267L9.9545 6.10734C10.1498 5.91201 10.4665 5.91201 10.6618 6.10734C10.8572 6.30267 10.8572 6.61934 10.6618 6.81467ZM7.99984 1.66667C4.50784 1.66667 1.6665 4.50801 1.6665 8.00001C1.6665 11.4927 4.50784 14.3333 7.99984 14.3333C11.4918 14.3333 14.3332 11.4927 14.3332 8.00001C14.3332 4.50801 11.4918 1.66667 7.99984 1.66667Z" fill="currentColor"/>
</svg>
`,
    saved: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.6618 6.81467L7.58317 9.89334C7.48517 9.99134 7.35784 10.04 7.22984 10.04C7.10117 10.04 6.97384 9.99134 6.87584 9.89334L5.3365 8.35401C5.14117 8.15867 5.14117 7.84201 5.3365 7.64667C5.53184 7.45134 5.84784 7.45134 6.04317 7.64667L7.22984 8.83267L9.9545 6.10734C10.1498 5.91201 10.4665 5.91201 10.6618 6.10734C10.8572 6.30267 10.8572 6.61934 10.6618 6.81467ZM7.99984 1.66667C4.50784 1.66667 1.6665 4.50801 1.6665 8.00001C1.6665 11.4927 4.50784 14.3333 7.99984 14.3333C11.4918 14.3333 14.3332 11.4927 14.3332 8.00001C14.3332 4.50801 11.4918 1.66667 7.99984 1.66667Z" fill="#21C16B"/>
</svg>
`,
  };

  // Build toast content
  let toastContent = `
    <div class="toast-icon">
      ${icons[type] || icons.saved}
    </div>
    <div class="toast-content">
      <p class="toast-message">${escapeHtml(message)}</p>
      ${
        linkText && linkAction
          ? `
        <a href="#" class="toast-link" data-action="${linkAction}" ${
              noteId ? `data-note-id="${noteId}"` : ""
            }>
          ${escapeHtml(linkText)}
        </a>
      `
          : ""
      }
    </div>
    <button class="toast-close" aria-label="Close notification">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  `;

  toast.innerHTML = toastContent;
  document.body.appendChild(toast);

  // Trigger slide-in animation
  setTimeout(() => toast.classList.add("toast-enter"), 10);

  // Handle close button
  const closeBtn = toast.querySelector(".toast-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      toast.classList.add("toast-exit");
      setTimeout(() => toast.remove(), 300);
    });
  }

  // Handle link click
  const toastLink = toast.querySelector(".toast-link");
  if (toastLink) {
    toastLink.addEventListener("click", (e) => {
      e.preventDefault();
      const action = toastLink.getAttribute("data-action");
      const noteId = toastLink.getAttribute("data-note-id");

      if (action === "view-note" && noteId) {
        // Dispatch event to show note details
        document.dispatchEvent(
          new CustomEvent("showNoteDetails", {
            detail: { noteId },
          })
        );
      } else if (action === "view-archived") {
        // Dispatch event to show archived notes
        document.dispatchEvent(new CustomEvent("showArchivedNotes"));
      }

      // Close toast after link click
      toast.classList.add("toast-exit");
      setTimeout(() => toast.remove(), 300);
    });
  }

  // Auto-remove after duration
  setTimeout(() => {
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// Convenience functions for different toast types
export const showToastCreated = (noteId) => {
  showToast("created", "Note created successfully", {
    linkText: "View note",
    linkAction: "view-note",
    noteId: noteId,
  });
};

export const showToastArchived = (isArchived) => {
  showToast("archived", isArchived ? "Note archived" : "Note unarchived", {
    linkText: "View archived notes",
    linkAction: "view-archived",
  });
};

export const showToastDeleted = () => {
  showToast("deleted", "Note deleted successfully", {
    duration: 3000,
  });
};

export const showToastSaved = () => {
  showToast("saved", "Note saved successfully", {
    duration: 3000,
  });
};

// render tags menu for desktop
export const renderTagLinks = (tags) => {
  const menuList = document.querySelector(".menu-list");
  if (!menuList) return;

  const tagListContainer = document.createElement("li");
  tagListContainer.classList.add("menu-item", "tags-section", "desktop-only");

  const existingTagsSection = menuList.querySelector(".tags-section");
  if (existingTagsSection) {
    existingTagsSection.remove();
  }

  // if no tags, hide the tags section
  if (!tags || tags.length === 0) {
    tagListContainer.style.display = "none";
    return;
  }

  // find "archived notes" link
  const archivedNotesLink = Array.from(menuList.children).find((child) => {
    
    const isArchivedLink = child.querySelector(".archived-notes-link");
    return (
      (isArchivedLink &&
        isArchivedLink.textContent.includes("Archived Notes")) ||
      (isArchivedLink && isArchivedLink.textContent.includes("Archived"))
    );
  });

  tagListContainer.innerHTML = `
    <h2 class="tags-heading">Tags</h2>
    <ul class="tags-list">
      ${tags
        .map(
          (tag) => `<li class="tag-item">
        <a href="#" class="tag-link" data-tag="${escapeHtml(tag)}">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M2.51318 4.97208C2.51562 3.79561 3.40507 2.74076 4.55965 2.54211C4.7964 2.50076 7.5734 2.50643 8.72233 2.50724C9.85909 2.50806 10.828 2.9167 11.6307 3.71777C13.335 5.41883 15.0377 7.12152 16.7379 8.82585C17.7441 9.83369 17.7579 11.3807 16.7558 12.3918C15.3101 13.8512 13.8571 15.3034 12.3985 16.749C11.3883 17.7504 9.84125 17.7374 8.83259 16.7312C7.11287 15.0163 5.39315 13.3014 3.68074 11.5793C3.01831 10.9129 2.62751 10.1077 2.54075 9.16636C2.47102 8.41394 2.51156 5.61667 2.51318 4.97208Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M8.25593 6.9294C8.25268 7.65426 7.64702 8.2502 6.91487 8.24858C6.18757 8.24696 5.5819 7.64048 5.58596 6.91805C5.59082 6.164 6.18757 5.57618 6.94648 5.57942C7.66647 5.58185 8.25917 6.19239 8.25593 6.9294Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="tag-label">${escapeHtml(tag)}</span> 
        </a></li>`
        )
        .join("")}
    </ul>
  `;

  // click handler for tag links
  const tagLinks = tagListContainer.querySelectorAll(".tag-link");
  tagLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tag = link.getAttribute("data-tag");
      // console.log(tag);
      document.dispatchEvent(
        new CustomEvent("filterNotesByTag", {
          detail: { tag: tag },
        })
      );
    });
  });

  // insert tagListContainer after archivedNotesLink
  if (archivedNotesLink && archivedNotesLink.nextSibling) {
    archivedNotesLink.parentNode.insertBefore(
      tagListContainer,
      archivedNotesLink.nextSibling
    );
  } else {
    menuList.appendChild(tagListContainer);
  }
};

// initialize tags menu for mobile and tablet
export const initializeTagsMenu = () => {
  const tags = getAllUniqueTags();

  const tagsLinkItem = document.querySelector(".tags-link");
  if (!tagsLinkItem) return;

  const tagsLink = tagsLinkItem.querySelector("a");
  if (!tagsLink) return;

  // get content container
  const contentContainer = document.querySelector(
    ".app-main-container-content"
  );
  if (!contentContainer) return;

  // check if tags menu already exists
  let tagsMenu = contentContainer.querySelector("#tags-menu-sm");

  if (!tagsMenu) {
    //  create tags menu container directly
    tagsMenu = document.createElement("div");
    tagsMenu.id = "tags-menu-sm";
    tagsMenu.classList.add("tags-section-sm", "mobile-tablet-only");
    contentContainer.appendChild(tagsMenu);

    tagsMenu.innerHTML = `
     <div class="tags-section-content">
      <ul class="tags-list-sm">
        ${tags
          .map(
            (tag) => `<li class="tag-item-sm">
          <a href="#" class="tag-link" data-tag="${escapeHtml(tag)}">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.51318 4.97208C2.51562 3.79561 3.40507 2.74076 4.55965 2.54211C4.7964 2.50076 7.5734 2.50643 8.72233 2.50724C9.85909 2.50806 10.828 2.9167 11.6307 3.71777C13.335 5.41883 15.0377 7.12152 16.7379 8.82585C17.7441 9.83369 17.7579 11.3807 16.7558 12.3918C15.3101 13.8512 13.8571 15.3034 12.3985 16.749C11.3883 17.7504 9.84125 17.7374 8.83259 16.7312C7.11287 15.0163 5.39315 13.3014 3.68074 11.5793C3.01831 10.9129 2.62751 10.1077 2.54075 9.16636C2.47102 8.41394 2.51156 5.61667 2.51318 4.97208Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.25593 6.9294C8.25268 7.65426 7.64702 8.2502 6.91487 8.24858C6.18757 8.24696 5.5819 7.64048 5.58596 6.91805C5.59082 6.164 6.18757 5.57618 6.94648 5.57942C7.66647 5.58185 8.25917 6.19239 8.25593 6.9294Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="tag-label">${escapeHtml(tag)}</span> 
          </a></li>`
          )
          .join("")}
      </ul>
     </div>
    `;
    tagsMenu.style.display = "none";

    setupTagsMenuEventListeners(tagsMenu, tagsLink, contentContainer);
  } else {
    // If tags menu exists, just update the tags list without removing listeners
    const tagsList = tagsMenu.querySelector(".tags-list-sm");
    if (tagsList) {
      tagsList.innerHTML = tags
        .map(
          (tag) => `<li class="tag-item-sm">
        <a href="#" class="tag-link" data-tag="${escapeHtml(tag)}">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M2.51318 4.97208C2.51562 3.79561 3.40507 2.74076 4.55965 2.54211C4.7964 2.50076 7.5734 2.50643 8.72233 2.50724C9.85909 2.50806 10.828 2.9167 11.6307 3.71777C13.335 5.41883 15.0377 7.12152 16.7379 8.82585C17.7441 9.83369 17.7579 11.3807 16.7558 12.3918C15.3101 13.8512 13.8571 15.3034 12.3985 16.749C11.3883 17.7504 9.84125 17.7374 8.83259 16.7312C7.11287 15.0163 5.39315 13.3014 3.68074 11.5793C3.01831 10.9129 2.62751 10.1077 2.54075 9.16636C2.47102 8.41394 2.51156 5.61667 2.51318 4.97208Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M8.25593 6.9294C8.25268 7.65426 7.64702 8.2502 6.91487 8.24858C6.18757 8.24696 5.5819 7.64048 5.58596 6.91805C5.59082 6.164 6.18757 5.57618 6.94648 5.57942C7.66647 5.58185 8.25917 6.19239 8.25593 6.9294Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="tag-label">${escapeHtml(tag)}</span> 
        </a></li>`
        )
        .join("");

      // Re-attach listeners to new tag links
      const tagLinks = tagsList.querySelectorAll(".tag-link");
      tagLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const tag = link.getAttribute("data-tag");
          tagsMenu.style.display = "none";
          tagsMenu.classList.remove("is-active");
          contentContainer.classList.remove("tags-section-open");
          tagsLink.classList.remove("is-active");
          document.dispatchEvent(
            new CustomEvent("filterNotesByTag", {
              detail: { tag: tag },
            })
          );
        });
      });
    }
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
  tags.forEach((tag) => {
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
  

  // clear all active states first
  clearMenuActiveStates();

  // Update active state of navigation links
  const allNotesLink = document.querySelector(".all-notes-link");
  const archivedNotesLink = document.querySelector(".archived-notes-link");

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

// clear all links active states
export const clearMenuActiveStates = () => {
  const allLinks = document.querySelectorAll('.menu-item > a');
  allLinks.forEach((link) => link.classList.remove('is-active'));
};

// set active state for a specific link
export const setMenuLinkActive = (linkSelector) => {
  clearMenuActiveStates();

  const link = document.querySelector(linkSelector);
  if(link){
    link.classList.add('is-active');
  }
}

// render search view (mobile/tablet only)
export const renderSearchView = () => {
  const container = document.querySelector('.app-main-container-content');
  if(!container) return;

  // change header title to search
  const headerTitle = document.querySelector('.app-main-container-header h2');
  if(headerTitle){
    headerTitle.textContent = 'Search';
  }

  // preserve tags menu when clearing
  const tagsMenu = container.querySelector('#tags-menu-sm');

  // Clear container but preserve tags menu
  const children = Array.from(container.children);
  children.forEach((child) => {
    if (child.id !== "tags-menu-sm") {
      child.remove();
    }
  });

  if (tagsMenu) {
    tagsMenu.style.display = "none";
    tagsMenu.classList.remove("is-active");
  }

  // create search container
  const searchWrapper = document.createElement('div');
  searchWrapper.classList.add('search-view-wrapper', 'mobile-tablet-only');

  searchWrapper.innerHTML = `
   <div class="search-container mobile-tablet-only">
      <input 
        type="text" 
        class="search-input" 
        id="mobile-search-input"
        placeholder="Search by title, content or tags..." 
        aria-label="Search Input"
      />
    </div>

    <div class="search-message" style="display: none;"></div>
    
    <div class="search-results-container"></div>
  `;

  container.appendChild(searchWrapper);

  // add event listeners
  const searchInput = searchWrapper.querySelector('#mobile-search-input');
  if(searchInput){
    // debounce search
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);

      const query = e.target.value.trim();

      searchTimeout = setTimeout(() => {
        if(query.length === 0){
          const messageContainer = searchWrapper.querySelector('.search-message');
          const resultsContainer = searchWrapper.querySelector('.search-results-container');
          if(messageContainer) messageContainer.style.display = 'none';
          if(resultsContainer) resultsContainer.innerHTML = '';
          return;
        }


        // dispatch search event
        document.dispatchEvent(new CustomEvent('searchNotesMobile', {detail : {query}}))
      }, 500);
    });

    searchInput.focus();
  }
}

// render search results (mobile/tablet only)
export const renderSearchResults = (query, results) => {
  const container = document.querySelector(".app-main-container-content");
  if(!container) return;

  const searchWrapper = container.querySelector(".search-view-wrapper");
  if (!searchWrapper) return;

  const messageContainer = searchWrapper.querySelector(".search-message");
  const resultsContainer = searchWrapper.querySelector(".search-results-container");

  if (!messageContainer || !resultsContainer) return;

  
  
  // Clear previous results
  resultsContainer.innerHTML = "";
  
  if (!results || results.length === 0) {
    resultsContainer.innerHTML = `
    <div class="empty-state-sm">
    <div class="empty-state-content-sm">
    <p class="empty-state-submessage-sm">No notes found matching "${query}".</p>
    </div>
    </div>
    `;
    return;
  }

  // Show message
  messageContainer.style.display = "flex";
  messageContainer.textContent = `All notes matching "${query}" are displayed below.`;
  
  // Create note list
  const noteList = document.createElement("div");
  noteList.classList.add("notes-list");

  results.forEach((note) => {
    const noteCard = renderNote(note);
    noteCard.setAttribute("data-note-id", note.id);
    noteList.appendChild(noteCard);
  });

  resultsContainer.appendChild(noteList);
}

// Clear note form (for creating/editing notes)
export const clearNoteForm = () => {
  // Find form inputs (title, content, tags)
  const titleInput = document.querySelector(
    'input[name="note-title"], #note-title'
  );
  const contentInput = document.querySelector(
    'textarea[name="note-content"], #note-content'
  );
  const tagInputs = document.querySelectorAll(
    'input[type="checkbox"][name^="tag"]'
  );

  if (titleInput) titleInput.value = "";
  if (contentInput) contentInput.value = "";

  // Uncheck all tag checkboxes
  tagInputs.forEach((input) => {
    input.checked = false;
  });

  // Clear any validation errors
  const errorElements = document.querySelectorAll(".validation-error");
  errorElements.forEach((error) => error.remove());

  const errorFields = document.querySelectorAll(".error");
  errorFields.forEach((field) => field.classList.remove("error"));
};

// === helper functions ===
// render empty state
export const renderEmptyState = (viewType = "all") => {
  const isDesktop = window.innerWidth >= 1024;

  let targetContainer;
  if (isDesktop) {
    const navContainer = document.querySelector(".app-main-container-nav");
    if (!navContainer) return;
    targetContainer = navContainer.querySelector(".content");
  } else {
    targetContainer = document.querySelector(".app-main-container-content");
  }

  // Preserve tags menu
  const tagsMenu = targetContainer.querySelector("#tags-menu-sm");

  // Clear but preserve tags menu
  const children = Array.from(targetContainer.children);
  children.forEach((child) => {
    if (child.id !== "tags-menu-sm") {
      child.remove();
    }
  });

  // Ensure tags menu is hidden
  if (tagsMenu) {
    tagsMenu.style.display = "none";
    tagsMenu.classList.remove("is-active");
  }

  if (!targetContainer) return;

  // Create empty state container
  const emptyStateContainer = document.createElement("div");
  emptyStateContainer.classList.add("empty-state");

  if (viewType === "archived") {
    // Archived notes empty state
    emptyStateContainer.innerHTML = `
       <div class="empty-state-content">
         <p class="empty-state-message">All your archived notes are stored here. You can restore or delete them anytime.</p>
         <p class="empty-state-submessage">
           No notes have been archived yet. Move notes here for safekeeping, or
           <a href="#" class="empty-state-link" id="create-note-link">create a new note</a>.
         </p>
       </div>
     `;

    // Add click handler for the link
    const createNoteLink =
      emptyStateContainer.querySelector("#create-note-link");
    if (createNoteLink) {
      createNoteLink.addEventListener("click", (e) => {
        e.preventDefault();
        // Dispatch event to show create note form
        document.dispatchEvent(new CustomEvent("showCreateNoteForm"));
      });
    }
  } else {
    // All notes empty state
    emptyStateContainer.innerHTML = `
       <div class="empty-state-content">
         <p class="empty-state-submessage">You don't have any notes yet. Start a new note to capture your thoughts and ideas.</p>
       </div>
     `;
  }

  targetContainer.appendChild(emptyStateContainer);
};

// render note details
export const renderNoteDetails = (note) => {

  // remove is-selected class from all note cards
  const allNoteCards = document.querySelectorAll('.note-card');
  allNoteCards.forEach(card => card.classList.remove('is-selected'));

  // add is-selected class to the selected note card
  const noteCard = document.querySelector(`.note-card[data-note-id="${note.id}"]`);
  if(noteCard){
    noteCard.classList.add('is-selected');
  }

  const container = document.querySelector(".app-main-container-content");

  // Preserve tags menu when clearing
  const tagsMenu = container.querySelector("#tags-menu-sm");

  // Clear container but preserve tags menu
  const children = Array.from(container.children);
  children.forEach((child) => {
    if (child.id !== "tags-menu-sm") {
      child.remove();
    }
  });

  if (tagsMenu) {
    tagsMenu.style.display = "none";
    tagsMenu.classList.remove("is-active");
  }

  // create main wrapper
  const detailWrapper = document.createElement("div");
  detailWrapper.classList.add("note-details-wrapper");
  container.appendChild(detailWrapper);

  // create header section
  const headerSection = document.createElement("div");
  headerSection.classList.add("note-details-header", "mobile-tablet-only");
  detailWrapper.appendChild(headerSection);

  // === mobile/tablet actions buttons ===
  const mobileActionsRow = document.createElement("div");
  mobileActionsRow.classList.add(
    "note-details-header-actions",
    "mobile-tablet-only"
  );

  // Create all buttons in one innerHTML for better layout control
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
    <button class="delete-button mobile-tablet-only" data-action="delete">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.3769 3.10322L13.0587 4.53105H15.2582C15.9345 4.53105 16.4827 5.05735 16.4827 5.70658V6.57714C16.4827 7.02103 16.1079 7.38087 15.6455 7.38087H4.17071C3.70833 7.38087 3.3335 7.02103 3.3335 6.57714V5.70658C3.3335 5.05735 3.88173 4.53105 4.55802 4.53105H6.75754L7.43937 3.10322C7.64395 2.67474 8.08995 2.40002 8.58095 2.40002H11.2353C11.7263 2.40002 12.1722 2.67474 12.3769 3.10322Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15.2 7.44061V14.3892C15.2 15.7209 14.0895 16.8004 12.7195 16.8004H7.09717C5.72725 16.8004 4.6167 15.7209 4.6167 14.3892V7.44061" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8.49951 10.2531V13.8598M11.3165 10.2531V13.8598" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <button class="archive-button mobile-tablet-only" data-action="archive">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M15.75 5.83656V12.1626C15.75 14.3737 14.1891 15.7499 11.9802 15.7499H6.01978C3.81089 15.7499 2.25 14.3737 2.25 12.1619V5.83656C2.25 3.62548 3.81089 2.24994 6.01978 2.24994H11.9802C14.1891 2.24994 15.75 3.63205 15.75 5.83656Z" stroke="currentColor" stroke-width="1.11818" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11.25 10.4999L8.99865 12.7499L6.75 10.4999" stroke="currentColor" stroke-width="1.11818" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8.99854 12.75V7.5" stroke="currentColor" stroke-width="1.11818" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.7002 5.25H2.29395" stroke="currentColor" stroke-width="1.11818" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

    </button>
    
    <button class="cancel-button mobile-tablet-only" data-action="cancel">Cancel</button>
    
    <button class="save-button mobile-tablet-only" data-action="save">Save Note</button>
    </div>
  `;

  // Attach event listeners using data-action attributes
  const mobileBackButton = mobileActionsRow.querySelector(
    '[data-action="back"]'
  );
  mobileBackButton.addEventListener("click", () => {
    // Preserve tags menu when clearing
    const tagsMenu = container.querySelector("#tags-menu-sm");

    // Clear container but preserve tags menu
    const children = Array.from(container.children);
    children.forEach((child) => {
      if (child.id !== "tags-menu-sm") {
        child.remove();
      }
    });

    // Ensure tags menu is hidden
    if (tagsMenu) {
      tagsMenu.style.display = "none";
      tagsMenu.classList.remove("is-active");
    }

    // Check what view the user was on before opening note details
    const isArchivedView = document.querySelector('.archived-notes-link.is-active');
    const isSearchView = container.querySelector('.search-view-wrapper');
    const headerTitle = document.querySelector(".app-main-container-header h2");
    const isTagFilter = headerTitle && headerTitle.textContent.includes("Tag:");

    if (isArchivedView) {
      // User was viewing archived notes
      const archivedNotes = noteManager.getArchivedNotes();
      ui.renderAllNotes(archivedNotes, null, 'archived');
      ui.toggleArchiveView(true);
    } else if (isSearchView) {
      // User was in search view - restore search view
      ui.renderSearchView();
    } else if (isTagFilter) {
      // User was filtering by tag - extract tag name and restore
      const tagName = headerTitle.textContent.replace("Tag: ", "");
      const filteredNotes = noteManager.filterByTag(tagName);
      ui.renderAllNotes(filteredNotes, tagName, "all");
    } else {
      // Default: show all notes
      document.dispatchEvent(new CustomEvent("showAllNotes"));
    }
  });

  const mobileDeleteButton = mobileActionsRow.querySelector(
    '[data-action="delete"]'
  );
  mobileDeleteButton.addEventListener("click", () => {
    // Display modal for confirmation
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "modal-title");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
      <div class="modal-content">
      <div class="modal-content-top">
        <span class="modal-icon">
          <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.8521 3.87899L15.6702 5.66378H18.3097C19.1212 5.66378 19.7791 6.32166 19.7791 7.1332V8.2214C19.7791 8.77626 19.3293 9.22606 18.7745 9.22606H5.00466C4.4498 9.22606 4 8.77626 4 8.2214V7.1332C4 6.32166 4.65788 5.66378 5.46943 5.66378H8.10885L8.92705 3.87899C9.17255 3.34339 9.70775 3 10.2969 3H13.4821C14.0713 3 14.6065 3.34339 14.8521 3.87899Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.24 9.30078V17.9865C18.24 19.6511 16.9073 21.0005 15.2634 21.0005H8.51661C6.8727 21.0005 5.54004 19.6511 5.54004 17.9865V9.30078" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10.1992 12.8164V17.3248M13.5796 12.8164V17.3248" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <div class="modal-label">
          <h2 id="modal-title">Delete Note</h2>
          <p>Are you sure you want to delete this note? This action cannot be undone.</p>
        </div>
        </div>
        <div class="modal-buttons">
          <button class="modal-cancel-button">Cancel</button>
          <button class="modal-delete-button">Delete Note</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      modal.style.display = "flex";
      modal.classList.add("modal-open");
    }, 10);

    // Close modal when clicking backdrop
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        closeModal();
      }
    });

    // Escape key handler
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);

    const cancelBtn = modal.querySelector(".modal-cancel-button");
    cancelBtn.addEventListener("click", () => {
      closeModal();
    });

    const deleteBtn = modal.querySelector(".modal-delete-button");
    deleteBtn.addEventListener("click", () => {
      const event = new CustomEvent("deleteNote", {
        detail: { noteId: note.id },
      });
      document.dispatchEvent(event);
      closeModal();
    });

    function closeModal() {
      modal.classList.remove("modal-open");
      modal.classList.add("modal-close");
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = "";
      }, 300);
    }
  });

  const mobileArchiveButton = mobileActionsRow.querySelector(
    '[data-action="archive"]'
  );
  mobileArchiveButton.addEventListener("click", () => {
    // Confirmation modal
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "modal-title");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
      <div class="modal-content">
      <div class="modal-content-top">
        <span class="modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 7.78216V16.2169C21 19.165 18.9188 21 15.9736 21H8.02638C5.08119 21 3 19.165 3 16.2159V7.78216C3 4.83405 5.08119 3 8.02638 3H15.9736C18.9188 3 21 4.84281 21 7.78216Z" stroke="#0E121B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 14L11.9982 17L9 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M11.998 17V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.9336 7H3.05859" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

        </span>
        <div class="modal-label">
          <h2 id="modal-title">${isArchived ? "Restore Note" : "Archive Note"}</h2>
          <p>Are you sure you want to ${isArchived ? "restore this note" : "archive this note"}? This action cannot be undone.</p>
          </div>
        </div>
        <div class="modal-buttons">
          <button class="modal-cancel-button">Cancel</button>
          <button class="modal-archive-button">Archive Note</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      modal.style.display = "flex";
      modal.classList.add("modal-open");
    }, 10);

    // Close modal when clicking backdrop
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        closeModal();
      }
    });

    // Escape key handler
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);

    const cancelBtn = modal.querySelector(".modal-cancel-button");
    cancelBtn.addEventListener("click", () => {
      closeModal();
    });

    const archiveBtn = modal.querySelector(".modal-archive-button");
    archiveBtn.addEventListener("click", () => {
      const event = new CustomEvent("archiveNote", {
        detail: { noteId: note.id, isArchived: !note.isArchived },
      });
      document.dispatchEvent(event);
      closeModal();
    });

    function closeModal() {
      modal.classList.remove("modal-open");
      modal.classList.add("modal-close");
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = "";
      }, 300);
    }
  });

  const mobileCancelButton = mobileActionsRow.querySelector(
    '[data-action="cancel"]'
  );
  mobileCancelButton.addEventListener("click", () => {
    // Clear container but preserve tags menu
    const children = Array.from(container.children);
    children.forEach((child) => {
      if (child.id !== "tags-menu-sm") {
        child.remove();
      }
    });

    // Ensure tags menu is hidden
    if (tagsMenu) {
      tagsMenu.style.display = "none";
      tagsMenu.classList.remove("is-active");
    }

    // Remove 3-column layout
    const appMainContainer = document.querySelector(".app-main-container");
    if (appMainContainer) {
      appMainContainer.classList.remove("has-note-selected");
    }

    // Remove actions column
    const actionsColumn = document.querySelector(".app-main-container-actions");
    if (actionsColumn) {
      actionsColumn.remove();
    }

    document.dispatchEvent(new CustomEvent("showNotesList"));
  });

  const mobileSaveButton = mobileActionsRow.querySelector(
    '[data-action="save"]'
  );
  mobileSaveButton.addEventListener("click", () => {
    // Query for elements when event fires (they're created later in the function)
    const titleInput = detailWrapper.querySelector(".note-details-title");
    const contentTextarea = detailWrapper.querySelector(".note-details-body");
    const tagsInput = detailWrapper.querySelector(".note-details-tags-input");

    if (!titleInput || !contentTextarea || !tagsInput) return;

    const updatedTitle = titleInput.value.trim();
    const updatedContent = contentTextarea.value.trim();

    // Parse tags
    const updatedTags = tagsInput.value
      .trim()
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const event = new CustomEvent("saveNote", {
      detail: {
        noteId: note.id,
        title: updatedTitle,
        content: updatedContent,
        tags: updatedTags,
      },
    });
    document.dispatchEvent(event);
  });

  // Append mobile actions row to header
  headerSection.appendChild(mobileActionsRow);

  // actions buttons container (desktop, top right corner)
  let actionsColumn = document.querySelector(".app-main-container-actions");
  if (!actionsColumn) {
    actionsColumn = document.createElement("div");
    actionsColumn.classList.add("app-main-container-actions", "desktop-only");
    const appMainContainer = document.querySelector(".app-main-container");
    if (appMainContainer) {
      appMainContainer.appendChild(actionsColumn);
      appMainContainer.classList.add("has-note-selected");
    }
  } else {
    // Clear existing buttons to prevent duplicates
    actionsColumn.innerHTML = "";
  }

  // Ensure has-note-selected class is added even if actionsColumn already exists
  const appMainContainer = document.querySelector(".app-main-container");
  if (appMainContainer) {
    appMainContainer.classList.add("has-note-selected");
  }

  const actionButtons = document.createElement("div");
  actionButtons.classList.add("note-actions", "desktop-only");

  // Archive/Restore button (toggles based on note status)
  const archiveButton = document.createElement("button");
  archiveButton.classList.add("archive-button");
  const isArchived = note.isArchived || false;

  archiveButton.innerHTML = `
  ${isArchived ? `
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M3.09026 6.16962C3.4082 6.03519 3.7749 6.18396 3.90932 6.50189L5.00629 9.09638L7.58326 8.0068C7.9012 7.87239 8.2679 8.02114 8.40233 8.33904C8.53675 8.65704 8.388 9.02371 8.07005 9.15813L4.91741 10.491C4.59948 10.6255 4.23278 10.4767 4.09836 10.1588L2.758 6.98867C2.62357 6.67074 2.77234 6.30404 3.09026 6.16962Z" fill="#0E121B"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.7624 4.71991C7.89009 4.71991 5.55539 7.008 5.4832 9.85328C5.47445 10.1983 5.18762 10.4709 4.84255 10.4622C4.49749 10.4534 4.22485 10.1666 4.2336 9.82153C4.32299 6.29821 7.21239 3.46991 10.7624 3.46991C14.366 3.46991 17.2915 6.39544 17.2915 9.99894C17.2915 13.6097 14.3655 16.528 10.7624 16.528C8.52867 16.528 6.56351 15.41 5.38176 13.708C5.18489 13.4244 5.25516 13.035 5.53869 12.8382C5.82223 12.6413 6.21167 12.7115 6.40854 12.9951C7.36759 14.3764 8.957 15.278 10.7624 15.278C13.6761 15.278 16.0415 12.9184 16.0415 9.99894C16.0415 7.0858 13.6756 4.71991 10.7624 4.71991Z" fill="#0E121B"/>
  </svg>
  
  ` : `
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 6.48513V13.5141C17.5 15.9708 15.7657 17.5 13.3113 17.5H6.68865C4.23432 17.5 2.5 15.9708 2.5 13.5133V6.48513C2.5 4.02837 4.23432 2.5 6.68865 2.5H13.3113C15.7657 2.5 17.5 4.03567 17.5 6.48513Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12.5 11.6667L9.9985 14.1667L7.5 11.6667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.99832 14.1666V8.33331" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M17.4447 5.83331H2.54883" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  `}
    <span class="archive-button-label">${
      isArchived ? "Restore Note" : "Archive Note"
    }</span>`


  archiveButton.addEventListener("click", () => {
    // Confirmation modal
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "modal-title");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
      <div class="modal-content">
      <div class="modal-content-top">
        <span class="modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 7.78216V16.2169C21 19.165 18.9188 21 15.9736 21H8.02638C5.08119 21 3 19.165 3 16.2159V7.78216C3 4.83405 5.08119 3 8.02638 3H15.9736C18.9188 3 21 4.84281 21 7.78216Z" stroke="#0E121B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 14L11.9982 17L9 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M11.998 17V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.9336 7H3.05859" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

        </span>
        <div class="modal-label">
          <h2 id="modal-title">${isArchived ? "Restore Note" : "Archive Note"}</h2>
          <p>Are you sure you want to ${isArchived ? "restore this note" : "archive this note"}? This action cannot be undone.</p>
          </div>
        </div>
        <div class="modal-buttons">
          <button class="modal-cancel-button">Cancel</button>
          <button class="modal-archive-button">Archive Note</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      modal.style.display = "flex";
      modal.classList.add("modal-open");
    }, 10);

    // Close modal when clicking backdrop
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        closeModal();
      }
    });

    // Escape key handler
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);

    const cancelBtn = modal.querySelector(".modal-cancel-button");
    cancelBtn.addEventListener("click", () => {
      closeModal();
    });

    const archiveBtn = modal.querySelector(".modal-archive-button");
    archiveBtn.addEventListener("click", () => {
      const event = new CustomEvent("archiveNote", {
        detail: { noteId: note.id, isArchived: !note.isArchived },
      });
      document.dispatchEvent(event);
      closeModal();
    });

    function closeModal() {
      modal.classList.remove("modal-open");
      modal.classList.add("modal-close");
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = "";
      }, 300);
    }
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
    // Display modal for confirmation
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "modal-title");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
      <div class="modal-content">
      <div class="modal-content-top">
        <span class="modal-icon">
          <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.8521 3.87899L15.6702 5.66378H18.3097C19.1212 5.66378 19.7791 6.32166 19.7791 7.1332V8.2214C19.7791 8.77626 19.3293 9.22606 18.7745 9.22606H5.00466C4.4498 9.22606 4 8.77626 4 8.2214V7.1332C4 6.32166 4.65788 5.66378 5.46943 5.66378H8.10885L8.92705 3.87899C9.17255 3.34339 9.70775 3 10.2969 3H13.4821C14.0713 3 14.6065 3.34339 14.8521 3.87899Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.24 9.30078V17.9865C18.24 19.6511 16.9073 21.0005 15.2634 21.0005H8.51661C6.8727 21.0005 5.54004 19.6511 5.54004 17.9865V9.30078" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10.1992 12.8164V17.3248M13.5796 12.8164V17.3248" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <div class="modal-label">
          <h2 id="modal-title">Delete Note</h2>
          <p>Are you sure you want to delete this note? This action cannot be undone.</p>
        </div>
        </div>
        <div class="modal-buttons">
          <button class="modal-cancel-button">Cancel</button>
          <button class="modal-delete-button">Delete Note</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      modal.style.display = "flex";
      modal.classList.add("modal-open");
    }, 10);

    // Close modal when clicking backdrop
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        closeModal();
      }
    });

    // Escape key handler
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);

    const cancelBtn = modal.querySelector(".modal-cancel-button");
    cancelBtn.addEventListener("click", () => {
      closeModal();
    });

    const deleteBtn = modal.querySelector(".modal-delete-button");
    deleteBtn.addEventListener("click", () => {
      const event = new CustomEvent("deleteNote", {
        detail: { noteId: note.id },
      });
      document.dispatchEvent(event);
      closeModal();
    });

    function closeModal() {
      modal.classList.remove("modal-open");
      modal.classList.add("modal-close");
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = "";
      }, 300);
    }
  });

  actionsColumn.appendChild(archiveButton);
  actionsColumn.appendChild(deleteButton);

  // create content section
  const contentSection = document.createElement("div");
  contentSection.classList.add("note-details-content");

  // Build the innerHTML string
  const tagsValue = note.tags.join(", ");
  const locationHtml = note.location
    ? `<div class="note-details-location">
          <span class="note-details-location-label">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00005 2.5C5.10074 2.5 2.66671 4.93403 2.66671 7.83334C2.66671 10.7327 5.10074 13.1667 8.00005 13.1667C10.8994 13.1667 13.3334 10.7327 13.3334 7.83334C13.3334 4.93403 10.8994 2.5 8.00005 2.5ZM1.66671 7.83334C1.66671 4.39131 4.41474 1.66667 8.00005 1.66667C11.5854 1.66667 14.3334 4.39131 14.3334 7.83334C14.3334 11.2754 11.5854 14 8.00005 14C4.41474 14 1.66671 11.2754 1.66671 7.83334ZM8.00005 10.1667C7.17167 10.1667 6.50005 9.49506 6.50005 8.66667C6.50005 7.83829 7.17167 7.16667 8.00005 7.16667C8.82843 7.16667 9.50005 7.83829 9.50005 8.66667C9.50005 9.49506 8.82843 10.1667 8.00005 10.1667Z" fill="currentColor"/>
            </svg>
            Location
          </span>
          <span class="note-details-location-value">${escapeHtml(
            note.location.city
          )}, ${escapeHtml(note.location.country)}</span>
        </div>`
    : "";

  contentSection.innerHTML = `
      <input 
        type="text" 
        class="note-details-title editable" 
        value="${escapeHtml(note.title)}"
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
            class="note-details-tags-input editable" 
            value="${escapeHtml(tagsValue)}"
            placeholder="Add tags separated by commas(e.g. Work, Planning)"
          />
        </div>
        <div class="note-details-status">
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
        </div>
        <div class="note-details-date">
          <span class="note-details-date-label">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.16699 2.5C5.12919 2.5 2.66699 4.96219 2.66699 8C2.66699 11.0372 5.12923 13.5 8.16699 13.5C11.2048 13.5 13.667 11.0372 13.667 8C13.667 4.96219 11.2048 2.5 8.16699 2.5ZM1.66699 8C1.66699 4.40991 4.57691 1.5 8.16699 1.5C11.7571 1.5 14.667 4.40991 14.667 8C14.667 11.5894 11.7571 14.5 8.16699 14.5C4.57687 14.5 1.66699 11.5894 1.66699 8Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7.94824 5.21777C8.22438 5.21777 8.44824 5.44163 8.44824 5.71777V8.16619L10.3212 9.28553C10.5583 9.42719 10.6356 9.73419 10.494 9.97126C10.3523 10.2083 10.0453 10.2856 9.80824 10.1439L7.69171 8.87906C7.54071 8.78879 7.44824 8.62586 7.44824 8.44986V5.71777C7.44824 5.44163 7.67211 5.21777 7.94824 5.21777Z" fill="currentColor"/>
            </svg>
            Last Edited
          </span>
          <span class="note-details-date-value">${formatDate(
            note.lastEdited
          )}</span>
        </div>
        ${locationHtml}
      </div>
      <textarea 
        class="note-details-body editable"
      >${escapeHtml(note.content || "")}</textarea>
    `;

  // Get references to elements after innerHTML
  const title = contentSection.querySelector(".note-details-title");
  const tagsInput = contentSection.querySelector(".note-details-tags-input");
  const contentDisplay = contentSection.querySelector(".note-details-body");

  // Add event listener for Enter key on textarea
  contentDisplay.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const saveButton = document.querySelector(".save-button");
      if (saveButton) {
        saveButton.click();
      }
    }
  });

  // Update header title based on screen size
  const headerTitle = document.querySelector(".app-main-container-header h2");
  if (headerTitle) {
    const isMobileOrTablet = window.innerWidth < 1024;
    if (isMobileOrTablet) {
      // Hide on mobile/tablet
      headerTitle.textContent = "";
      headerTitle.style.display = "none";
    }
  }

  // Footer section (desktop only, bottom right corner)
  const footerSection = document.createElement("div");
  footerSection.classList.add("note-details-footer", "desktop-only");

  footerSection.innerHTML = `
      <button class="save-button desktop-only">Save Note</button>
      <button class="cancel-button desktop-only">Cancel</button>
    `;

  // Get footer button references
  const saveButton = footerSection.querySelector(".save-button");
  const cancelButton = footerSection.querySelector(".cancel-button");

  // Add event listeners to footer buttons
  saveButton.addEventListener("click", () => {
    // Get updated values from the detail view
    const updatedTitle = title.value.trim();
    const updatedContent = contentDisplay.value.trim();

    // parse tags
    const updatedTags = tagsInput.value
      .trim()
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // Dispatch event to save note
    const event = new CustomEvent("saveNote", {
      detail: {
        noteId: note.id,
        title: updatedTitle,
        content: updatedContent,
        tags: updatedTags,
      },
    });
    document.dispatchEvent(event);
  });

  cancelButton.addEventListener("click", () => {
    // Preserve tags menu when clearing
    const tagsMenu = container.querySelector("#tags-menu-sm");

    // Clear container but preserve tags menu
    const children = Array.from(container.children);
    children.forEach((child) => {
      if (child.id !== "tags-menu-sm") {
        child.remove();
      }
    });

    // Ensure tags menu is hidden
    if (tagsMenu) {
      tagsMenu.style.display = "none";
      tagsMenu.classList.remove("is-active");
    }

    // remove 3-column layout
    const appMainContainer = document.querySelector(".app-main-container");
    if (appMainContainer) {
      appMainContainer.classList.remove("has-note-selected");
    }

    // remove actions column
    const actionsColumn = document.querySelector(".app-main-container-actions");
    if (actionsColumn) {
      actionsColumn.remove();
    }

    // Dispatch event to reload notes list
    document.dispatchEvent(new CustomEvent("showNotesList"));
  });

  // Append sections to detail wrapper
  detailWrapper.appendChild(headerSection);
  detailWrapper.appendChild(contentSection);
  detailWrapper.appendChild(footerSection);

  container.appendChild(detailWrapper);
};

export const getAllUniqueTags = () => {
  const allNotes = getAllNotes();

  // fillter out archived notes
  const unarchivedNotes = allNotes.filter((note) => !note.isArchived);
  const uniqueTags = [
    ...new Set(unarchivedNotes.flatMap((note) => note.tags)),
  ].sort();

  return uniqueTags;
};

function updateHeader(filterTag = null, view) {
  const headerTitle = document.querySelector(".app-main-container-header h2");

  if (!headerTitle) return;

  if (filterTag) {
    headerTitle.textContent = `Tag: ${filterTag}`;
  } else if (view === "archived") {
    headerTitle.textContent = "Archived Notes";
  } else {
    headerTitle.textContent = "All Notes";
  }
}

function setupTagsMenuEventListeners(tagsMenu, tagsLink, contentContainer) {
  // Tags link click handler
  tagsLink.addEventListener("click", (e) => {
    e.preventDefault();
    const allLinks = document.querySelectorAll(".menu-item > a");
    allLinks.forEach((link) => link.classList.remove("is-active"));
    tagsLink.classList.add("is-active");
    const otherElements = contentContainer.querySelectorAll(
      ".app-main-container-content > *:not(#tags-menu-sm)"
    );
    otherElements.forEach((element) => (element.style.display = "none"));
    tagsMenu.style.display = "flex";
    tagsMenu.classList.add("is-active");
    contentContainer.classList.add("tags-section-open");
    const headerTitle = document.querySelector(".app-main-container-header h2");
    if (headerTitle) {
      headerTitle.textContent = "Tags";
    }
  });

  // Back button handler
  const backButton = tagsMenu.querySelector("#tags-back-btn");
  if (backButton) {
    backButton.addEventListener("click", (e) => {
      e.preventDefault();
      tagsMenu.style.display = "none";
      tagsMenu.classList.remove("is-active");
      contentContainer.classList.remove("tags-section-open");
      tagsLink.classList.remove("is-active");
      const notesList = contentContainer.querySelector(".notes-list");
      if (notesList) {
        notesList.style.display = "block";
        const headerTitle = document.querySelector(
          ".app-main-container-header h2"
        );
        if (headerTitle && !headerTitle.textContent.includes("Archived")) {
          headerTitle.textContent = "All Notes";
        }
      } else {
        document.dispatchEvent(new CustomEvent("showAllNotes"));
      }
    });
  }

  // Tag links click handlers
  const tagLinks = tagsMenu.querySelectorAll(".tag-link");
  tagLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tag = link.getAttribute("data-tag");
      tagsMenu.style.display = "none";
      tagsMenu.classList.remove("is-active");
      contentContainer.classList.remove("tags-section-open");
      tagsLink.classList.remove("is-active");
      document.dispatchEvent(
        new CustomEvent("filterNotesByTag", {
          detail: { tag: tag },
        })
      );
    });
  });
}
