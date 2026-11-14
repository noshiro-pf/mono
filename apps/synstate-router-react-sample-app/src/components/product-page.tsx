import * as React from 'react';
import { useObservableValue } from 'synstate-react-hooks';
import type { Href } from 'synstate-router';
import { AsyncData, Optional } from 'ts-std-forge';
import type { SafeInt } from 'ts-type-forge';
import type { ProductDetail } from '../api/index.mjs';
import { Link, routes } from '../routes.mjs';
import { productDetail$ } from '../store/index.mjs';

type Props = Readonly<{
  productId: SafeInt;
}>;

/**
 * Draws what the store fetched from `products/{id}`. The page keeps its layout
 * while it loads, so a `#reviews` link has its element to scroll to at once and
 * the element does not move when the product arrives.
 */
export const ProductPage = React.memo<Props>((props) => {
  const { productId } = props;

  // The fallback is never drawn: `productDetail$` holds a value from the start.
  const data = useObservableValue(productDetail$, AsyncData.pending());

  const view = React.useMemo(() => viewOf(data, productId), [data, productId]);

  return (
    <section aria-busy={AsyncData.isPending(data)}>
      <h1>{view.title}</h1>
      {view.found ? (
        <>
          {/* One line each, filled or not, so nothing below moves. */}
          <p className={'line'}>{view.product?.description}</p>
          <p className={'line'}>
            {view.product === undefined ? undefined : `¥${view.product.price}`}
          </p>
          <p>
            <Link to={view.reviews}>{'Jump to reviews'}</Link>
          </p>
          {/* Tall enough that the fragment link has somewhere to scroll. */}
          <div className={'spacer'} />
          <h2 id={'reviews'}>{'Reviews'}</h2>
          <p>{'No reviews yet.'}</p>
          {view.next === undefined ? undefined : (
            <p>
              <Link to={view.next}>{'Next product'}</Link>
            </p>
          )}
          <div className={'spacer'} />
        </>
      ) : (
        // The route only knows the id is an integer; whether such a product
        // exists is the server's to say, and the page's to show.
        <p>
          <Link to={routes.products.href()}>{'All products'}</Link>
        </p>
      )}
    </section>
  );
});

ProductPage.displayName = 'ProductPage';

type View = Readonly<{
  title: string;
  /** Whether the page has a product to show, or is loading one. */
  found: boolean;
  product: ProductDetail | undefined;
  reviews: Href;
  next: Href | undefined;
}>;

const viewOf = (
  data: AsyncData<Optional<ProductDetail>, unknown>,
  productId: SafeInt,
): View => {
  const loading: View = {
    title: 'Loading…',
    found: true,
    product: undefined,
    reviews: routes.products.item.href({ productId }, { hash: 'reviews' }),
    next: undefined,
  } as const;

  return AsyncData.match(data, {
    idle: () => loading,
    pending: () => loading,
    ok: (found) => {
      if (Optional.isNone(found)) {
        return { ...loading, title: `No product ${productId}`, found: false };
      }

      const product = Optional.unwrap(found);

      return product.id !== productId
        ? // An answer for another product: the store has not moved yet.
          loading
        : {
            ...loading,
            title: product.name,
            product,
            next:
              product.next === undefined
                ? undefined
                : routes.products.item.href({ productId: product.next }),
          };
    },
    err: () => ({
      ...loading,
      title: `Could not load product ${productId}`,
      found: false,
    }),
  });
};
