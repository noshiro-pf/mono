import { createRoot } from 'react-dom/client';
import { App } from './app';

const root = document.querySelector('#root');

if (root !== null) {
  createRoot(root).render(<App />);
}
