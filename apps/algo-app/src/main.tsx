import { setup } from 'goober';
import { h, render } from 'preact';
import { Root } from './components/index.mjs';
import './index.css';

setup(h);

const root = document.querySelector('#app');

if (root !== null) {
  render(<Root />, root);
}
