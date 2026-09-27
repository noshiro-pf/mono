import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app.js';
import './index.css';
import { startStore } from './store/index.mjs';

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find the root element');
}

startStore();

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
