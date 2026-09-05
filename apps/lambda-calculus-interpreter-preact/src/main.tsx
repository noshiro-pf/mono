import { setup } from 'goober';
import { h, render } from 'preact';
import { App } from './components/index.mjs';
import './index.css';

// goober needs to be told which pragma to build elements with; for Preact that
// is `h`. `@noshiro/goober` in the pre-restoration tree was a directory holding
// a copy of the library, so this imports the real package instead, as the
// inventory says to.
setup(h);

const root = document.querySelector('#app');

if (root !== null) {
  render(<App />, root);
}
