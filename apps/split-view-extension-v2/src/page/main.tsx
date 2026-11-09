import { render } from 'synstate-dom';
import { App } from './components/index.mjs';
import './style.css';

const container = document.querySelector('#root');

// A page listed in `web_accessible_resources` may frame `split.html`, and a
// framed split view would be that page showing other sites with their refusal
// to be framed taken away (spec U5). `Object.is`: under the strict standard
// library `window.top` and `globalThis` have types that cannot be equal.
if (!Object.is(window.top, globalThis)) {
  console.warn('Split View does not run inside a frame.');
} else if (container === null) {
  throw new Error('Could not find root element');
} else {
  render(App, container);
}
