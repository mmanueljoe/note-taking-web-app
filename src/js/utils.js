export const getElementByType = (type, value) => {
  switch (type.toLowerCase()) {
    case "id":
      return document.getElementById(value);
    case "class":
      return Array.from(document.getElementsByClassName(value));
    case "tag":
      return Array.from(document.getElementsByTagName(value));
    default:
      return null;
  }
};

export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-GB", options);
};

// escape html to prevent xss attacks
export const escapeHtml = (html) => {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
};

// highlight search terms in text
export const highlightSearchTerms = (text, searchQuery) => {
  if (!searchQuery || !text) return escapeHtml(text);
  
  const escapedText = escapeHtml(text);
  const escapedQuery = escapeHtml(searchQuery);
  
  // Create case-insensitive regex to find all matches
  const regex = new RegExp(`(${escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  
  // Replace matches with highlighted version
  return escapedText.replace(regex, '<mark>$1</mark>');
};

// Focus management utilities for accessibility
let previousActiveElement = null;

/**
 * Trap focus within a modal element
 * @param {HTMLElement} modalElement - The modal container element
 */
export const trapFocus = (modalElement) => {
  // Save the element that had focus before opening modal
  previousActiveElement = document.activeElement;
  
  // Get all focusable elements within the modal
  const focusableElements = modalElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  // Focus the first element
  firstFocusable.focus();
  
  // Handle Tab key to trap focus
  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };
  
  modalElement.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    modalElement.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Restore focus to the element that had focus before modal opened
 */
export const restoreFocus = () => {
  if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
    previousActiveElement.focus();
    previousActiveElement = null;
  }
};