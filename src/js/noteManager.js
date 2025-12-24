export class Note {
  constructor(title, content, tags) {
    this.title = title;
    this.content = content;
    this.tags = tags;
    this.lastEdited = new Date();
    this.isArchived = false;
  }

  archive() {}

  addTag(tag) {
    this.tags.push(tag);
  }
}

export const createNote = (title, content, tags) => {
  return title, content, tags;
};

export const deleteNote = (id) => {
  return id;
};

export const updateNote = (id, updates) => {
  return updates;
};

export const searchNotes = (query) => {
  return query;
};

export const filterByTag = (tag) => {
  return tag;
};
