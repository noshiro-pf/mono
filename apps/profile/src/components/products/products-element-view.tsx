import { constant, type JSX } from 'synstate-dom';
import type { ProductsInfo } from '../../types/index.mjs';
import { MuiCard, MuiDivider, MuiTypography } from '../mui/index.mjs';
import * as styles from './products-element-view.module.css';

type Props = Readonly<{
  product: ProductsInfo;
}>;

export const ProductsElementView = ({ product }: Props): JSX.Element => (
  <MuiCard fill>
    <MuiTypography variant={'title'}>
      {product.link === '' ? (
        <span>{constant(product.title)}</span>
      ) : (
        <a
          href={constant(product.link)}
          rel={constant('noopener noreferrer')}
          target={constant('_blank')}
        >
          {constant(product.title)}
        </a>
      )}
    </MuiTypography>
    <MuiTypography variant={'subtitle1'}>
      {constant(product.subtitle)}
    </MuiTypography>

    <MuiDivider />

    <div class={constant(styles.body)}>
      <MuiTypography variant={'body1'}>
        {constant(product.description)}
      </MuiTypography>
      <MuiTypography variant={'body2'}>
        {constant(`［実装］：${product.implementation}`)}
      </MuiTypography>
    </div>

    {product.imageUrl === '' ? (
      []
    ) : (
      <img
        alt={constant(product.title)}
        class={constant(styles.image)}
        src={constant(product.imageUrl)}
      />
    )}
  </MuiCard>
);
