/* eslint-disable vitest/expect-expect */
import * as prettier from 'prettier';
import { dedent } from '../utils/index.mjs';
import { replaceAnyWithUnknownTransformer } from './replace-any-with-unknown.mjs';
import { transformSourceCode } from './transform-source-code.mjs';

const testFn = async ({
  source,
  expected,
  debug,
}: Readonly<{
  source: string;
  expected: string;
  debug?: boolean;
}>): Promise<void> => {
  if (debug !== true) {
    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'debug').mockImplementation(() => {});

    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
  }

  const transformed = await formatter(
    transformSourceCode(source, false, [replaceAnyWithUnknownTransformer]),
  );
  const expectedFormatted = await formatter(expected);

  expect(transformed).toBe(expectedFormatted);
};

const formatter = (code: string): Promise<string> =>
  prettier.format(code, {
    parser: 'typescript',
  });

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
      source: dedent`
        // transformer-ignore-next-line
        type Foo = any;
      `,
      expected: dedent`
        // transformer-ignore-next-line
        type Foo = any;
      `,
    },
    {
      name: 'Skip readonly array with disable comment',
      source: dedent`
        // transformer-ignore-next-line
        type Foo = readonly any[];
      `,
      expected: dedent`
        // transformer-ignore-next-line
        type Foo = readonly any[];
      `,
    },
    {
      name: 'Skip spread syntax in function args with disable comment',
      source: dedent`
        // transformer-ignore-next-line
        const fn = (...args: any): void => {}
      `,
      expected: dedent`
        // transformer-ignore-next-line
        const fn = (...args: any): void => {}
      `,
    },
    {
      name: 'Skip spread syntax in tuple member with disable comment',
      source: dedent`
        // transformer-ignore-next-line
        type Foo = [number, ...args: any];
      `,
      expected: dedent`
        // transformer-ignore-next-line
        type Foo = [number, ...args: any];
      `,
    },
    {
      name: 'Disable comment only affects next line (mixed types)',
      source: dedent`
        type A = any; // Should be unknown
        // transformer-ignore-next-line
        type B = any; // Should remain any
        type C = any; // Should be unknown
      `,
      expected: dedent`
        type A = unknown; // Should be unknown
        // transformer-ignore-next-line
        type B = any; // Should remain any
        type C = unknown; // Should be unknown
      `,
    },
    {
      name: 'File scope transformer-ignore',
      source: dedent`
        /* transformer-ignore */
        type A = any; // Should remain any
        type B = any; // Should remain any
        type C = any; // Should remain any
      `,
      expected: dedent`
        /* transformer-ignore */
        type A = any; // Should remain any
        type B = any; // Should remain any
        type C = any; // Should remain any
      `,
    },
  ])('$name', testFn);
});
