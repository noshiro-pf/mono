import { setup } from '@noshiro/goober';
import { h, render } from 'preact';
import { App } from './App';
import './index.css';

setup(h);

const root = document.getElementById('root');
if (root !== null) {
  render(<App />, root);
}
