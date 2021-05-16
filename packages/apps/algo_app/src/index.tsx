import { setup } from '@noshiro/goober';
import { h, render } from 'preact';
import './index.css';
import { Root } from './root';

setup(h);

const root = document.getElementById('root');
if (root !== null) {
  render(<Root />, root);
}
