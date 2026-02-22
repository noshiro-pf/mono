import * as React from 'react';
import { createState } from 'synstate';

const [userState, setUserState] = createState({
  name: '',
  email: '',
});

const UserProfile = (): React.JSX.Element => {
  const user = React.useSyncExternalStore(
    (onStoreChange: () => void) => {
      const { unsubscribe } = userState.subscribe(onStoreChange);

      return unsubscribe;
    },
    () => userState.getSnapshot().value,
  );

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
