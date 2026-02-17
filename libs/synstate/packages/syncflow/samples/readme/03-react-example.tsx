import * as React from 'react';
import { createState } from 'syncflow';

// Global state (outside component)
const [userState, setUserState, { getSnapshot }] = createState({
  name: '',
  email: '',
});

const UserProfile = (): React.JSX.Element => {
  const [user, setUser] = React.useState(getSnapshot());

  React.useEffect(() => {
    const subscription = userState.subscribe(setUser);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
