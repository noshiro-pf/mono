/* eslint-disable @stylistic/padding-line-between-statements */
import { createState, map } from 'synstate';

// embed-sample-code-ignore-above
const [count, setCount] = createState(0);
const doubled = count.pipe(map((n) => n * 2));
const quadrupled = doubled.pipe(map((n) => n * 2));
// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(count, setCount, doubled, quadrupled);

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    assert.isTrue(true);
  });
}
