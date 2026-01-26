import { getNoteById } from './noteManager.js';

/**
 * Build a unique share URL for a note id.
 * (Works wherever the note exists in localStorage on that browser.)
 */
export function createShareLink(noteId) {
  const url = new URL(window.location.href);
  url.searchParams.set('sharedNote', noteId);
  return url.toString();
}

/**
 * Read shared note id from URL and return the note (or null).
 */
export function getSharedNoteFromUrl() {
  const url = new URL(window.location.href);
  const id = url.searchParams.get('sharedNote');
  if (!id) return null;
  return getNoteById(id) || null;
}

/**
 * Copy text to clipboard (with fallback).
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers / non-HTTPS
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}