import { createRoot } from 'react-dom/client';
import { App } from './app.js';
import './style.css';

const container = document.querySelector('#root');

// Destructured for the reason `history` is in `frame-agent.mts`.
const { top: topWindow, self: thisWindow } = globalThis;

// `web_accessible_resources` lets the pages it names frame `split.html` as
// well as open it, and a split view in someone else's frame would be that
// page showing other sites with their refusal to be framed taken away. So a
// framed split view draws nothing.
if (topWindow !== thisWindow) {
  console.warn('Split View does not run inside a frame.');
} else if (container !== null) {
  const root = createRoot(container);

  root.render(<App />);
} else {
  throw new Error('Could not find root element');
}
