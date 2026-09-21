import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app.js';
import './index.css';

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find the root element');
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
