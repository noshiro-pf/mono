import { derive, map, type InitializedObservable } from 'synstate';
import { constant, If, MatchOptional, view, type JSX } from 'synstate-dom';
import { AsyncData, Optional } from 'ts-std-forge';
import type { SafeInt } from 'ts-type-forge';
import { fetchProduct, type ProductDetail } from '../api/index.mjs';
import { latestRequest } from '../from-request.mjs';
import { Link, routes, type ProductValues } from '../routes.mjs';

type Props = Readonly<{
  item$: InitializedObservable<ProductValues>;
}>;

/**
 * Fetches the product in the URL from `products/{id}`, and draws it.
 *
 * As on the list page, the request is built here and lives in the page's scope:
 * leaving the page aborts it, and following "Next product", which keeps the
 * page and changes its id, aborts the request for the id it leaves.
 *
 * The page keeps its layout while it loads, so a `#reviews` link has its
 * element to scroll to at once and the element does not move when the product
 * arrives.
 */
export const ProductPage = ({ item$ }: Props): JSX.Element => {
  // Equal ids are not passed on: a new `#hash` alone fetches nothing.
  const productId$ = item$.pipe(map((item) => item.params.productId));

  const data$ = latestRequest(productId$, fetchProduct);

  const page$ = derive([productId$, data$], pageOf);

  // The id alone, so that the link is made again only when it changes.
  const nextId$ = page$.pipe(map((page) => page.product?.next));

  return (
    <section aria-busy={view(data$, AsyncData.isPending)}>
      <h1>{view(page$, (page) => page.title)}</h1>
      <If
        cond={view(page$, (page) => page.found)}
        then={
          <>
            {/* One line each, filled or not, so nothing below moves. */}
            <p class={constant('line')}>
              {view(page$, (page) => page.product?.description ?? '')}
            </p>
            <p class={constant('line')}>
              {view(page$, (page) =>
                page.product === undefined ? '' : `¥${page.product.price}`,
              )}
            </p>
            <p>
              <Link
                to={view(productId$, (productId) =>
                  routes.products.item.href({ productId }, { hash: 'reviews' }),
                )}
              >
                {constant('Jump to reviews')}
              </Link>
            </p>
            {/* Tall enough that the fragment link has somewhere to scroll. */}
            <div class={constant('spacer')} />
            <h2 id={constant('reviews')}>{constant('Reviews')}</h2>
            <p>{constant('No reviews yet.')}</p>
            <MatchOptional
              value={view(nextId$, (nextId) =>
                nextId === undefined
                  ? Optional.none
                  : Optional.some(
                      routes.products.item.href({ productId: nextId }),
                    ),
              )}
              some={(next$) => (
                <p>
                  <Link to={next$}>{constant('Next product')}</Link>
                </p>
              )}
            />
            <div class={constant('spacer')} />
          </>
        }
        else={
          // The route only knows the id is an integer; whether such a product
          // exists is the server's to say, and the page's to show.
          <p>
            <Link to={routes.products.href()}>{constant('All products')}</Link>
          </p>
        }
      />
    </section>
  );
};

type Page = Readonly<{
  title: string;
  /** Whether the page has a product to show, or is loading one. */
  found: boolean;
  product: ProductDetail | undefined;
}>;

const pageOf = (
  productId: SafeInt,
  data: AsyncData<Optional<ProductDetail>, unknown>,
): Page => {
  const loading: Page = {
    title: 'Loading…',
    found: true,
    product: undefined,
  } as const;

  return AsyncData.match(data, {
    idle: () => loading,
    pending: () => loading,
    ok: (found) =>
      Optional.isSome(found)
        ? found.value.id === productId
          ? { ...loading, title: found.value.name, product: found.value }
          : // An answer for another id. `switchMap` moves to the new request in
            // the same update as the id, so this is not seen; it is checked
            // rather than assumed.
            loading
        : { ...loading, title: `No product ${productId}`, found: false },
    err: () => ({
      ...loading,
      title: `Could not load product ${productId}`,
      found: false,
    }),
  });
};
