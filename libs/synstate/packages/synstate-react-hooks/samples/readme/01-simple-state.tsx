import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

// Global state (outside component)
const [useUserState, setUserState] = createState({
  name: '',
  email: '',
});

const UserProfile = (): React.JSX.Element => {
  const user = useUserState();

  return (
    <div>
      <p>
        {'Name: '}
        {user.name}
      </p>
      <button
        onClick={() => {
          setUserState({
            name: 'Alice',
            email: 'alice@example.com',
          });
        }}
      >
        {'Set User'}
      </button>
    </div>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(UserProfile);
