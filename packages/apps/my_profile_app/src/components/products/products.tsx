import { memoNamed } from '@mono/react-utils';
import { products } from '../../contents/products';
import { ProductsViewMobile } from './products-mobile-view/products-mobile-view';
import { ProductsView } from './products-view/products-view';

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
