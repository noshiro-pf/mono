import { memoNamed } from '@noshiro/react-utils';
import type { DeepReadonly } from '@noshiro/ts-utils';
import type { ProductsInfo } from '../../../types';
import { ProductsElementView } from './products-element-view';

export const ProductsView = memoNamed<
  DeepReadonly<{
    webApps: ProductsInfo[];
    libraries: ProductsInfo[];
  }>
>('ProductsView', ({ webApps, libraries }) => (
  <div>
    <h1>{'制作物'}</h1>
    <h2>{'ライブラリ'}</h2>
    <p>{'下の方ほどメンテされていない（特にAngular製のものは放置状態）'}</p>
    {libraries.map((app, i) => (
      <ProductsElementView
        key={i}
        body1={app.body1}
        body2={app.body2}
        imageUrl={app.imageUrl}
        link={app.link}
        subtitle={app.subtitle}
        title={app.title}
      />
    ))}
    <h2>{'ウェブアプリ'}</h2>
    {webApps.map((app, i) => (
      <ProductsElementView
        key={i}
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
