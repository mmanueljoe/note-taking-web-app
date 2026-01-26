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

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-GB", options);
};

export const escapeHtml = (html) => {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
};

export const highlightSearchTerms = (text, searchQuery) => {
  if (!searchQuery || !text) return escapeHtml(text);
  
  const escapedText = escapeHtml(text);
  const escapedQuery = escapeHtml(searchQuery);
  
  const regex = new RegExp(`(${escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  
  return escapedText.replace(regex, '<mark>$1</mark>');
};

let previousActiveElement = null;

/**
 * @param {HTMLElement} modalElement - The modal container element
 */
export const trapFocus = (modalElement) => {
  previousActiveElement = document.activeElement;
  
  const focusableElements = modalElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  firstFocusable.focus();
  
  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };
  
  modalElement.addEventListener('keydown', handleTabKey);
  
  return () => {
    modalElement.removeEventListener('keydown', handleTabKey);
  };
};


export const restoreFocus = () => {
  if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
    previousActiveElement.focus();
    previousActiveElement = null;
  }
};