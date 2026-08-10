import { createState } from 'synstate-react-hooks-compat';

const [useUserState, setUserState] = createState({
  name: '',
  email: '',
});

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(useUserState, setUserState);
