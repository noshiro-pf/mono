import * as React from 'react';
import { Link } from 'synstate-react-router';
import { router, routes } from '../routes';

export const NotFound = React.memo(() => (
  <div>
    <h2>{'404 — Not Found'}</h2>
    <p>{'The page you are looking for does not exist.'}</p>
    <p>
      <Link router={router} to={routes.home.path()}>
        {'← Go to Home'}
      </Link>
    </p>
  </div>
));

NotFound.displayName = 'NotFound';
