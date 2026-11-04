import * as React from 'react';
import type { PrefixCases } from 'synstate-router-react';
import { routes, Routes, type Routes as AppRoutes } from '../routes.mjs';
import { HomePage } from './home-page.js';
import { NavLink } from './nav-link.js';
import { NotFoundPage } from './not-found-page.js';
import { ProductsSection } from './products-section.js';
import { SettingsLayout } from './settings-layout.js';

export const App = React.memo(() => (
  <>
    <header>
      <nav aria-label={'Main'}>
        <NavLink exact node={routes.home} to={routes.home.href()}>
          {'Home'}
        </NavLink>
        <NavLink node={routes.products} to={routes.products.href()}>
          {'Products'}
        </NavLink>
        <NavLink node={routes.settings} to={routes.settings.href()}>
          {'Settings'}
        </NavLink>
      </nav>
    </header>
    <main>
      <Routes cases={sections} notFound={notFound} prefix />
    </main>
  </>
));

App.displayName = 'App';

/**
 * One case per top-level node: the layout of each section. Written once, at the
 * module's top level, so that `Routes` gets the same object every render.
 */
const sections: PrefixCases<AppRoutes> = {
  home: () => <HomePage />,
  products: () => <ProductsSection />,
  settings: () => <SettingsLayout />,
} as const;

const notFound = <NotFoundPage />;
