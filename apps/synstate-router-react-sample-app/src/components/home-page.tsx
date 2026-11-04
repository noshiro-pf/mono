import * as React from 'react';
import { externalHref } from 'synstate-router';
import { asSafeInt } from 'ts-data-forge';
import { Link, routes } from '../routes.mjs';

export const HomePage = React.memo(() => (
  <section>
    <h1>{'Home'}</h1>
    <p>
      {'Every link here is an '}
      <code>{'Href'}</code>
      {' made by a route node, so a link to a page that does not exist fails '}
      <code>{'tsc'}</code>
      {'.'}
    </p>
    <ul>
      <li>
        <Link
          data-e2e={'cheap-first'}
          to={routes.products.href({ search: { sort: 'price' } })}
        >
          {'Products, cheapest first'}
        </Link>
      </li>
      <li>
        <Link to={routes.products.item.href({ productId: asSafeInt(3) })}>
          {'Cherry'}
        </Link>
      </li>
      <li>
        <Link
          to={routes.products.item.href(
            { productId: asSafeInt(3) },
            { hash: 'reviews' },
          )}
        >
          {'Reviews of Cherry'}
        </Link>
      </li>
      <li>
        <Link
          to={externalHref(
            'https://github.com/noshiro-pf/mono/tree/main/libs/synstate-router',
          )}
        >
          {'synstate-router on GitHub'}
        </Link>
      </li>
    </ul>
  </section>
));

HomePage.displayName = 'HomePage';
