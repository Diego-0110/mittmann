# MITTMANN

Chromium-based browser extension to capture responses from a web page and download the content as a file.

> Note: this extension doesn't work in other browsers due to compatibility problems with the Manifest V3.

## Features

- Capture and save response's content and basic additional data.
- Download caught responses' content as files (.js, .txt, .png, ...).
- Filter by MIME type the responses to capture.
- Local database: IndexedDB is used to save the responses.
- Persistent state: responses are reloaded from IndexedDB and are only removed if the user explicitly does it.
- Preview images and text files without download them.

## Installation

```
npm i
npm run build
```
Then `Load unpacked` the root directory in your cromium-based browser.

> For development, use `npm run build-watch`.
