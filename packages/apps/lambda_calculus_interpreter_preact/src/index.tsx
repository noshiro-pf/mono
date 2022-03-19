import { setup } from '@noshiro/goober';
import { h, render } from 'preact';
import { Main } from './components';
import './index.css';

setup(h);

const root = document.querySelector('#root');
if (root !== null) {
  render(<Main />, root);
}
