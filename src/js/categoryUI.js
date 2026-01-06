import { escapeHtml } from './utils.js';
import { getAllCategories, getCategoriesWithCounts, getCategoryById } from './categoryManager.js';
import { getAllNotes, filterByCategory } from './noteManager.js';

/**
 * Render category badge on note card
 */
export const renderCategoryBadge = (categoryId) => {
  if (!categoryId) return '';
  
  const category = getCategoryById(categoryId);
  if (!category) return '';

  return `
    <span 
      class="note-category-badge" 
      data-category-id="${category.id}"
      style="background-color: ${category.color}20; color: ${category.color}; border-color: ${category.color}40;"
    >
      ${escapeHtml(category.name)}
    </span>
  `;
};

/**
 * Render category selector dropdown
 */
export const renderCategorySelector = (selectedCategoryId = null, containerId = null) => {
    try {
      const categories = getAllCategories();
      
      // Find container - try multiple methods
      let container = null;
      if (containerId) {
        // If containerId is provided, try getElementById first
        container = document.getElementById(containerId);
        // If not found, try querySelector
        if (!container) {
          container = document.querySelector(`#${containerId}`);
        }
      }
      
      // Fallback to class selector
      if (!container) {
        container = document.querySelector('.category-selector-container');
      }
      
      if (!container) {
        console.error('Category selector container not found. Tried:', containerId || '.category-selector-container');
        return;
      }
  
      // Build options HTML
      const optionsHtml = `
        <option value="">No Category</option>
        ${categories && categories.length > 0 
          ? categories.map(cat => `
            <option value="${cat.id}" ${selectedCategoryId === cat.id ? 'selected' : ''}>
              ${escapeHtml(cat.name)}
            </option>
          `).join('')
          : ''
        }
      `;
  
      // Render the select element
      container.innerHTML = `
        <select class="category-selector" id="note-category-select" name="note-category">
          ${optionsHtml}
        </select>
      `;
  
      console.log('Category selector rendered with', categories.length, 'categories');
    } catch (error) {
      console.error('Error rendering category selector:', error);
    }
  };
/**
 * Render category list in sidebar (similar to tags)
 */
export const renderCategoryLinks = (categories) => {
  const menuList = document.querySelector('.menu-list');
  if (!menuList) return;

  const categoryListContainer = document.createElement('li');
  categoryListContainer.classList.add('menu-item', 'categories-section', 'desktop-only');

  const existingCategoriesSection = menuList.querySelector('.categories-section');
  if (existingCategoriesSection) {
    existingCategoriesSection.remove();
  }

  if (!categories || categories.length === 0) {
    categoryListContainer.style.display = 'none';
    return;
  }

  // Find "archived notes" link to insert after
  const archivedNotesLink = Array.from(menuList.children).find((child) => {
    const isArchivedLink = child.querySelector('.archived-notes-link');
    return isArchivedLink;
  });

  categoryListContainer.innerHTML = `
    <h2 class="categories-heading">Categories</h2>
    <ul class="categories-list">
      ${categories.map(category => `
        <li class="category-item">
          <a href="#" class="category-link" data-category-id="${category.id}">
            <span 
              class="category-color-dot" 
              style="background-color: ${category.color};"
            ></span>
            <span class="category-label">${escapeHtml(category.name)}</span>
            ${category.noteCount > 0 ? `<span class="category-count">${category.noteCount}</span>` : ''}
          </a>
        </li>
      `).join('')}
    </ul>
  `;

  // Add click handlers
  const categoryLinks = categoryListContainer.querySelectorAll('.category-link');
  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryId = link.getAttribute('data-category-id');
      document.dispatchEvent(new CustomEvent('filterNotesByCategory', {
        detail: { categoryId }
      }));
    });
  });

  // Insert after archived notes link
  if (archivedNotesLink && archivedNotesLink.nextSibling) {
    archivedNotesLink.parentNode.insertBefore(
      categoryListContainer,
      archivedNotesLink.nextSibling
    );
  } else {
    menuList.appendChild(categoryListContainer);
  }
};

/**
 * Render category management modal
 */
export const renderCategoryModal = (category = null) => {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-labelledby', 'category-modal-title');
  modal.setAttribute('aria-modal', 'true');

  const isEdit = !!category;

  modal.innerHTML = `
    <div class="modal-content category-modal-content">
      <div class="modal-content-top">
        <div class="modal-label">
          <h2 id="category-modal-title">${isEdit ? 'Edit Category' : 'Create Category'}</h2>
        </div>
      </div>
      <form class="category-form" id="category-form">
        <div class="form-group">
          <label for="category-name">Category Name</label>
          <input 
            type="text" 
            id="category-name" 
            name="category-name" 
            class="category-input"
            value="${category ? escapeHtml(category.name) : ''}"
            placeholder="Enter category name"
            required
            maxlength="30"
          />
        </div>
        <div class="form-group">
          <label for="category-color">Color</label>
          <div class="color-picker-container">
            <input 
              type="color" 
              id="category-color" 
              name="category-color" 
              class="category-color-input"
              value="${category ? category.color : '#335CFF'}"
            />
            <span class="color-preview" style="background-color: ${category ? category.color : '#335CFF'};"></span>
          </div>
        </div>
        <div class="modal-buttons">
          <button type="button" class="modal-cancel-button">Cancel</button>
          <button type="submit" class="modal-save-button">${isEdit ? 'Update' : 'Create'}</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Update color preview on change
  const colorInput = modal.querySelector('#category-color');
  const colorPreview = modal.querySelector('.color-preview');
  colorInput.addEventListener('input', (e) => {
    colorPreview.style.backgroundColor = e.target.value;
  });

  // Handle form submission
  const form = modal.querySelector('#category-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = modal.querySelector('#category-name').value.trim();
    const color = modal.querySelector('#category-color').value;

    if (name) {
      document.dispatchEvent(new CustomEvent(isEdit ? 'updateCategory' : 'createCategory', {
        detail: { 
          categoryId: category?.id,
          name, 
          color 
        }
      }));
      closeModal();
    }
  });

  // Handle cancel
  const cancelBtn = modal.querySelector('.modal-cancel-button');
  cancelBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal();
    }
  });

  // Escape key handler
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  function closeModal() {
    modal.classList.remove('modal-open');
    modal.classList.add('modal-close');
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  }

  // Show modal
  setTimeout(() => {
    modal.style.display = 'flex';
    modal.classList.add('modal-open');
    modal.querySelector('#category-name').focus();
  }, 10);
};