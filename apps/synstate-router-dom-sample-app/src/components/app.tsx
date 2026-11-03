import { constant, type JSX } from 'synstate-dom';
import { routes, Routes } from '../routes.mjs';
import { HomePage } from './home-page.js';
import { NavLink } from './nav-link.js';
import { NotFoundPage } from './not-found-page.js';
import { ProductsSection } from './products-section.js';
import { SettingsLayout } from './settings-layout.js';

export const App = (): JSX.Element => (
  <>
    <header>
      <nav aria-label={constant('Main')}>
        <NavLink exact node={routes.home} to={routes.home.href()}>
          {constant('Home')}
        </NavLink>
        <NavLink node={routes.products} to={routes.products.href()}>
          {constant('Products')}
        </NavLink>
        <NavLink node={routes.settings} to={routes.settings.href()}>
          {constant('Settings')}
        </NavLink>
      </nav>
    </header>
    <main>
      {/* One case per top-level node: the layout of each section. A component
          runs once, so the cases can be written in place. */}
      <Routes
        prefix
        cases={{
          home: () => <HomePage />,
          products: () => <ProductsSection />,
          settings: () => <SettingsLayout />,
        }}
        notFound={<NotFoundPage />}
      />
    </main>
  </>
);
