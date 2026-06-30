/* eslint-disable tree-shakable/import-star */
/* eslint-disable vitest/expect-expect */
import dedent from 'dedent';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginTypeScript from 'prettier/plugins/typescript';
import * as prettier from 'prettier/standalone';
import { appendAsConstTransformer } from './append-as-const.mjs';
import { convertToReadonlyTransformer } from './convert-to-readonly.mjs';
import { type TsMorphTransformer } from './types.mjs';
import { transformSourceCode } from './transform-source-code.mjs';

const formatter = (code: string): Promise<string> =>
  prettier.format(code, {
    parser: 'typescript',
    plugins: [prettierPluginTypeScript, prettierPluginEstree],
  });

const testFn = async ({
  source,
  expected,
  transformers,
}: Readonly<{
  source: string;
  expected: string;
  transformers: readonly TsMorphTransformer[];
}>): Promise<void> => {
  const transformed = await formatter(
    transformSourceCode(source, false, transformers),
  );

  const expectedFormatted = await formatter(expected);

  expect(transformed).toBe(expectedFormatted);
};

describe('Pruning unnecessary ignore comments', () => {
  const allTransformers = [
    appendAsConstTransformer(),
    convertToReadonlyTransformer(),
  ] as const;

  test.each([
    {
      name: 'Removes a line comment that suppresses nothing',
      transformers: [convertToReadonlyTransformer()],
      source: dedent`
        // transformer-ignore-next-line convert-to-readonly
        type A = string;
      `,
      expected: dedent`
        type A = string;
      `,
    },
    {
      name: 'Keeps and canonicalizes a necessary line comment',
      transformers: [convertToReadonlyTransformer()],
      source: dedent`
        // codemod-ignore-next-line convert-to-readonly
        type A = number[];
      `,
      expected: dedent`
        // transformer-ignore-next-line convert-to-readonly
        type A = number[];
      `,
    },
    {
      name: 'Trims a redundant transformer name from the list',
      transformers: allTransformers,
      source: dedent`
        // transformer-ignore-next-line convert-to-readonly, append-as-const
        type A = number[];
      `,
      expected: dedent`
        // transformer-ignore-next-line convert-to-readonly
        type A = number[];
      `,
    },
    {
      name: 'Preserves names for transformers outside the current run',
      transformers: [convertToReadonlyTransformer()],
      source: dedent`
        // transformer-ignore-next-line append-as-const
        type A = number[];
      `,
      expected: dedent`
        // transformer-ignore-next-line append-as-const
        type A = readonly number[];
      `,
    },
    {
      name: 'Leaves apply-to-all (no name) comments untouched',
      transformers: [convertToReadonlyTransformer()],
      source: dedent`
        // transformer-ignore-next-line
        type A = number[];
      `,
      expected: dedent`
        // transformer-ignore-next-line
        type A = number[];
      `,
    },
    {
      name: 'Removes a trailing line comment that suppresses nothing',
      transformers: [convertToReadonlyTransformer()],
      source: dedent`
        const a = 1; // transformer-ignore-next-line convert-to-readonly
        type A = string;
      `,
      expected: dedent`
        const a = 1;
        type A = string;
      `,
    },
    {
      name: 'Removes an unnecessary file-level ignore comment',
      transformers: [convertToReadonlyTransformer()],
      source: dedent`
        /* transformer-ignore convert-to-readonly */
        type A = string;
      `,
      expected: dedent`
        type A = string;
      `,
    },
    {
      name: 'Keeps and canonicalizes a necessary file-level ignore comment',
      transformers: [convertToReadonlyTransformer()],
      source: dedent`
        /* ts-codemod-ignore convert-to-readonly */
        type A = number[];
      `,
      expected: dedent`
        /* transformer-ignore convert-to-readonly */
        type A = number[];
      `,
    },
  ])('$name', testFn);
});
