import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app.js';
import './index.css';
import { applyTheme, themeFromLocation } from './theme.mjs';

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find the root element');
}

// Before the first render rather than in the button's effect alone, so that
// a page opened with `?theme=` never draws a frame of the other one. An inline
// script in `<head>` would be earlier still, and `script-src 'self'` refuses it.
applyTheme(themeFromLocation());

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
