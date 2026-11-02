import type { JSX } from 'synstate-dom';
import { routes, Routes } from '../routes.mjs';
import { NotFoundPage } from './not-found-page.js';
import { ProductListPage } from './product-list-page.js';
import { ProductPage } from './product-page.js';

/** The pages below `products`: only these are required here. */
export const ProductsSection = (): JSX.Element => (
  <Routes
    under={routes.products}
    cases={{
      // Called once on entering the page. New params and search of the same
      // page flow through the observable it receives.
      products: (list$) => <ProductListPage list$={list$} />,
      'products.item': (item$) => <ProductPage item$={item$} />,
    }}
    notFound={<NotFoundPage />}
  />
);
