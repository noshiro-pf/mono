import { render } from 'synstate-dom';
import { App } from './app.js';
import './index.css';

const root = document.querySelector('#root');

if (root === null) {
  throw new Error('Could not find the #root element');
}

render(App, root);
