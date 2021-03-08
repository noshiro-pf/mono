import { memoNamed } from '@noshiro/react-utils';
import { products } from '../../contents';
import { ProductsViewMobile } from './products-mobile-view';
import { ProductsView } from './products-view';

export const Products = memoNamed<{ mobile: boolean }>(
  'Products',
  ({ mobile }) =>
    mobile ? (
      <ProductsViewMobile
        webapps={products.webapps}
        libraries={products.libraries}
      />
    ) : (
      <ProductsView webapps={products.webapps} libraries={products.libraries} />
    )
);
