import { constant, listenInScope, Switch, type JSX } from 'synstate-dom-next';
import { createState } from 'synstate-next';
import type { ReadonlyRecord } from 'ts-type-forge';

// A hash router is a component: `Switch` keeps a page mounted while its path
// stays, and `listenInScope` stops listening when the router is unmounted.
export const HashRouter = ({
  pages,
  notFound,
}: Readonly<{
  pages: ReadonlyRecord<string, () => JSX.Element>;
  notFound: JSX.Element;
}>): JSX.Element => {
  const [path$, setPath] = createState(location.hash.slice(1));

  listenInScope(globalThis, 'hashchange', () => {
    setPath(location.hash.slice(1));
  });

  return (
    <Switch value={path$} key={(path) => path}>
      {(path) => pages[path]?.() ?? notFound}
    </Switch>
  );
};

export const App = (): JSX.Element => (
  <HashRouter
    pages={{
      '': () => <p>{constant('Home')}</p>,
      about: () => <p>{constant('About')}</p>,
    }}
    notFound={<p>{constant('Not found')}</p>}
  />
);
