/* eslint-disable tree-shakable/import-star */
/* eslint-disable vitest/expect-expect */
import dedent from 'dedent';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginTypeScript from 'prettier/plugins/typescript';
import * as prettier from 'prettier/standalone';
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
    transformSourceCode(source, false, [replaceAnyWithUnknownTransformer()]),
  );

  const expectedFormatted = await formatter(expected);

  expect(transformed).toBe(expectedFormatted);
};

const formatter = (code: string): Promise<string> =>
  prettier.format(code, {
    parser: 'typescript',
    plugins: [prettierPluginTypeScript, prettierPluginEstree],
  });

describe(replaceAnyWithUnknownTransformer, () => {
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
    {
      name: 'Transformer-specific ignore comment (next line)',
      source: dedent`
        type A = any;
        // transformer-ignore-next-line replace-any-with-unknown
        type B = any;
        type C = any;
      `,
      expected: dedent`
        type A = unknown;
        // transformer-ignore-next-line replace-any-with-unknown
        type B = any;
        type C = unknown;
      `,
    },
    {
      name: 'Transformer-specific ignore comment (file scope)',
      source: dedent`
        /* transformer-ignore replace-any-with-unknown */
        type A = any;
        type B = any;
      `,
      expected: dedent`
        /* transformer-ignore replace-any-with-unknown */
        type A = any;
        type B = any;
      `,
    },
    {
      name: 'Multiple transformers in ignore comment',
      source: dedent`
        type A = any;
        // transformer-ignore-next-line replace-any-with-unknown, append-as-const
        type B = any;
        type C = any;
      `,
      expected: dedent`
        type A = unknown;
        // transformer-ignore-next-line replace-any-with-unknown, append-as-const
        type B = any;
        type C = unknown;
      `,
    },
    {
      name: 'Wrong transformer name should not affect',
      source: dedent`
        type A = any;
        // transformer-ignore-next-line some-other-transformer
        type B = any;
        type C = any;
      `,
      expected: dedent`
        type A = unknown;
        // transformer-ignore-next-line some-other-transformer
        type B = unknown;
        type C = unknown;
      `,
    },
  ])('$name', testFn);
});
