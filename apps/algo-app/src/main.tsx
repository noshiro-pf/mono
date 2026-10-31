import { render } from 'synstate-dom';
import { Root } from './components/index.mjs';
import './index.css';
import { startStore } from './store/index.mjs';

startStore();

const root = document.querySelector('#app');

if (root !== null) {
  render(Root, root);
}
