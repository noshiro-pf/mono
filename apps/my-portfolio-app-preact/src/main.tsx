import { setup } from 'goober';
import { h, render } from 'preact';
import { App } from './app.js';
import './index.css';

setup(h);

const root = document.querySelector('#app');

if (root !== null) {
  render(<App />, root);
}
