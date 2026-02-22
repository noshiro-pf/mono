/* eslint-disable @typescript-eslint/strict-void-return */
// embed-sample-code-ignore-above

import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

// Global state (outside component)
const [
  useUserState,
  setUserState,
  {
    resetState: resetUserState,
    updateState: updateUserState,
    state: userState,
  },
] = createState({
  name: '',
  email: '',
});

userState.subscribe((u) => {
  console.log('User is updated:', u);
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
      <button
        onClick={() => {
          updateUserState((prev) => ({
            name: prev.name,
            email: '',
          }));
        }}
      >
        {'Reset email'}
      </button>
      <button onClick={resetUserState}>{'Reset'}</button>
    </div>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(UserProfile);
