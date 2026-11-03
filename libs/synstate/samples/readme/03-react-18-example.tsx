import * as React from 'react';
import { createState } from 'synstate';

const [userState, setUserState] = createState({
  name: '',
  email: '',
});

// Defined once: `useSyncExternalStore` subscribes again whenever `subscribe` is
// a new function.
const subscribeUser = (onStoreChange: () => void): (() => void) => {
  const { unsubscribe } = userState.subscribe(onStoreChange);

  return unsubscribe;
};

const getUser = (): Readonly<{ name: string; email: string }> =>
  userState.getSnapshot().value;

const UserProfile = (): React.JSX.Element => {
  const user = React.useSyncExternalStore(subscribeUser, getUser);

  return (
    <div>
      <p>{`Name: ${user.name}`}</p>
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
