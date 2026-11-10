import { render } from 'synstate-dom';
import {
  App,
  browserAppDeps,
  createAppStore,
  repoFromSearch,
  searchWithRepo,
  TOKEN_KEY,
} from '../../src/index.mjs';
import { memoryStore } from '../memory-store.mjs';
import { demoActivity, demoRead } from './demo-report.mjs';

/**
 * The page over made-up data, for trying it and for screenshots where GitHub
 * cannot be reached: the dev server serves it at `demo.html`; the build leaves
 * it out.
 */
const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find the root element');
}

// The token lives in memory: the real storage may hold the reader's own.
const session = memoryStore();

session.setItem(TOKEN_KEY, 'demo');

const repo = repoFromSearch(globalThis.location.search) ?? {
  owner: 'noshiro-pf',
  name: 'mono',
};

const app = createAppStore({
  ...browserAppDeps(repo),
  tokenStores: { session, device: memoryStore() },
  read: async (_token, nowMs) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(demoRead(nowMs));
      }, 300);
    }),
  readActivity: async (_token, nowMs) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(demoActivity(nowMs));
      }, 300);
    }),
});

app.start();

render(
  () => (
    <App
      app={app}
      go={(other) => {
        app.url.flush();

        globalThis.location.assign(
          `${globalThis.location.pathname}${searchWithRepo(globalThis.location.search, other)}`,
        );
      }}
    />
  ),
  container,
);
