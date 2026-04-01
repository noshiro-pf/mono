import * as React from 'react';
import { Link, useQueryParam } from 'synstate-react-router';
import { Arr, asUint32 } from 'ts-data-forge';
import { router, routes } from '../routes';
import { PageButton } from './page-button.js';

export const ProductList = React.memo(() => {
  const page = useQueryParam(
    router.searchParams,
    routes.products.queryParams.page,
  );

  const search = useQueryParam(
    router.searchParams,
    routes.products.queryParams.search,
  );

  const filtered = React.useMemo(
    () =>
      search !== undefined && search !== ''
        ? allProducts.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase()),
          )
        : allProducts,
    [search],
  );

  const start = ((page ?? 1) - 1) * pageSize;

  const paged = React.useMemo(
    () => filtered.slice(start, start + pageSize),
    [filtered, start],
  );

  const totalPages = React.useMemo(
    () => asUint32(Math.max(1, Math.ceil(filtered.length / pageSize))),
    [filtered.length],
  );

  const currentPage = page ?? 1;

  return (
    <div>
      <h2>
        {'Products (page '}
        {currentPage}
        {')'}
      </h2>
      <div>
        <input
          placeholder={'Search...'}
          type={'text'}
          value={search ?? ''}
          onChange={handleSearchChange}
        />
      </div>
      <ul>
        {paged.map((p) => (
          <li key={p.id}>
            <Link
              router={router}
              to={routes.products.item.path({ productId: p.id })}
            >
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
      <div>
        {Arr.seq(totalPages).map((i) => (
          <PageButton
            key={i + 1}
            currentPage={currentPage}
            pageNumber={i + 1}
          />
        ))}
      </div>
      <p>
        <Link router={router} to={routes.home.path()}>
          {'← Back to Home'}
        </Link>
      </p>
    </div>
  );
});

ProductList.displayName = 'ProductList';

const allProducts = [
  { id: '1', name: 'Widget A' },
  { id: '2', name: 'Widget B' },
  { id: '3', name: 'Gadget C' },
  { id: '4', name: 'Gadget D' },
  { id: '5', name: 'Tool E' },
] as const;

const pageSize = 3;

const handleSearchChange = (
  e: DeepReadonly<
    DeepPick<React.ChangeEvent<HTMLInputElement>, ['target', 'value']>
  >,
): void => {
  const v = e.target.value;

  if (v === '') {
    router.deleteQueryParam(routes.products.queryParams.search);
  } else {
    router.setQueryParam(routes.products.queryParams.search, v, {
      method: 'replaceState',
    });
  }

  // reset to page 1 on search
  router.deleteQueryParam(routes.products.queryParams.page, {
    method: 'replaceState',
  });
};
