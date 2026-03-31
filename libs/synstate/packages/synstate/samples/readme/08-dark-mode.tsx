/* eslint-disable @typescript-eslint/strict-void-return */
// embed-sample-code-ignore-above

import * as React from 'react';
import { createBooleanState } from 'synstate-react-hooks';

export const [useDarkModeState, { toggle: toggleDarkMode }] =
  createBooleanState(false);

const ThemeToggle = (): React.JSX.Element => {
  const isDark = useDarkModeState();

  React.useEffect(() => {
    document.body.className = isDark ? 'dark' : 'light';
  }, [isDark]);

  return <button onClick={toggleDarkMode}>{isDark ? '🌙' : '☀️'}</button>;
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(ThemeToggle);
