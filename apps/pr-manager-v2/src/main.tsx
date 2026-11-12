import { render } from 'synstate-dom';
import {
  repoFromSearch,
  repoParam,
  searchWithRepo,
  type Repo,
} from './domain/index.mjs';
import { browserAppDeps, createAppStore } from './store/index.mjs';
import { App, StartPage } from './ui/index.mjs';

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find the root element');
}

/**
 * Another repository is another visit (spec §2), carrying the rest of the query
 * string along — read from the address bar, so the page's own settings must be
 * written there first.
 */
const go = (next: Repo): void => {
  const { pathname, search, hash } = globalThis.location;

  globalThis.location.assign(
    `${pathname}${searchWithRepo(search, next)}${hash}`,
  );
};

const repo = repoFromSearch(globalThis.location.search);

if (repo === undefined) {
  render(
    () => <StartPage go={go} invalid={repoParam(globalThis.location.search)} />,
    container,
  );
} else {
  const app = createAppStore(browserAppDeps(repo));

  app.start();

  render(
    () => (
      <App
        app={app}
        go={(other) => {
          // The URL is written a moment after each change; write it now.
          app.url.flush();

          go(other);
        }}
      />
    ),
    container,
  );
}
