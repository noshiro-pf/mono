import { memoNamed } from '@noshiro/react-utils';
import { ProductsViewMobile } from './products-mobile-view';
import { ProductsView } from './products-view';

export const Products = memoNamed<Readonly<{ mobile: boolean }>>(
  'Products',
  ({ mobile }) => (mobile ? <ProductsViewMobile /> : <ProductsView />)
);
