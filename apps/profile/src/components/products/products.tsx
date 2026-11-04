import { constant, type JSX } from 'synstate-dom';
import { products } from '../../assets/index.mjs';
import { ProductsElementView } from './products-element-view.js';

export const Products = (): JSX.Element => (
  <div>
    <h1>{constant('制作物')}</h1>
    <h2>{constant('ライブラリ')}</h2>
    {products.libraries.map((product) => (
      <ProductsElementView product={product} />
    ))}
    <h2>{constant('ウェブアプリ')}</h2>
    {products.webApps.map((product) => (
      <ProductsElementView product={product} />
    ))}
  </div>
);
