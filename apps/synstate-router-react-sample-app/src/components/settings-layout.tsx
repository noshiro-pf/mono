import * as React from 'react';
import type { BranchIds } from 'synstate-router';
import type { PageCases } from 'synstate-router-react';
import { routes, Routes, type Routes as AppRoutes } from '../routes.mjs';
import { NavLink } from './nav-link.js';
import { NotificationsTab } from './notifications-tab.js';
import { ProfileTab } from './profile-tab.js';

/**
 * Stays mounted while the page moves between the tabs: only the content below
 * is drawn again.
 */
export const SettingsLayout = React.memo(() => (
  <section>
    <h1>{'Settings'}</h1>
    <label>
      {'Note '}
      {/* Uncontrolled: what is typed here survives a move between the tabs,
          because the layout is not drawn again. */}
      <input data-e2e={'settings-note'} />
    </label>
    <nav aria-label={'Settings'}>
      <NavLink
        node={routes.settings.profile}
        to={routes.settings.profile.href()}
      >
        {'Profile'}
      </NavLink>
      <NavLink
        node={routes.settings.notifications}
        to={routes.settings.notifications.href()}
      >
        {'Notifications'}
      </NavLink>
    </nav>
    <Routes cases={tabs} under={routes.settings} />
  </section>
));

SettingsLayout.displayName = 'SettingsLayout';

const tabs: PageCases<
  AppRoutes,
  BranchIds<AppRoutes, typeof routes.settings>
> = {
  // Redirected to the profile tab before it is drawn.
  settings: undefined,
  'settings.profile': () => <ProfileTab />,
  'settings.notifications': () => <NotificationsTab />,
} as const;
