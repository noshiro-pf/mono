import { constant, type JSX } from 'synstate-dom';
import { externalHref } from 'synstate-router';
import { asSafeInt } from 'ts-data-forge';
import { Link, routes } from '../routes.mjs';

export const HomePage = (): JSX.Element => (
  <section>
    <h1>{constant('Home')}</h1>
    <p>
      {constant('Every link here is an ')}
      <code>{constant('Href')}</code>
      {constant(
        ' made by a route node, so a link to a page that does not exist fails ',
      )}
      <code>{constant('tsc')}</code>
      {constant('.')}
    </p>
    <ul>
      <li>
        <Link
          data-e2e={constant('cheap-first')}
          to={routes.products.href({ search: { sort: 'price' } })}
        >
          {constant('Products, cheapest first')}
        </Link>
      </li>
      <li>
        <Link to={routes.products.item.href({ productId: asSafeInt(3) })}>
          {constant('Cherry')}
        </Link>
      </li>
      <li>
        <Link
          to={routes.products.item.href(
            { productId: asSafeInt(3) },
            { hash: 'reviews' },
          )}
        >
          {constant('Reviews of Cherry')}
        </Link>
      </li>
      <li>
        <Link
          to={externalHref(
            'https://github.com/noshiro-pf/mono/tree/main/libs/synstate-router',
          )}
        >
          {constant('synstate-router on GitHub')}
        </Link>
      </li>
    </ul>
  </section>
);
