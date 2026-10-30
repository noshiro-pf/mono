import { render } from 'synstate-dom';
import { App } from './app.js';
import './index.css';

const root = document.querySelector('#app');

if (root !== null) {
  render(App, root);
}
