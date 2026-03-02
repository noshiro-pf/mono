/* eslint-disable tree-shakable/import-star */
/* eslint-disable vitest/expect-expect */
import dedent from 'dedent';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginTypeScript from 'prettier/plugins/typescript';
import * as prettier from 'prettier/standalone';
import { appendAsConstTransformer } from './append-as-const.mjs';
import { convertToReadonlyTransformer } from './convert-to-readonly.mjs';
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
    transformSourceCode(source, false, [
      replaceAnyWithUnknownTransformer(),
      appendAsConstTransformer(),
      convertToReadonlyTransformer(),
    ]),
  );

  const expectedFormatted = await formatter(expected);

  expect(transformed).toBe(expectedFormatted);
};

const formatter = (code: string): Promise<string> =>
  prettier.format(code, {
    parser: 'typescript',
    plugins: [prettierPluginTypeScript, prettierPluginEstree],
  });

describe('Transformer-specific ignore comments (Integration)', () => {
  test.each([
    {
      name: 'Ignore specific transformer on next line',
      source: dedent`
        // transformer-ignore-next-line replace-any-with-unknown
        type A = any; // Should remain any
        const b = [1, 2, 3]; // Should have as const
        type C = number[]; // Should be readonly
      `,
      expected: dedent`
        // transformer-ignore-next-line replace-any-with-unknown
        type A = any; // Should remain any
        const b = [1, 2, 3] as const; // Should have as const
        type C = readonly number[]; // Should be readonly
      `,
    },
    {
      name: 'ts-codemod-ignore-next-line pattern',
      source: dedent`
        // ts-codemod-ignore-next-line replace-any-with-unknown
        type A = any; // Should remain any
        const b = [1, 2, 3]; // Should have as const
      `,
      expected: dedent`
        // ts-codemod-ignore-next-line replace-any-with-unknown
        type A = any; // Should remain any
        const b = [1, 2, 3] as const; // Should have as const
      `,
    },
    {
      name: 'codemod-ignore-next-line pattern',
      source: dedent`
        // codemod-ignore-next-line replace-any-with-unknown
        type A = any; // Should remain any
        type B = number[];
      `,
      expected: dedent`
        // codemod-ignore-next-line replace-any-with-unknown
        type A = any; // Should remain any
        type B = readonly number[];
      `,
    },
    {
      name: 'transform-ignore-next-line pattern',
      source: dedent`
        // transform-ignore-next-line append-as-const
        const b = [1, 2, 3]; // Should remain without as const
        type A = any;
      `,
      expected: dedent`
        // transform-ignore-next-line append-as-const
        const b = [1, 2, 3]; // Should remain without as const
        type A = unknown;
      `,
    },
    {
      name: 'Ignore specific transformer for entire file',
      source: dedent`
        /* transformer-ignore replace-any-with-unknown */
        type A = any; // Should remain any
        const b = [1, 2, 3]; // Should have as const
        type C = number[]; // Should be readonly
        type D = any; // Should remain any
      `,
      expected: dedent`
        /* transformer-ignore replace-any-with-unknown */
        type A = any; // Should remain any
        const b = [1, 2, 3] as const; // Should have as const
        type C = readonly number[]; // Should be readonly
        type D = any; // Should remain any
      `,
    },
    {
      name: 'ts-codemod-ignore for entire file',
      source: dedent`
        /* ts-codemod-ignore replace-any-with-unknown */
        type A = any; // Should remain any
        const b = [1, 2, 3]; // Should have as const
        type D = any; // Should remain any
      `,
      expected: dedent`
        /* ts-codemod-ignore replace-any-with-unknown */
        type A = any; // Should remain any
        const b = [1, 2, 3] as const; // Should have as const
        type D = any; // Should remain any
      `,
    },
    {
      name: 'codemod-ignore for entire file',
      source: dedent`
        /* codemod-ignore convert-to-readonly */
        type A = any;
        const b = [1, 2, 3];
        type C = number[]; // Should remain mutable
      `,
      expected: dedent`
        /* codemod-ignore convert-to-readonly */
        type A = unknown;
        const b = [1, 2, 3] as const;
        type C = number[]; // Should remain mutable
      `,
    },
    {
      name: 'transform-ignore for entire file',
      source: dedent`
        /* transform-ignore append-as-const */
        type A = any;
        const b = [1, 2, 3]; // Should remain without as const
        type C = number[];
      `,
      expected: dedent`
        /* transform-ignore append-as-const */
        type A = unknown;
        const b = [1, 2, 3]; // Should remain without as const
        type C = readonly number[];
      `,
    },
    {
      name: 'Ignore multiple specific transformers on next line',
      source: dedent`
        type A = any;
        // transformer-ignore-next-line replace-any-with-unknown, append-as-const
        type B = any;
        const c = [1, 2, 3];
        type D = number[];
      `,
      expected: dedent`
        type A = unknown;
        // transformer-ignore-next-line replace-any-with-unknown, append-as-const
        type B = any;
        const c = [1, 2, 3] as const;
        type D = readonly number[];
      `,
    },
    {
      name: 'Ignore multiple specific transformers for entire file',
      source: dedent`
        /* transformer-ignore replace-any-with-unknown, convert-to-readonly */
        type A = any; // Should remain any
        const b = [1, 2, 3]; // Should have as const
        type C = number[]; // Should remain mutable
        type D = any; // Should remain any
      `,
      expected: dedent`
        /* transformer-ignore replace-any-with-unknown, convert-to-readonly */
        type A = any; // Should remain any
        const b = [1, 2, 3] as const; // Should have as const
        type C = number[]; // Should remain mutable
        type D = any; // Should remain any
      `,
    },
    {
      name: 'Different ignore comments for different lines',
      source: dedent`
        type A = any;
        // transformer-ignore-next-line replace-any-with-unknown
        type B = any;
        const c = [1, 2, 3];
        // transformer-ignore-next-line append-as-const
        const d = [4, 5, 6];
        type E = number[];
        // transformer-ignore-next-line convert-to-readonly
        type F = string[];
      `,
      expected: dedent`
        type A = unknown;
        // transformer-ignore-next-line replace-any-with-unknown
        type B = any;
        const c = [1, 2, 3] as const;
        // transformer-ignore-next-line append-as-const
        const d = [4, 5, 6];
        type E = readonly number[];
        // transformer-ignore-next-line convert-to-readonly
        type F = string[];
      `,
    },
    {
      name: 'Wrong transformer name should not affect any transformer',
      source: dedent`
        // transformer-ignore-next-line non-existent-transformer
        type A = any; // Should be unknown
        const b = [1, 2, 3]; // Should have as const
        type C = number[]; // Should be readonly
      `,
      expected: dedent`
        // transformer-ignore-next-line non-existent-transformer
        type A = unknown; // Should be unknown
        const b = [1, 2, 3] as const; // Should have as const
        type C = readonly number[]; // Should be readonly
      `,
    },
    {
      name: 'Ignore all transformers on next line (no transformer specified)',
      source: dedent`
        type A = any;
        // transformer-ignore-next-line
        type B = any;
        const c = [1, 2, 3];
        type D = number[];
      `,
      expected: dedent`
        type A = unknown;
        // transformer-ignore-next-line
        type B = any;
        const c = [1, 2, 3] as const;
        type D = readonly number[];
      `,
    },
    {
      name: 'Ignore all transformers for entire file (no transformer specified)',
      source: dedent`
        /* transformer-ignore */
        type A = any; // Should remain any
        const b = [1, 2, 3]; // Should remain without as const
        type C = number[]; // Should remain mutable
      `,
      expected: dedent`
        /* transformer-ignore */
        type A = any; // Should remain any
        const b = [1, 2, 3]; // Should remain without as const
        type C = number[]; // Should remain mutable
      `,
    },
    {
      name: 'ts-codemod-ignore for entire file',
      source: dedent`
        /* ts-codemod-ignore replace-any-with-unknown */
        type A = any; // Should remain any
        const b = [1, 2, 3]; // Should have as const
        type D = any; // Should remain any
      `,
      expected: dedent`
        /* ts-codemod-ignore replace-any-with-unknown */
        type A = any; // Should remain any
        const b = [1, 2, 3] as const; // Should have as const
        type D = any; // Should remain any
      `,
    },
    {
      name: 'codemod-ignore for entire file',
      source: dedent`
        /* codemod-ignore convert-to-readonly */
        type A = any;
        const b = [1, 2, 3];
        type C = number[]; // Should remain mutable
      `,
      expected: dedent`
        /* codemod-ignore convert-to-readonly */
        type A = unknown;
        const b = [1, 2, 3] as const;
        type C = number[]; // Should remain mutable
      `,
    },
    {
      name: 'transform-ignore for entire file',
      source: dedent`
        /* transform-ignore append-as-const */
        type A = any;
        const b = [1, 2, 3]; // Should remain without as const
        type C = number[];
      `,
      expected: dedent`
        /* transform-ignore append-as-const */
        type A = unknown;
        const b = [1, 2, 3]; // Should remain without as const
        type C = readonly number[];
      `,
    },
  ])('$name', testFn);
});
