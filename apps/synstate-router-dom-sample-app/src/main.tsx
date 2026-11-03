import { render } from 'synstate-dom';
import { App } from './components/index.mjs';
import './index.css';

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find root element');
}

render(App, container);
