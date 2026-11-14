/* eslint-disable vitest/expect-expect */
import { codeFromStringLines, testPreprocess } from '../utils/index.mjs';
import { replaceAnyWithUnknownTransformer } from './replace-any-with-unknown.mjs';

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
    replaceAnyWithUnknownTransformer,
    source,
    expected,
    debug ?? false,
  );

  expect(result).toBe(expectedFormatted);
};

describe('replaceAnyWithUnknownTransformer', () => {
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
      expected: 'const fn = (...args: readonly unknown[]): void => {}',
    },
    {
      name: 'Spread syntax in named tuple member',
      source: 'type Foo = [number, ...args: any];',
      expected: 'type Foo = [number, ...args: readonly unknown[]];',
    },
    {
      name: 'Skip simple type alias with disable comment',
      source: codeFromStringLines(
        '// transformer-disable-next-line',
        'type Foo = any',
      ),
      expected: codeFromStringLines(
        '// transformer-disable-next-line',
        'type Foo = any', // Should remain any
      ),
    },
    {
      name: 'Skip readonly array with disable comment',
      source: codeFromStringLines(
        '// transformer-disable-next-line',
        'type Foo = readonly any[]',
      ),
      expected: codeFromStringLines(
        '// transformer-disable-next-line',
        'type Foo = readonly any[]', // Should remain any[]
      ),
    },
    {
      name: 'Skip spread syntax in function args with disable comment',
      source: codeFromStringLines(
        '// transformer-disable-next-line',
        'const fn = (...args: any): void => {}',
      ),
      expected: codeFromStringLines(
        '// transformer-disable-next-line',
        'const fn = (...args: any): void => {}', // Should remain any
      ),
    },
    {
      name: 'Skip spread syntax in tuple member with disable comment',
      source: codeFromStringLines(
        '// transformer-disable-next-line',
        'type Foo = [number, ...args: any];',
      ),
      expected: codeFromStringLines(
        '// transformer-disable-next-line',
        'type Foo = [number, ...args: any];', // Should remain any
      ),
    },
    {
      name: 'Disable comment only affects next line (mixed types)',
      source: codeFromStringLines(
        'type A = any; // Should be unknown',
        '// transformer-disable-next-line',
        'type B = any; // Should remain any',
        'type C = any; // Should be unknown',
      ),
      expected: codeFromStringLines(
        'type A = unknown; // Should be unknown',
        '// transformer-disable-next-line',
        'type B = any; // Should remain any',
        'type C = unknown; // Should be unknown',
      ),
    },
  ])('$name', testFn);
});
