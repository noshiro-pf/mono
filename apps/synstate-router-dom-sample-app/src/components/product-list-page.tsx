import { derive, map, type InitializedObservable } from 'synstate';
import {
  constant,
  For,
  If,
  mapBindable,
  MatchOptional,
  view,
  type JSX,
} from 'synstate-dom';
import type { Href } from 'synstate-router';
import { Arr } from 'ts-data-forge';
import { AsyncData, Optional } from 'ts-std-forge';
import {
  fetchProductSummaries,
  type ProductSummaryPage,
} from '../api/index.mjs';
import { ariaBusy } from '../aria-busy.mjs';
import { latestRequest } from '../from-request.mjs';
import { asPageNumber, firstPage } from '../page-number.mjs';
import { Link, router, routes, type ProductListValues } from '../routes.mjs';
import { SortLink } from './sort-link.js';

type Props = Readonly<{
  list$: InitializedObservable<ProductListValues>;
}>;

/**
 * Fetches the page of summaries for the query in the URL, and draws it.
 *
 * The request is built here, in the component: a synstate-dom component runs
 * once, when the page is entered, so this graph is built once, and it lives in
 * the page's scope, so leaving the page disposes it and aborts a request still
 * in flight. A new query, on the same page, flows through `list$` and aborts
 * the request it replaces.
 */
export const ProductListPage = ({ list$ }: Props): JSX.Element => {
  // The router keeps an equal search as the same object, and `map` passes on
  // only a new one: a new `#hash` alone fetches nothing.
  const search$ = list$.pipe(map((list) => list.search));

  const data$ = latestRequest(search$, fetchProductSummaries);

  const shown$ = mapBindable(data$, (data) =>
    AsyncData.isOk(data) ? Optional.some(data.value) : Optional.none,
  );

  return (
    <section aria-busy={view(data$, ariaBusy)} data-e2e={constant('products')}>
      <h1>{constant('Products')}</h1>
      <label>
        {constant('Search ')}
        <input
          data-e2e={constant('search')}
          type={constant('search')}
          value={view(search$, (search) => search.q ?? '')}
          onInput={(inputEvent) => {
            searchProducts(inputEvent.currentTarget.value);
          }}
        />
      </label>
      <p>
        {constant('Sort by ')}
        <SortLink list$={list$} sort={'name'} />
        {constant(' · ')}
        <SortLink list$={list$} sort={'price'} />
      </p>
      <If
        cond={view(data$, AsyncData.isPending)}
        then={<p data-e2e={constant('loading')}>{constant('Loading…')}</p>}
      />
      <If
        cond={view(data$, AsyncData.isErr)}
        then={
          <p role={constant('alert')}>
            {constant('Could not load the products.')}
          </p>
        }
      />
      <MatchOptional
        value={shown$}
        some={(page$) => (
          <If
            cond={mapBindable(page$, (page) => Arr.isNonEmpty(page.items))}
            then={
              <ul data-e2e={constant('product-list')}>
                <For
                  items={mapBindable(page$, (page) => page.items)}
                  key={(p) => p.id}
                >
                  {(p$) => (
                    <li>
                      <Link
                        to={view(p$, (p) =>
                          routes.products.item.href({ productId: p.id }),
                        )}
                      >
                        {view(p$, (p) => `${p.name} — ¥${p.price}`)}
                      </Link>
                    </li>
                  )}
                </For>
              </ul>
            }
            else={<p>{constant('No products.')}</p>}
          />
        )}
      />
      <nav aria-label={constant('Pages')}>
        <If
          cond={view(search$, (search) => search.page > 1)}
          then={
            <Link to={derive([list$, data$], previousHref)}>
              {constant('Previous')}
            </Link>
          }
        />
        <span data-e2e={constant('page')}>
          {view(search$, (search) => ` Page ${search.page} `)}
        </span>
        <If
          cond={derive(
            [list$, data$],
            (list, data) =>
              AsyncData.isOk(data) && list.search.page < data.value.lastPage,
          )}
          then={
            <Link
              to={view(list$, (list) =>
                list.withSearch({ page: asPageNumber(list.search.page + 1) }),
              )}
            >
              {constant('Next')}
            </Link>
          }
        />
      </nav>
    </section>
  );
};

/** What typing in the search box does: page 1 of what matches `text`. */
const searchProducts = (text: string): void => {
  // Typing rewrites the entry rather than adding one per key.
  router.setSearch(
    routes.products,
    (prev) => ({
      ...prev,
      q: text === '' ? undefined : text,
      page: firstPage,
    }),
    { replace: true },
  );
};

/**
 * One page back; past the last page, the last one that has products, once the
 * server has said which that is.
 */
const previousHref = (
  list: ProductListValues,
  data: AsyncData<ProductSummaryPage, unknown>,
): Href => {
  // Run on page 1 too: the `If` draws the `Link` only past it, but its `to` is
  // built with the page.
  const back = Math.max(1, list.search.page - 1);

  return list.withSearch({
    page: asPageNumber(
      AsyncData.isOk(data) ? Math.min(back, data.value.lastPage) : back,
    ),
  });
};
