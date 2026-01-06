# Note-taking web app 

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshots](#screenshots)
  - [Links](#links)
- [My process](#my-process)
  - [Features implemented](#features-implemented)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
- [Project structure](#project-structure)
- [Running the project locally](#running-the-project-locally)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

---

## Overview

### The challenge

Users should be able to:

- Create, read, update, and delete notes
- Archive and restore notes
- View all notes or only archived notes
- Filter notes by tags
- Search notes by title, tags, and content
- Select a color theme (light / dark / system)
- Select a font theme (sans, serif, monospace)
- Receive validation messages if required form fields aren't completed
- Navigate the app and perform actions using only the keyboard
- View an adaptive layout across mobile, tablet, and desktop
- See hover and focus states for interactive elements
- Create an account, log in, and protect the main app behind auth
- Persist data using `localStorage`
- Rich text formatting for note content (bold, italic, underline, lists)
- Export/import notes as JSON
- Generate shareable links with a read‑only view

### Screenshots


- Main app – desktop  


- Mobile layout – notes list and detail view  


- Auth screens (login / signup)  


### Links

- Solution URL: [Add solution URL here](https://github.com/mmanueljoe/note-taking-web-app)
- Live Site URL: [Add live site URL here](https://note-taking-web-app-re7t.vercel.app/)

---

## My process

### Features implemented

Some of the key pieces of functionality:

- **Notes CRUD**
  - Create new notes with title, tags, content, and optional location
  - Edit existing notes in a detail view
  - Delete notes with a confirmation modal

- **Archive system**
  - Archive/unarchive notes
  - Dedicated “Archived Notes” view
  - Clear visual status indicators

- **Tags & filtering**
  - Tags extracted from notes and rendered as a tags menu
  - Filter notes by a specific tag
  - Separate desktop tags sidebar and mobile tags menu

- **Search**
  - Desktop search bar with debounced results
  - Mobile search view with its own UI
  - Search across title, content, and tags

- **Theming**
  - Light / dark / system theme options
  - Font family choices (sans / serif / monospace)
  - Preferences persisted in `localStorage`

- **Rich text editor**
  - Custom lightweight rich‑text area for note content
  - Bold, italic, underline, bullet lists, numbered lists
  - HTML content sanitized before saving
  - Previews use plain text while the detail view renders formatted HTML

- **Export / import**
  - Export all notes as a JSON file (with simple metadata)
  - Import notes from JSON with basic validation
  - Duplicate detection and options to skip/overwrite

- **Shareable links**
  - Generate a share URL containing the note ID as a query param
  - Read‑only shared note view, separate from the editable UI
  - Copy‑to‑clipboard support with a fallback

- **Auth flow (front‑end)**
  - Basic signup / login pages
  - Simple front‑end “auth” using `localStorage`
  - Redirect to login if unauthenticated

- **Accessibility & keyboard**
  - Focus states and keyboard navigation in the notes list
  - Escape to close detail views
  - Dialog modals with focus trapping for destructive actions

### Built with

- **HTML5** for structure and semantic markup
- **CSS3** with:
  - Custom properties (CSS variables)
  - Flexbox and CSS Grid for layout
  - Responsive design (mobile‑first, tablet, desktop breakpoints)
  - Separate styles for main app and settings/auth screens
- **Vanilla JavaScript (ES Modules)**
  - Modular files in `src/js` (`main.js`, `ui.js`, `noteManager.js`, `storage.js`, etc.)
  - `localStorage` for persistence
  - Custom event system (using `CustomEvent`) to decouple UI and logic
- **No frameworks** – everything is done with plain JS and browser APIs

### What I learned

A few highlights from working on this project:

- **Modular JavaScript in a non‑framework app**  
  Splitting responsibilities across modules (`noteManager`, `storage`, `ui`, `auth`, `theme`, etc.) made the codebase much easier to reason about. It’s closer to how I’d structure a small front‑end app in production even without a framework.

- **Balancing rich‑text HTML with safety**  
  Allowing formatted content (bold, lists, etc.) means storing HTML, which raises sanitization concerns. I implemented a very small “allow‑list” sanitizer that only keeps specific tags and attributes, which is enough for this challenge but still avoids raw `innerHTML` everywhere.

- **State vs. DOM**  
  The app relies heavily on the DOM as a “view” over an underlying notes state in `localStorage`. Handling things like mobile vs. desktop layouts, empty states, and sync between the list and detail views was a good exercise in thinking about where state should live and when to re‑render.

- **Keyboard and accessibility details**  
  Implementing arrow‑key navigation on the notes list, accessible modals, and meaningful focus management took more effort than the visuals, but it improved the overall feel of the app a lot.

If I revisit this again, I’d probably extract even more shared logic out of `main.js` and `ui.js` and make the event flow even clearer.

### Continued development

Some ideas I’d like to explore or improve in future projects:

- Extracting the rich‑text editor into a standalone, reusable component
- Moving from `localStorage` to a real backend API so that sharing links work across devices and users
- Adding more robust form validation and error flows for auth
- Improving test coverage (e.g. unit tests for the note manager and storage helpers)
- Exploring a progressive enhancement version of this app with server‑rendered HTML plus client‑side enhancements

### Useful resources

- [MDN Web Docs](https://developer.mozilla.org/) – Reference for `localStorage`, `CustomEvent`, and HTML contenteditable.
- [The Markdown Guide](https://www.markdownguide.org/) – Helpful for structuring this README.

---

## Project structure

A quick overview of how the project is organized:

note-taking-web-app/
├── src/
│   ├── index.html
│   ├── settings.html
│   ├── auth/
│   │   ├── login.html
│   │   ├── signup.html
│   │   ├── forgot-password.html
│   │   └── reset-password.html
│   ├── css/
│   │   ├── styles.css
│   │   ├── settings.css
│   │   └── auth.css
│   ├── js/
│   │   ├── main.js
│   │   ├── ui.js
│   │   ├── noteManager.js
│   │   ├── storage.js
│   │   ├── theme.js
│   │   ├── settings.js
│   │   ├── auth.js
│   │   ├── auth-handlers.js
│   │   ├── richText.js
│   │   ├── share.js
│   │   └── utils.js
│   ├── assets/
│   │   ├── images/
│   │   └── fonts/
│   └── data.json   (seed data / example notes)
├── GIT_WORKFLOW.md
├── README.md
└── package.json---

## Running the project locally

1. **Clone the repo**

   ```bash
   git clone https://github.com/mmanueljoe/note-taking-web-app.git
   cd note-taking-web-app
   ``
2. **Install dependencies (if you use any tooling / dev server)**

   ```bash
   yarn install
   ```
   3. **Start a local server (or install the live server extension in vscode or your preferred editor)**

   ```bash
   live-server src
   ```
4. **Log in / sign up**

   - Go to the `/auth` pages (e.g. `src/auth/login.html`)
   - Create a “fake” account (stored in `localStorage`)
   - After logging in, you’ll be redirected to the main app.

---

## Author

- Twitter – [@mmanueljoe](https://www.twitter.com/mmanueljoe)

---

## Acknowledgments

If you found a better way to structure the state or UI for this challenge, I’d be interested in seeing alternative approaches.