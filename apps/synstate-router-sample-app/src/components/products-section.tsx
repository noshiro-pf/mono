import * as React from 'react';
import type { BranchIds } from 'synstate-router';
import type { PageCases } from 'synstate-router-react';
import { routes, Routes, type Routes as AppRoutes } from '../routes.mjs';
import { NotFoundPage } from './not-found-page.js';
import { ProductListPage } from './product-list-page.js';
import { ProductPage } from './product-page.js';

/** The pages below `products`: only these are required here. */
export const ProductsSection = React.memo(() => (
  <Routes cases={pages} notFound={notFound} under={routes.products} />
));

ProductsSection.displayName = 'ProductsSection';

const pages: PageCases<
  AppRoutes,
  BranchIds<AppRoutes, typeof routes.products>
> = {
  products: (list) => <ProductListPage list={list} />,
  'products.item': (item) => <ProductPage productId={item.params.productId} />,
} as const;

const notFound = <NotFoundPage />;
