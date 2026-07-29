import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferNonEmptyArray } from './prefer-non-empty-array.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

describe('prefer-non-empty-array', () => {
  tester.run('prefer-non-empty-array', preferNonEmptyArray, {
    valid: [
      {
        name: 'ignores other minimum lengths',
        code: dedent`
          import * as t from 'ts-fortress';

          const T = t.minLengthArray(2, t.string());
        `,
      },
      {
        name: 'ignores a non-literal minimum length',
        code: dedent`
          import * as t from 'ts-fortress';

          const n = 1;
          const T = t.minLengthArray(n, t.string());
        `,
      },
      {
        name: 'ignores minLengthTuple (a structurally different type)',
        code: dedent`
          import * as t from 'ts-fortress';

          const T = t.minLengthTuple(1, t.string());
        `,
      },
      {
        name: 'ignores a minLengthArray that is not from ts-fortress',
        code: dedent`
          import { minLengthArray } from './my-helpers.mjs';

          const T = minLengthArray(1, 'x');
        `,
      },
      {
        name: 'ignores calls that pass a defaultValue',
        code: dedent`
          import * as t from 'ts-fortress';

          const T = t.minLengthArray(1, t.string(), { defaultValue: ['a'] });
        `,
      },
      {
        name: 'ignores spread arguments',
        code: dedent`
          import * as t from 'ts-fortress';

          const args = [1, t.string()] as const;
          const T = t.minLengthArray(...args);
        `,
      },
      {
        name: 'ignores already-migrated calls',
        code: dedent`
          import * as t from 'ts-fortress';

          const T = t.nonEmptyArray(t.string());
        `,
      },
      {
        name: 'stays silent when a named fix would shadow a local binding',
        code: dedent`
          import { minLengthArray } from 'ts-fortress';

          const nonEmptyArray = (x) => x;
          const T = minLengthArray(1, 'x');
        `,
      },
    ],
    invalid: [
      {
        name: 'rewrites a namespace call',
        code: dedent`
          import * as t from 'ts-fortress';

          const T = t.minLengthArray(1, t.string());
        `,
        output: dedent`
          import * as t from 'ts-fortress';

          const T = t.nonEmptyArray(t.string());
        `,
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'keeps a typeName-only options object',
        code: dedent`
          import * as t from 'ts-fortress';

          const T = t.minLengthArray(1, t.string(), { typeName: 'Tags' });
        `,
        output: dedent`
          import * as t from 'ts-fortress';

          const T = t.nonEmptyArray(t.string(), { typeName: 'Tags' });
        `,
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'rewrites a named import and adds the missing import',
        code: dedent`
          import { minLengthArray, string } from 'ts-fortress';

          const T = minLengthArray(1, string());
        `,
        output: dedent`
          import { nonEmptyArray } from 'ts-fortress';
          import { minLengthArray, string } from 'ts-fortress';

          const T = nonEmptyArray(string());
        `,
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'reuses an existing nonEmptyArray import',
        code: dedent`
          import { minLengthArray, nonEmptyArray, string } from 'ts-fortress';

          const A = nonEmptyArray(string());
          const B = minLengthArray(1, string());
        `,
        output: dedent`
          import { minLengthArray, nonEmptyArray, string } from 'ts-fortress';

          const A = nonEmptyArray(string());
          const B = nonEmptyArray(string());
        `,
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'reuses an aliased nonEmptyArray import',
        code: dedent`
          import { minLengthArray, nonEmptyArray as nea, string } from 'ts-fortress';

          const T = minLengthArray(1, string());
        `,
        output: dedent`
          import { minLengthArray, nonEmptyArray as nea, string } from 'ts-fortress';

          const T = nea(string());
        `,
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'resolves an aliased minLengthArray import',
        code: dedent`
          import { minLengthArray as mla, string } from 'ts-fortress';

          const T = mla(1, string());
        `,
        output: dedent`
          import { nonEmptyArray } from 'ts-fortress';
          import { minLengthArray as mla, string } from 'ts-fortress';

          const T = nonEmptyArray(string());
        `,
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'rewrites nested and repeated calls',
        code: dedent`
          import * as t from 'ts-fortress';

          const T = t.record({
            tags: t.minLengthArray(1, t.string()),
            rows: t.minLengthArray(1, t.minLengthArray(1, t.number())),
          });
        `,
        output: dedent`
          import * as t from 'ts-fortress';

          const T = t.record({
            tags: t.nonEmptyArray(t.string()),
            rows: t.nonEmptyArray(t.nonEmptyArray(t.number())),
          });
        `,
        errors: [
          { messageId: 'useNonEmptyArray' },
          { messageId: 'useNonEmptyArray' },
          { messageId: 'useNonEmptyArray' },
        ],
      },
      {
        name: 'adds the named import only once per file',
        code: dedent`
          import { minLengthArray, number, string } from 'ts-fortress';

          const A = minLengthArray(1, string());
          const B = minLengthArray(1, number());
        `,
        output: dedent`
          import { nonEmptyArray } from 'ts-fortress';
          import { minLengthArray, number, string } from 'ts-fortress';

          const A = nonEmptyArray(string());
          const B = nonEmptyArray(number());
        `,
        errors: [
          { messageId: 'useNonEmptyArray' },
          { messageId: 'useNonEmptyArray' },
        ],
      },
    ],
  });
});
