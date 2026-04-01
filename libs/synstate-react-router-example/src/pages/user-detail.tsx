import * as React from 'react';
import { Link } from 'synstate-react-router';
import { router, routes } from '../routes';

type Props = Readonly<{ userId: string }>;

export const UserDetail = React.memo<Props>(({ userId }) => (
  <div>
    <h2>{'User Profile'}</h2>
    <p>
      {'User ID: '}
      <code>{userId}</code>
    </p>
    <p>
      <Link router={router} to={routes.users.path()}>
        {'← Back to Users'}
      </Link>
    </p>
  </div>
));

UserDetail.displayName = 'UserDetail';
