import { render } from 'preact';
import { App } from './app.js';
import './index.css';
import { startStore } from './store/index.mjs';

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find the root element');
}

startStore();

render(<App />, container);
