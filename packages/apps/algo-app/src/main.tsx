import { setup } from '@noshiro/goober';
import { h, render } from 'preact';
import { Root } from './components';
import './index.css';

setup(h);

const root = document.querySelector('#app');
if (root !== null) {
  render(<Root />, root);
}
