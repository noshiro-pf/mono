import { render } from 'synstate-dom';
import { reportSourceFromSearch, repositoryParam } from './constants.mjs';
import './index.css';
import { applyTheme, themeFromLocation } from './theme.mjs';
import { currentSearch } from './url.mjs';

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find the root element');
}

// The report and its store are loaded only once the URL names a repository:
// the store reads that repository as it is made, and without one the page asks
// which to read (`StartPage`).
if (reportSourceFromSearch(currentSearch()) === undefined) {
  const { StartPage } = await import('./start/index.mjs');

  applyTheme(themeFromLocation());

  render(
    () => <StartPage invalid={repositoryParam(currentSearch())} />,
    container,
  );
} else {
  const [{ App }, { startStore }] = await Promise.all([
    import('./app.js'),
    import('./store/index.mjs'),
  ]);

  startStore();

  render(App, container);
}
