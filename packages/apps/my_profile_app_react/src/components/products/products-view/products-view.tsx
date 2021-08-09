import { memoNamed } from '@noshiro/react-utils';
import { products } from '../../../assets';
import { ProductsElementView } from './products-element-view';

export const ProductsView = memoNamed('ProductsView', () => (
  <div>
    <h1>{'制作物'}</h1>
    <h2>{'ライブラリ'}</h2>
    <p>{'下の方ほどメンテされていない（特にAngular製のものは放置状態）'}</p>
    {products.libraries.map((app) => (
      <ProductsElementView
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
      <ProductsElementView
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
