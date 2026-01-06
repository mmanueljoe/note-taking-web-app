import { loadNotes, saveNotes } from './storage.js';

// Storage key for categories
const STORAGE_KEYS = {
  CATEGORIES: 'note_categories'
};

/**
 * Category class
 */
export class Category {
  constructor(name, color = null, icon = null) {
    this.id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    this.name = name.trim();
    this.color = color || this.generateColor();
    this.icon = icon || null;
    this.createdAt = new Date();
    this.noteCount = 0; // Track how many notes use this category
  }

  // Generate a random color for the category badge
  generateColor() {
    const colors = [
      '#335CFF', '#FF6B6B', '#4ECDC4', '#FFE66D', 
      '#A8E6CF', '#FF8B94', '#95E1D3', '#F38181',
      '#AA96DA', '#FCBAD3', '#A8D8EA', '#FFD3A5'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      icon: this.icon,
      createdAt: this.createdAt,
      noteCount: this.noteCount
    };
  }

  static fromJSON(json) {
    const category = new Category(json.name, json.color, json.icon);
    category.id = json.id;
    category.createdAt = json.createdAt ? new Date(json.createdAt) : new Date();
    category.noteCount = json.noteCount || 0;
    return category;
  }
}

/**
 * Load all categories from localStorage
 */
export const loadCategories = () => {
  try {
    const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return storedCategories ? JSON.parse(storedCategories) : [];
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
};

/**
 * Save categories to localStorage
 */
export const saveCategories = (categories) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return { success: true, error: null };
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      return {
        success: false,
        error: 'quota',
        message: 'Storage quota exceeded. Please delete some categories.'
      };
    } else {
      console.error('Error saving categories:', error);
      return {
        success: false,
        error: 'unknown',
        message: 'Failed to save categories. Please try again.'
      };
    }
  }
};

/**
 * Create a new category
 */
export const createCategory = (name, color = null, icon = null) => {
  const categories = loadCategories();
  
  // Check if category name already exists
  if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase().trim())) {
    return {
      success: false,
      error: 'Category with this name already exists'
    };
  }

  const category = new Category(name, color, icon);
  categories.push(category.toJSON());
  
  const result = saveCategories(categories);
  if (result.success) {
    return {
      success: true,
      category: category.toJSON()
    };
  }
  return result;
};

/**
 * Update a category
 */
export const updateCategory = (id, updates) => {
  const categories = loadCategories();
  const category = categories.find(cat => cat.id === id);
  
  if (!category) {
    return { success: false, error: 'Category not found' };
  }

  // Check if new name conflicts with existing category
  if (updates.name) {
    const nameConflict = categories.some(
      cat => cat.id !== id && cat.name.toLowerCase() === updates.name.toLowerCase().trim()
    );
    if (nameConflict) {
      return { success: false, error: 'Category with this name already exists' };
    }
    category.name = updates.name.trim();
  }

  if (updates.color !== undefined) category.color = updates.color;
  if (updates.icon !== undefined) category.icon = updates.icon;

  const result = saveCategories(categories);
  return result.success 
    ? { success: true, category } 
    : result;
};

/**
 * Delete a category
 */
export const deleteCategory = (id) => {
  const categories = loadCategories();
  const category = categories.find(cat => cat.id === id);
  
  if (!category) {
    return { success: false, error: 'Category not found' };
  }

  // Remove category from all notes that use it
  const notes = loadNotes();
  notes.forEach(note => {
    if (note.categoryId === id) {
      note.categoryId = null;
    }
  });
  saveNotes(notes);

  // Remove category
  const updatedCategories = categories.filter(cat => cat.id !== id);
  const result = saveCategories(updatedCategories);
  return result;
};

/**
 * Get category by ID
 */
export const getCategoryById = (id) => {
  const categories = loadCategories();
  return categories.find(cat => cat.id === id) || null;
};

/**
 * Get all categories
 */
export const getAllCategories = () => {
  return loadCategories();
};

/**
 * Update note count for a category
 */
export const updateCategoryNoteCount = (categoryId) => {
  const categories = loadCategories();
  const category = categories.find(cat => cat.id === categoryId);
  
  if (category) {
    const notes = loadNotes();
    category.noteCount = notes.filter(note => note.categoryId === categoryId).length;
    saveCategories(categories);
  }
};

/**
 * Get categories with note counts
 */
export const getCategoriesWithCounts = () => {
  const categories = loadCategories();
  const notes = loadNotes();
  
  return categories.map(category => {
    const count = notes.filter(note => note.categoryId === category.id).length;
    return {
      ...category,
      noteCount: count
    };
  });
};