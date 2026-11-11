import { filter, fromAbortablePromise, map, switchMap } from 'synstate';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  param,
} from 'synstate-router';
import { asSafeInt, Optional, Result, type SafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('docs: data fetching', async () => {
    /** A request that answers in a later task, and stops when aborted. */
    const fetchProductName = async (
      productId: SafeInt,
      // The platform's own `AbortSignal`, which no readonly type describes.
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      signal: AbortSignal,
    ): Promise<string> =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          resolve(`Product ${productId}`);
        }, 0);

        signal.addEventListener('abort', () => {
          clearTimeout(timer);

          reject(new DOMException('aborted', 'AbortError'));
        });
      });

    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      home: { segment: '' },
      products: {
        children: { item: { params: { productId: param.int } } },
      },
    });

    const router = createRouter(routes, {
      browser: createMemoryBrowser('https://example.com/products/42/'),
    });

    // `at` holds the node's values while the page is at or below it, and `none`
    // elsewhere. `map` passes a new id only, and `switchMap` aborts the request
    // for the id it replaces.
    const productName = router
      .at(routes.products.item)
      .pipe(filter(Optional.isSome))
      .pipe(map((some) => Optional.unwrap(some).params.productId))
      .pipe(
        switchMap((productId) =>
          fromAbortablePromise((signal) => fetchProductName(productId, signal)),
        ),
      );

    const mut_names: string[] = [];

    productName.subscribe((result) => {
      if (Result.isOk(result)) {
        mut_names.push(result.value);
      }
    });

    // `switchMap` projects the id the router already holds, so the page it
    // opened on (42) is fetched at once.
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    assert.deepStrictEqual(mut_names, ['Product 42']);

    // Two moves before the next answer: only the last one is fetched to the
    // end.
    router.push(routes.products.item.href({ productId: asSafeInt(7) }));

    router.push(routes.products.item.href({ productId: asSafeInt(8) }));

    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    assert.deepStrictEqual(mut_names, ['Product 42', 'Product 8']);

    // embed-sample-code-ignore-below
  });
}
