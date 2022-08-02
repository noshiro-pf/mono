import { setup } from '@noshiro/goober';
import { h, render } from 'preact';
import './index.css';
import { Main } from './main';

setup(h);

const root = document.querySelector('#root');
if (root !== null) {
  render(<Main />, root);
}
