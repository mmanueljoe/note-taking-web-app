import { loadNotes, saveNotes } from "./storage.js";

// Note class
export class Note {
  constructor(title, content, tags) {
    this.id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    this.title = title.trim();
    this.content = content.trim();
    this.tags = Array.isArray(tags) ? tags : [];
    this.createdAt = new Date();
    this.lastEdited = new Date();
    this.isArchived = false;
    this.location = null;
    this.categoryId = null; // Add category support
  }

  archive() {
    this.isArchived = !this.isArchived;
    this.lastEdited = new Date();
  }

  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.lastEdited = new Date();
    }
  }

  // convert to plain object(json)
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      tags: this.tags,
      createdAt: this.createdAt,
      lastEdited: this.lastEdited,
      isArchived: this.isArchived,
      location: this.location,
      categoryId: this.categoryId,
    };
  }

  // create instance from plain object
  static fromJSON(json) {
    const note = new Note(json.title, json.content, json.tags);
    note.id = json.id;
    note.createdAt = json.createdAt ? new Date(json.createdAt) : new Date();
    note.lastEdited = json.lastEdited ? new Date(json.lastEdited) : new Date();
    note.isArchived = json.isArchived;
    note.location = json.location;
    note.categoryId = json.categoryId || null;
    return note;
  }
}

// create note
export const createNote = (title, content, tags = []) => {
  const note = new Note(title, content, tags);
  return note.toJSON();
};

// delete note
export const deleteNote = (id) => {
  const notes = loadNotes();

  const updatedNotes = notes.filter((note) => note.id !== id);
  saveNotes(updatedNotes);
  return true;
};

// update note
export const updateNote = (id, updates) => {
  const notes = loadNotes();
  const note = notes.find((note) => note.id === id);

  if (!note) return false;

  Object.assign(note, updates);
  note.lastEdited = new Date();
  saveNotes(notes);
  // return updated note
  return note;
};

// search notes
export const searchNotes = (query) => {
  const notes = loadNotes();

  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
  );
};


// filter notes by tag
export const filterByTag = (tag) => {
  const notes = loadNotes();

  return notes.filter((note) => note.tags.includes(tag));
};

// get all notes
export const getAllNotes = () => {
  return loadNotes();
};

// get archived notes
export const getArchivedNotes = () => {
  const notes = loadNotes();
  return notes.filter((note) => note.isArchived === true);
};

// get unarchived notes
export const getUnarchivedNotes = () => {
  const notes = loadNotes();
  return notes.filter((note) => !note.isArchived);
};


// get note by id
export const getNoteById = (id) => {
  const notes = loadNotes();
  return notes.find((note) => note.id === id);
};



/**
 * Filter notes by category
 */
export const filterByCategory = (categoryId) => {
  const notes = loadNotes();
  if (!categoryId) return notes;
  return notes.filter((note) => note.categoryId === categoryId);
};

/**
 * Assign category to note
 */
export const assignCategoryToNote = (noteId, categoryId) => {
  const notes = loadNotes();
  const note = notes.find((note) => note.id === noteId);
  
  if (!note) return false;
  
  note.categoryId = categoryId;
  note.lastEdited = new Date();
  saveNotes(notes);
  
  // Update category note count
  if (categoryId) {
    import('./categoryManager.js').then(({ updateCategoryNoteCount }) => {
      updateCategoryNoteCount(categoryId);
    });
  }
  
  return note;
};

/**
 * Get notes by category
 */
export const getNotesByCategory = (categoryId) => {
  const notes = loadNotes();
  return notes.filter((note) => note.categoryId === categoryId);
};
