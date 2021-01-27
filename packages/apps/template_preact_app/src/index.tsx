import { render } from 'preact';
import { App } from './App';
import './index.css';

const root = document.getElementById('root');
if (root !== null) {
  render(<App />, root);
}
