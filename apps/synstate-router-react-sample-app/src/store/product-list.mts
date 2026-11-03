import {
  just,
  map,
  skipIfNoChange,
  switchMap,
  type Observable as SynstateObservable,
} from 'synstate';
import { AsyncData } from 'ts-std-forge';
import {
  fetchProductSummaries,
  type ProductQuery,
  type ProductSummaryPage,
} from '../api/index.mjs';
import { firstPage } from '../page-number.mjs';
import { router, routes } from '../routes.mjs';
import { fromRequest } from './from-request.mjs';

/**
 * The page of summaries the product list shows. `switchMap` projects the query
 * the location already has, so opening the app on `/products/?page=2` asks for
 * page 2 at once, and a new query aborts the request for the one before. Like
 * `productDetail$`, it holds a value from the start, which its type does not
 * say.
 */
export const productList$: SynstateObservable<
  AsyncData<ProductSummaryPage, unknown>
> = router.match
  // The list's own query, and only while the list is the page. The router keeps
  // the parts of a match that did not change, so an equal query is the same
  // object.
  .pipe(
    map((m): ProductQuery | undefined =>
      m.route === 'products' ? m.search : undefined,
    ),
  )
  .pipe(skipIfNoChange())
  .pipe(
    switchMap(
      (query): SynstateObservable<AsyncData<ProductSummaryPage, unknown>> =>
        query === undefined
          ? just(AsyncData.idle)
          : fromRequest((signal) => fetchProductSummaries(query, signal)),
    ),
  );

/** What typing in the search box does: page 1 of what matches `text`. */
export const searchProducts = (text: string): void => {
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
