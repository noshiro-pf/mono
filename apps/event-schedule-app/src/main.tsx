// organize-imports-ignore -- Blueprint's style sheet goes in first, so that
// the components' CSS Modules override it where they tie, as their emotion
// styles, inserted after it, did.
import './index.css';
// eslint-disable-next-line import-x/first -- the order above is the cascade
import { render } from 'synstate-dom';
import { App } from './app.js';
import { startStore } from './store/index.mjs';

startStore();

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find root element');
}

render(App, container);
