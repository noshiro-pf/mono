import { render } from 'preact';
import { App } from './app.js';
import './index.css';
import { type Backend } from './repository/index.mjs';
import { attachBackend, startStore } from './store/index.mjs';
import { isMemoryStorageRequested } from './view-model/index.mjs';

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find the root element');
}

startStore();

render(<App />, container);

/**
 * The Firebase backend — or, in a development build asked for with
 * `?storage=memory`, the in-memory demo, which needs no sign-in.
 *
 * Both are loaded after the first render, so the page draws before Firebase
 * has loaded. `import.meta.env.DEV` is replaced with `false` in a production
 * build, which makes the demo branch dead code: neither it nor the sample
 * data is in the published bundle.
 */
const loadBackend = async (): Promise<Backend> => {
  if (
    import.meta.env.DEV &&
    isMemoryStorageRequested(document.location.search)
  ) {
    const { createMemoryBackend } = await import('./demo/index.mjs');

    return createMemoryBackend(Date.now());
  }

  const { createFirebaseBackend } = await import('./firebase/index.mjs');

  return createFirebaseBackend();
};

try {
  attachBackend(await loadBackend());
} catch (error: unknown) {
  console.error('Could not start the backend', error);
}
