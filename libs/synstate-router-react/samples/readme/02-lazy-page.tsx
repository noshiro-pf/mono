import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
} from 'synstate-router';
import { createReactRouter, type PageCases } from 'synstate-router-react';

if (import.meta.vitest !== undefined) {
  test('README: a page loaded with React.lazy', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      home: { segment: '' },
      reports: {},
    });

    const router = createRouter(routes, {
      browser: createMemoryBrowser('https://example.com/reports/'),
    });

    const { Routes } = createReactRouter(router);

    // In an application: `React.lazy(() => import('./reports-page.js'))`, which
    // the bundler splits into a chunk of its own.
    const ReportsPage = React.lazy(
      async () =>
        new Promise<Readonly<{ default: () => React.JSX.Element }>>(() => {
          // Never settles here, so that the fallback is what is drawn.
        }),
    );

    const pages: PageCases<typeof routes, 'home' | 'reports'> = {
      home: () => <h1>{'Home'}</h1>,
      // The case itself is the `Suspense` boundary: the layouts around `Routes`
      // stay drawn while the page loads.
      reports: () => (
        <React.Suspense fallback={<p>{'Loading…'}</p>}>
          <ReportsPage />
        </React.Suspense>
      ),
    } as const;

    assert.strictEqual(
      renderToStaticMarkup(<Routes cases={pages} />),
      '<p>Loading…</p>',
    );

    // embed-sample-code-ignore-below
  });
}
