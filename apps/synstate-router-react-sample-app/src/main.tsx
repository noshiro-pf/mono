import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/index.mjs';
import './index.css';
import { router } from './routes.mjs';

const container = document.querySelector('#root');

if (container === null) {
  throw new Error('Could not find root element');
}

/**
 * The router's devtools panel, in development only: `import.meta.env.DEV` is
 * `false` in a production build, so the bundler drops the branch and the
 * `import()` with it.
 */
const Devtools = import.meta.env.DEV
  ? React.lazy(async () => {
      const { RouterDevtools } = await import('synstate-router-react');

      return {
        default: () => <RouterDevtools router={router} />,
      };
    })
  : undefined;

createRoot(container).render(
  <>
    <App />
    {Devtools === undefined ? undefined : (
      <React.Suspense>
        <Devtools />
      </React.Suspense>
    )}
  </>,
);
