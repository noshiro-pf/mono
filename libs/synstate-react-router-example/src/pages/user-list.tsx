import * as React from 'react';
import { Link } from 'synstate-react-router';
import { router, routes } from '../routes';

export const UserList = React.memo(() => (
  <div>
    <h2>{'Users'}</h2>
    <ul>
      {users.map((u) => (
        <li key={u.id}>
          <Link router={router} to={routes.users.item.path({ userId: u.id })}>
            {u.name}
          </Link>
        </li>
      ))}
    </ul>
    <p>
      <Link router={router} to={routes.home.path()}>
        {'← Back to Home'}
      </Link>
    </p>
  </div>
));

UserList.displayName = 'UserList';

const users = [
  { id: 'alice', name: 'Alice' },
  { id: 'bob', name: 'Bob' },
  { id: 'charlie', name: 'Charlie' },
] as const;
