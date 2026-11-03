import {
  just,
  map,
  skipIfNoChange,
  switchMap,
  type Observable as SynstateObservable,
} from 'synstate';
import { AsyncData, Optional } from 'ts-std-forge';
import type { SafeInt } from 'ts-type-forge';
import { fetchProduct, type ProductDetail } from '../api/index.mjs';
import { router, routes } from '../routes.mjs';
import { fromRequest } from './from-request.mjs';

/**
 * The product the product page shows, fetched by its id; none when the server
 * has no such product. Moving to another product aborts the request for the one
 * before.
 *
 * It holds a value from the start, since `switchMap` projects the location the
 * router already has; its type does not say so, which is why the page reads it
 * with a fallback.
 */
export const productDetail$: SynstateObservable<
  AsyncData<Optional<ProductDetail>, unknown>
> = router
  .at(routes.products.item)
  .pipe(
    map((m): SafeInt | undefined =>
      Optional.isSome(m) ? m.value.params.productId : undefined,
    ),
  )
  // A move to `#reviews` on the same product asks for nothing.
  .pipe(skipIfNoChange())
  .pipe(
    switchMap(
      (id): SynstateObservable<AsyncData<Optional<ProductDetail>, unknown>> =>
        id === undefined
          ? just(AsyncData.idle)
          : fromRequest((signal) => fetchProduct(id, signal)),
    ),
  );
