import React, { useMemo } from 'react';
import { contentsUrls } from '../../constants/contents-urls';
import { productsInfo, ProductsInfo } from '../../types/products';
import { convertJsonData } from '../../utils/convert-json-data';
import { useFetchedJsonData } from '../../utils/hooks';
import { memoNamed } from '../../utils/react/memo-named';
import { ProductsViewMobile } from './products-mobile-view/products-mobile-view';
import { ProductsView } from './products-view/products-view';

export const Products = memoNamed<{ mobile: boolean }>(
  'Products',
  ({ mobile }) => {
    const data = useFetchedJsonData(contentsUrls.productsJson);

    const webapps = useMemo<ProductsInfo[]>(
      () => convertJsonData(data, (data) => data?.webapps, productsInfo),
      [data]
    );

    const libraries = useMemo<ProductsInfo[]>(
      () => convertJsonData(data, (data) => data?.libraries, productsInfo),
      [data]
    );

    return mobile ? (
      <ProductsViewMobile webapps={webapps} libraries={libraries} />
    ) : (
      <ProductsView webapps={webapps} libraries={libraries} />
    );
  }
);
