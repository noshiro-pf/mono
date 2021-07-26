import { memoNamed } from '@noshiro/react-utils';
import { products } from '../../assets';
import { ProductsViewMobile } from './products-mobile-view';
import { ProductsView } from './products-view';

export const Products = memoNamed<Readonly<{ mobile: boolean }>>(
  'Products',
  ({ mobile }) =>
    mobile ? (
      <ProductsViewMobile
        libraries={products.libraries}
        webApps={products.webApps}
      />
    ) : (
      <ProductsView libraries={products.libraries} webApps={products.webApps} />
    )
);
