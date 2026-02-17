/* eslint-disable functional/immutable-data */
// embed-sample-code-ignore-above
import * as React from 'react';
import { createBooleanState } from 'synstate';

export const [darkModeState, { toggle, getSnapshot }] =
  createBooleanState(false);

const ThemeToggle = (): React.JSX.Element => {
  const [isDark, setIsDark] = React.useState(getSnapshot());

  React.useEffect(() => {
    const sub = darkModeState.subscribe(setIsDark);

    return () => {
      sub.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    document.body.className = isDark ? 'dark' : 'light';
  }, [isDark]);

  return (
    <button
      onClick={() => {
        toggle();
      }}
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(ThemeToggle);
