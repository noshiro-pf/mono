import { memoNamed } from '@noshiro/react-utils';
import { products } from '../../../assets';
import { ProductsElementMobileView } from './products-mobile-element-view';

export const ProductsViewMobile = memoNamed('ProductsViewMobile', () => (
  <div>
    <h1>{'制作物'}</h1>
    <h2>{'ライブラリ'}</h2>
    {products.libraries.map((app) => (
      <ProductsElementMobileView
        key={app.id}
        body1={app.body1}
        body2={app.body2}
        imageUrl={app.imageUrl}
        link={app.link}
        subtitle={app.subtitle}
        title={app.title}
      />
    ))}
    <h2>{'ウェブアプリ'}</h2>
    {products.webApps.map((app) => (
      <ProductsElementMobileView
        key={app.id}
        body1={app.body1}
        body2={app.body2}
        imageUrl={app.imageUrl}
        link={app.link}
        subtitle={app.subtitle}
        title={app.title}
      />
    ))}
  </div>
));
