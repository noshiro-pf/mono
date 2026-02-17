/* eslint-disable @typescript-eslint/require-await */
// embed-sample-code-ignore-above
import * as React from 'react';
import { createEventEmitter, createValueEmitter } from 'synstate';

// Global events
export const [userLoggedIn$, emitUserLoggedIn] = createValueEmitter<
  Readonly<{
    id: number;
    name: string;
  }>
>();

export const [userLoggedOut$, emitUserLoggedOut] = createEventEmitter();

// Component that emits events
const LoginButton = (): React.JSX.Element => {
  const handleLogin = React.useCallback(() => {
    (async () => {
      const user = await loginUser();

      emitUserLoggedIn(user);
    })().catch(() => {});
  }, []);

  return <button onClick={handleLogin}>{'Login'}</button>;
};

// Component that listens to events
const NotificationPage = (): React.JSX.Element => {
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    const sub1 = userLoggedIn$.subscribe((user) => {
      setMessage(`Welcome, ${user.name}!`);
    });

    const sub2 = userLoggedOut$.subscribe(() => {
      setMessage('Logged out');
    });

    return () => {
      sub1.unsubscribe();

      sub2.unsubscribe();
    };
  }, []);

  return message !== '' ? (
    <div className={'notification'}>{message}</div>
  ) : (
    <>{null}</>
  );
};

const loginUser = async (): Promise<
  Readonly<{
    id: number;
    name: string;
  }>
> => ({ id: 1, name: 'Alice' });

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(LoginButton, NotificationPage);
