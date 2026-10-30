import { createRoot } from 'react-dom/client';
import { App } from './app.js';
import './index.css';
import { startStore } from './store/index.mjs';

startStore();

const container = document.querySelector('#root');

if (container !== null) {
  const root = createRoot(container);

  root.render(<App />);
} else {
  throw new Error('Could not find root element');
}
