import { memoNamed } from '@mono/react-utils';
import { Mappable } from '@mono/ts-utils';
import { ProductsInfo } from '../../../types/products';
import { ProductsElementView } from './products-element-view';

export const ProductsView = memoNamed<{
  webapps: Mappable<ProductsInfo>;
  libraries: Mappable<ProductsInfo>;
}>('ProductsView', ({ webapps, libraries }) => (
  <div>
    <h1>制作物</h1>
    <h2>ライブラリ</h2>
    {libraries.map((app, i) => (
      <ProductsElementView
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
      <ProductsElementView
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
