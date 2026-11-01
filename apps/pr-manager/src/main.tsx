import { render } from 'synstate-dom';
import { reportSourceFromSearch, repositoryParam } from './constants.mjs';
import './index.css';
import { browserStaleBuildDeps, importOrReload } from './stale-build.mjs';
import { applyTheme, themeFromLocation } from './theme.mjs';
import { currentSearch } from './url.mjs';

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find the root element');
}

// The report and its store are loaded only once the URL names a repository:
// the store reads that repository as it is made, and without one the page asks
// which to read (`StartPage`). Either is a chunk of this build, which a page
// opened from the browser's cache may find gone (`stale-build.mts`).
if (reportSourceFromSearch(currentSearch()) === undefined) {
  const start = await importOrReload(
    async () => import('./start/index.mjs'),
    browserStaleBuildDeps(),
  );

  if (start !== undefined) {
    applyTheme(themeFromLocation());

    render(
      () => <start.StartPage invalid={repositoryParam(currentSearch())} />,
      container,
    );
  }
} else {
  const loaded = await importOrReload(
    async () => Promise.all([import('./app.js'), import('./store/index.mjs')]),
    browserStaleBuildDeps(),
  );

  if (loaded !== undefined) {
    const [{ App }, { startStore }] = loaded;

    startStore();

    render(App, container);
  }
}
