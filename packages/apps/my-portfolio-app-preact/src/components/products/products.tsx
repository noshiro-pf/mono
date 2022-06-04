import { memoNamed } from '@noshiro/preact-utils';
import { products } from '../../assets';
import { ProductsElementView } from './products-element-view';

export const Products = memoNamed('Products', () => (
  <div>
    <h1>{'制作物'}</h1>
    <p>{'★は特に時間をかけたものを表しています。'}</p>
    <h2>{'ライブラリ'}</h2>
    {products.libraries.map((app) => (
      <ProductsElementView
        key={app.id}
        description={app.description}
        imageUrl={app.imageUrl}
        implementation={app.implementation}
        link={app.link}
        subtitle={app.subtitle}
        title={app.title}
      />
    ))}
    <h2>{'ウェブアプリ'}</h2>
    {products.webApps.map((app) => (
      <ProductsElementView
        key={app.id}
        description={app.description}
        imageUrl={app.imageUrl}
        implementation={app.implementation}
        link={app.link}
        subtitle={app.subtitle}
        title={app.title}
      />
    ))}
  </div>
));
