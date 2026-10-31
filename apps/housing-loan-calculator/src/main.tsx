import { render } from 'synstate-dom';
import { App } from './app.js';
import './index.css';

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find root element');
}

render(App, container);
