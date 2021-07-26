import { memoNamed } from '@noshiro/react-utils';
import type { DeepReadonly } from '@noshiro/ts-utils';
import type { ProductsInfo } from '../../../types';
import { ProductsElementMobileView } from './products-mobile-element-view';

export const ProductsViewMobile = memoNamed<
  DeepReadonly<{
    webApps: ProductsInfo[];
    libraries: ProductsInfo[];
  }>
>('ProductsViewMobile', ({ webApps, libraries }) => (
  <div>
    <h1>{'制作物'}</h1>
    <h2>{'ライブラリ'}</h2>
    {libraries.map((app, i) => (
      <ProductsElementMobileView
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
      <ProductsElementMobileView
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
