import { constant, type JSX } from 'synstate-dom';
import { Link, routes } from '../routes.mjs';

export const NotFoundPage = (): JSX.Element => (
  <section>
    <h1>{constant('Not found')}</h1>
    <p>
      <Link to={routes.home.href()}>{constant('Back to home')}</Link>
    </p>
  </section>
);
