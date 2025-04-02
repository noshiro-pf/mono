/* eslint-disable vitest/expect-expect */
import { testPreprocess } from '../utils/index.mjs';
import { replaceAnyWithUnknown } from './replace-any-with-unknown.mjs';

describe('replaceAnyWithUnknown', () => {
  test.each([
    {
      name: 'Simple type alias',
      source: 'type Foo = any',
      expected: 'type Foo = unknown',
    },
    {
      name: 'Readonly array',
      source: 'type Foo = readonly any[]',
      expected: 'type Foo = readonly unknown[]',
    },
    {
      name: 'Spread syntax in function arguments',
      source: 'const fn = (...args: any): void => {}',
      expected: 'const fn = (...args: unknown[]): void => {}',
    },
    {
      name: 'Spread syntax in named tuple member',
      source: 'type Foo = [number, ...args: any];',
      expected: 'type Foo = [number, ...args: unknown[]];',
    },
  ])('$name', testFn);
});

const testFn = ({
  source,
  expected,
  debug,
}: Readonly<{
  source: string;
  expected: string;
  debug?: boolean;
}>): void => {
  const { expectedFormatted, result } = testPreprocess(
    replaceAnyWithUnknown,
    source,
    expected,
    debug ?? false,
  );

  expect(result).toBe(expectedFormatted);
};
