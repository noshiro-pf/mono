import { memoNamed } from '@noshiro/react-utils';
import { Mappable } from '@noshiro/ts-utils';
import { ProductsInfo } from '../../../types/products';
import { ProductsElementMobileView } from './products-mobile-element-view';

export const ProductsViewMobile = memoNamed<{
  webapps: Mappable<ProductsInfo>;
  libraries: Mappable<ProductsInfo>;
}>('ProductsViewMobile', ({ webapps, libraries }) => (
  <div>
    <h1>制作物</h1>
    <h2>ライブラリ</h2>
    {libraries.map((app, i) => (
      <ProductsElementMobileView
        key={i}
        link={app.link}
        title={app.title}
        subtitle={app.subtitle}
        body1={app.body1}
        body2={app.body2}
        imageUrl={app.imageUrl}
      />
    ))}
    <h2>ウェブアプリ</h2>
    {webapps.map((app, i) => (
      <ProductsElementMobileView
        key={i}
        link={app.link}
        title={app.title}
        subtitle={app.subtitle}
        body1={app.body1}
        body2={app.body2}
        imageUrl={app.imageUrl}
      />
    ))}
  </div>
));
