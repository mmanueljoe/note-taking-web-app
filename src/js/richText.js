// src/js/richText.js
const ALLOWED_TAGS = ['b','strong','i','em','u','ul','ol','li','p','br','div','span'];
const ALLOWED_ATTRS = ['style']; // keep minimal; you can strip style if you prefer

export function sanitizeHtml(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const walk = (node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (!ALLOWED_TAGS.includes(node.tagName.toLowerCase())) {
        node.replaceWith(...Array.from(node.childNodes));
        return;
      }
      [...node.attributes].forEach(attr => {
        if (!ALLOWED_ATTRS.includes(attr.name.toLowerCase())) {
          node.removeAttribute(attr.name);
        }
      });
    }
    [...node.childNodes].forEach(walk);
  };
  walk(temp);
  return temp.innerHTML;
}

export function initRichTextEditor(wrapperEl, { placeholder = 'Start typing...' } = {}) {
  wrapperEl.innerHTML = `
    <div class="rte-toolbar">
      <button type="button" data-cmd="bold"><b>B</b></button>
      <button type="button" data-cmd="italic"><i>I</i></button>
      <button type="button" data-cmd="underline"><u>U</u></button>
      <button type="button" data-cmd="insertUnorderedList">• List</button>
      <button type="button" data-cmd="insertOrderedList">1. List</button>
    </div>
    <div class="rte-editor" contenteditable="true" data-placeholder="${placeholder}"></div>
  `;

  const editor = wrapperEl.querySelector('.rte-editor');
  const toolbarButtons = wrapperEl.querySelectorAll('[data-cmd]');
  toolbarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      document.execCommand(cmd, false);
      editor.focus();
    });
  });

  const getHTML = () => sanitizeHtml(editor.innerHTML || '');
  const setHTML = (html) => { editor.innerHTML = sanitizeHtml(html || ''); };
  const getPlainText = () => editor.textContent || '';

  return { editor, getHTML, setHTML, getPlainText };
}