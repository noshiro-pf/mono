import { setup } from 'goober';
import { h, render } from 'preact';
import { Root } from './components/index.mjs';
import './index.css';
import { startStore } from './store/index.mjs';

setup(h);

startStore();

const root = document.querySelector('#app');

if (root !== null) {
  render(<Root />, root);
}
