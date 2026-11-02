import * as React from 'react';
import { Link, routes } from '../routes.mjs';

export const NotFoundPage = React.memo(() => (
  <section>
    <h1>{'Not found'}</h1>
    <p>
      <Link to={routes.home.href()}>{'Back to home'}</Link>
    </p>
  </section>
));

NotFoundPage.displayName = 'NotFoundPage';
