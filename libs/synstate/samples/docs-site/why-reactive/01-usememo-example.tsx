/* eslint-disable @stylistic/padding-line-between-statements */

import * as React from 'react';

const Component = (): React.JSX.Element => {
  // embed-sample-code-ignore-above
  const [count, setCount] = React.useState(0);
  const doubled = React.useMemo(() => count * 2, [count]);
  const quadrupled = React.useMemo(() => doubled * 2, [doubled]);
  // embed-sample-code-ignore-below

  noop(count, setCount, doubled, quadrupled);

  return <div />;
};

const noop = (..._args: readonly unknown[]): void => {};

noop(Component);

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    assert.isTrue(true);
  });
}
