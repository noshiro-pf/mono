import { createRoot } from 'react-dom/client';
import { App } from './app.js';
import './style.css';

const container = document.querySelector('#root');

// `web_accessible_resources` lets the pages it names frame `split.html` as
// well as open it, and a split view in someone else's frame would be that
// page showing other sites with their refusal to be framed taken away. So a
// framed split view draws nothing.
//
// `Object.is` rather than `!==`: under the strict standard library
// `typeof globalThis` lacks the window's own members, so TypeScript takes it and
// `window.top` for types that cannot be the same object, which at run time
// they are.
if (!Object.is(window.top, globalThis)) {
  console.warn('Split View does not run inside a frame.');
} else if (container !== null) {
  const root = createRoot(container);

  root.render(<App />);
} else {
  throw new Error('Could not find root element');
}
