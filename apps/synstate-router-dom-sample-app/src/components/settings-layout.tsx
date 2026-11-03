import { constant, type JSX } from 'synstate-dom';
import { routes, Routes } from '../routes.mjs';
import { NavLink } from './nav-link.js';

/**
 * Stays mounted while the page moves between the tabs: only the content below
 * is drawn again.
 */
export const SettingsLayout = (): JSX.Element => (
  <section>
    <h1>{constant('Settings')}</h1>
    <label>
      {constant('Note ')}
      {/* Uncontrolled: what is typed here survives a move between the tabs,
          because the layout is not drawn again. */}
      <input data-e2e={constant('settings-note')} />
    </label>
    <nav aria-label={constant('Settings')}>
      <NavLink
        node={routes.settings.profile}
        to={routes.settings.profile.href()}
      >
        {constant('Profile')}
      </NavLink>
      <NavLink
        node={routes.settings.notifications}
        to={routes.settings.notifications.href()}
      >
        {constant('Notifications')}
      </NavLink>
    </nav>
    <Routes
      under={routes.settings}
      cases={{
        // Redirected to the profile tab before it is drawn.
        settings: undefined,
        'settings.profile': () => (
          <label data-e2e={constant('profile-tab')}>
            {constant('Name ')}
            <input />
          </label>
        ),
        'settings.notifications': () => (
          <label data-e2e={constant('notifications-tab')}>
            <input type={constant('checkbox')} />
            {constant(' Email me')}
          </label>
        ),
      }}
    />
  </section>
);
