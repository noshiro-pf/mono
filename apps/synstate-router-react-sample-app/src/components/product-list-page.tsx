import * as React from 'react';
import { useObservableValue } from 'synstate-react-hooks';
import { Arr } from 'ts-data-forge';
import { AsyncData } from 'ts-std-forge';
import type { ProductSummaryPage } from '../api/index.mjs';
import { asPageNumber } from '../page-number.mjs';
import { Link, routes, type ProductListValues } from '../routes.mjs';
import { productList$, searchProducts } from '../store/index.mjs';

type Props = Readonly<{
  list: ProductListValues;
}>;

/**
 * Draws what the store holds for the query in the URL. It fetches nothing
 * itself: it reads `productList$`, and typing dispatches `searchProducts`.
 */
export const ProductListPage = React.memo<Props>((props) => {
  const { list } = props;

  const { q, sort, page } = list.search;

  // The fallback is never drawn: `productList$` holds a value from the start.
  const data = useObservableValue(productList$, AsyncData.pending());

  const links = React.useMemo(
    () => ({
      byName: list.withSearch({ sort: 'name', page: undefined }),
      byPrice: list.withSearch({ sort: 'price', page: undefined }),
      ...pagerLinks(list, data),
    }),
    [list, data],
  );

  const body = React.useMemo(() => bodyOf(data), [data]);

  return (
    <section aria-busy={AsyncData.isPending(data)} data-e2e={'products'}>
      <h1>{'Products'}</h1>
      <label>
        {'Search '}
        <input
          data-e2e={'search'}
          type={'search'}
          value={q ?? ''}
          onChange={onSearchInput}
        />
      </label>
      <p>
        {'Sort by '}
        <Link
          aria-current={sort === 'name' ? 'true' : undefined}
          to={links.byName}
        >
          {'name'}
        </Link>
        {' · '}
        <Link
          aria-current={sort === 'price' ? 'true' : undefined}
          to={links.byPrice}
        >
          {'price'}
        </Link>
      </p>
      {body}
      <nav aria-label={'Pages'}>
        {links.previous === undefined ? undefined : (
          <Link to={links.previous}>{'Previous'}</Link>
        )}
        <span data-e2e={'page'}>{` Page ${page} `}</span>
        {links.next === undefined ? undefined : (
          <Link to={links.next}>{'Next'}</Link>
        )}
      </nav>
    </section>
  );
});

ProductListPage.displayName = 'ProductListPage';

const onSearchInput: React.ChangeEventHandler<HTMLInputElement> = (
  inputEvent,
) => {
  searchProducts(inputEvent.currentTarget.value);
};

const bodyOf = (
  data: AsyncData<ProductSummaryPage, unknown>,
): React.JSX.Element | undefined =>
  AsyncData.match(data, {
    idle: () => undefined,
    pending: () => <p data-e2e={'loading'}>{'Loading…'}</p>,
    ok: ({ items }) =>
      Arr.isNonEmpty(items) ? (
        <ul data-e2e={'product-list'}>
          {items.map((p) => (
            <li key={p.id}>
              <Link to={routes.products.item.href({ productId: p.id })}>
                {`${p.name} — ¥${p.price}`}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>{'No products.'}</p>
      ),
    err: () => <p role={'alert'}>{'Could not load the products.'}</p>,
  });

/**
 * Previous and Next. Next waits for the last page the server reports for this
 * query; Previous goes one page back until then.
 */
const pagerLinks = (
  list: ProductListValues,
  data: AsyncData<Readonly<{ lastPage: number }>, unknown>,
): Readonly<{
  previous: ReturnType<ProductListValues['withSearch']> | undefined;
  next: ReturnType<ProductListValues['withSearch']> | undefined;
}> => {
  const { page } = list.search;

  const lastPage = AsyncData.isOk(data) ? data.value.lastPage : undefined;

  return {
    previous:
      page > 1
        ? list.withSearch({
            // Past the last page, this goes to the last one that has products.
            page: asPageNumber(Math.min(page - 1, lastPage ?? page - 1)),
          })
        : undefined,
    next:
      lastPage !== undefined && page < lastPage
        ? list.withSearch({ page: asPageNumber(page + 1) })
        : undefined,
  };
};
