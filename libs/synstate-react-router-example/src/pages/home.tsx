import * as React from 'react';
import { Link } from 'synstate-react-router';
import { router, routes } from '../routes';

export const Home = React.memo(() => (
  <div>
    <h2>{'Home'}</h2>
    <p>{'Welcome to the synstate-react-router example app.'}</p>
    <nav>
      <ul>
        <li>
          <Link router={router} to={routes.products.path()}>
            {'Products'}
          </Link>
        </li>
        <li>
          <Link router={router} to={routes.users.path()}>
            {'Users'}
          </Link>
        </li>
        <li>
          <Link router={router} to={routes.settings.path()}>
            {'Settings'}
          </Link>
        </li>
      </ul>
    </nav>
  </div>
));

Home.displayName = 'Home';
