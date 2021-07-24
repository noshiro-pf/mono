import { memoNamed } from '@noshiro/react-utils';
import { products } from '../../assets';
import { ProductsViewMobile } from './products-mobile-view';
import { ProductsView } from './products-view';

export const Products = memoNamed<Readonly<{ mobile: boolean }>>(
  'Products',
  ({ mobile }) =>
    mobile ? (
      <ProductsViewMobile
        webApps={products.webApps}
        libraries={products.libraries}
      />
    ) : (
      <ProductsView webApps={products.webApps} libraries={products.libraries} />
    )
);
