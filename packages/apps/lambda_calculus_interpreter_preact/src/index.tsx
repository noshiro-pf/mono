import { setup } from 'goober';
import { h, render } from 'preact';
import { Main } from './components';
import './index.css';

setup(h);

const root = document.getElementById('root');
if (root !== null) {
  render(<Main />, root);
}
