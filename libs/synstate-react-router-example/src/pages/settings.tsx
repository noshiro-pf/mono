import * as React from 'react';
import { Link } from 'synstate-react-router';
import { router, routes } from '../routes';

export const Settings = React.memo(() => (
  <div>
    <h2>{'Settings'}</h2>
    <p>{'Application settings page.'}</p>
    <p>
      <Link router={router} to={routes.home.path()}>
        {'← Back to Home'}
      </Link>
    </p>
  </div>
));

Settings.displayName = 'Settings';
