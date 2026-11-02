import { render } from 'synstate-dom';
import { App } from './components/index.mjs';
import './index.css';

const root = document.querySelector('#root');

if (root === null) {
  throw new Error('Could not find root element');
}

render(App, root);
