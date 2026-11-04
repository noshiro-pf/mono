import { createRoot } from 'react-dom/client';
import { App } from './components/index.mjs';
import './index.css';

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find root element');
}

createRoot(container).render(<App />);
