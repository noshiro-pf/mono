import * as React from 'react';
import { Link } from 'synstate-react-router';
import { router, routes } from '../routes';

type Props = Readonly<{ productId: string }>;

export const ProductDetail = React.memo<Props>(({ productId }) => (
  <div>
    <h2>{'Product Detail'}</h2>
    <p>
      {'Product ID: '}
      <code>{productId}</code>
    </p>
    <p>
      <Link router={router} to={routes.products.path()}>
        {'← Back to Products'}
      </Link>
    </p>
  </div>
));

ProductDetail.displayName = 'ProductDetail';
