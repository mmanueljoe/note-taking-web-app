

export const renderNote = (note) => {
  const noteElement = document.createElement('div');
  noteElement.classList.add('note');

  noteElement.innerHTML = `
    <div class="note-header">
      <h3 class="note-title">${note.title}</h3>
      <div class="note-tags">
        ${note.tags.map((tag) => `<span class="note-tag">${tag}</span>`).join('')}
      </div>
    </div>
    <div class="note-content">
      <p class="note-content-text">${note.content}</p>
    </div>
  `;

};
export const renderAllNotes = (notes) => {
  return notes;
};
export const showValidationError = (field, message) => {
  return field, message;
};
export const updateTagList = (tags) => {
  return tags;
};
export const toggleArchiveView = () => {};
