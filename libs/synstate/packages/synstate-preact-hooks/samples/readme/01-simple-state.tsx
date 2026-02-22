import type * as Preact from 'preact';
import { createState } from 'synstate-preact-hooks';

// Global state (outside component)
const [useUserState, setUserState] = createState({
  name: '',
  email: '',
});

const UserProfile = (): Preact.JSX.Element => {
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
