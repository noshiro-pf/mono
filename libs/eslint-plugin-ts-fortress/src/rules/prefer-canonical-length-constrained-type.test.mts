import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferCanonicalLengthConstrainedType } from './prefer-canonical-length-constrained-type.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

describe('prefer-canonical-length-constrained-type', () => {
  tester.run(
    'prefer-canonical-length-constrained-type',
    preferCanonicalLengthConstrainedType,
    {
      valid: [
        {
          name: 'ignores other minimum lengths',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.minLengthArray(2, t.string());
          `,
        },
        {
          name: 'ignores a non-literal bound',
          code: dedent`
            import * as t from 'ts-fortress';

            const n = 1;
            const T = t.minLengthArray(n, t.string());
          `,
        },
        {
          name: 'ignores minLengthTuple(1, …), which has no tuple counterpart',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.minLengthTuple(1, t.string());
          `,
        },
        {
          name: 'ignores a non-degenerate boundedLengthTuple range',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.boundedLengthTuple(1, 3, t.string());
          `,
        },
        {
          name: 'ignores boundedLengthTuple bounds above the structural cap',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.boundedLengthTuple(12, 12, t.string());
          `,
        },
        {
          name: 'ignores maxLengthTuple with a non-degenerate bound',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.maxLengthTuple(3, t.string());
          `,
        },
        {
          name: 'leaves the branded *Array family alone',
          code: dedent`
            import * as t from 'ts-fortress';

            const A = t.boundedLengthArray(0, 3, t.string());
            const B = t.boundedLengthArray(3, 3, t.string());
            const C = t.minLengthArray(0, t.string());
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
          name: 'ignores an options object it cannot read',
          code: dedent`
            import * as t from 'ts-fortress';

            const options = { defaultValue: ['a'] };
            const T = t.minLengthArray(1, t.string(), options);
          `,
        },
        {
          name: 'ignores explicit type arguments',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.minLengthArray<string, 1>(1, t.string());
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
          name: 'ignores already-canonical calls',
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
        {
          name: 'stays silent when the target name is shadowed at the call site',
          code: dedent`
            import { minLengthTuple } from 'ts-fortress';

            const build = () => {
              const array = (x) => x;
              return minLengthTuple(0, 'x');
            };
          `,
        },
      ],
      invalid: [
        {
          name: 'minLengthArray(1, x) becomes nonEmptyArray(x)',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.minLengthArray(1, t.string());
          `,
          output: dedent`
            import * as t from 'ts-fortress';

            const T = t.nonEmptyArray(t.string());
          `,
          errors: [{ messageId: 'useCanonicalType' }],
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
          errors: [{ messageId: 'useCanonicalType' }],
        },
        {
          name: 'minLengthTuple(0, x) becomes array(x)',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.minLengthTuple(0, t.string());
          `,
          output: dedent`
            import * as t from 'ts-fortress';

            const T = t.array(t.string());
          `,
          errors: [{ messageId: 'useCanonicalType' }],
        },
        {
          name: 'maxLengthTuple(0, x) becomes fixedLengthTuple(0, x)',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.maxLengthTuple(0, t.string());
          `,
          output: dedent`
            import * as t from 'ts-fortress';

            const T = t.fixedLengthTuple(0, t.string());
          `,
          errors: [{ messageId: 'useCanonicalType' }],
        },
        {
          name: 'boundedLengthTuple(n, n, x) becomes fixedLengthTuple(n, x)',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.boundedLengthTuple(3, 3, t.string());
          `,
          output: dedent`
            import * as t from 'ts-fortress';

            const T = t.fixedLengthTuple(3, t.string());
          `,
          errors: [{ messageId: 'useCanonicalType' }],
        },
        {
          name: 'boundedLengthTuple(0, n, x) becomes maxLengthTuple(n, x)',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.boundedLengthTuple(0, 4, t.string());
          `,
          output: dedent`
            import * as t from 'ts-fortress';

            const T = t.maxLengthTuple(4, t.string());
          `,
          errors: [{ messageId: 'useCanonicalType' }],
        },
        {
          name: 'boundedLengthTuple(0, 0, x) prefers fixedLengthTuple',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.boundedLengthTuple(0, 0, t.string());
          `,
          output: dedent`
            import * as t from 'ts-fortress';

            const T = t.fixedLengthTuple(0, t.string());
          `,
          errors: [{ messageId: 'useCanonicalType' }],
        },
        {
          name: 'keeps the options object when dropping a bound',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.boundedLengthTuple(0, 2, t.string(), { typeName: 'Xs' });
          `,
          output: dedent`
            import * as t from 'ts-fortress';

            const T = t.maxLengthTuple(2, t.string(), { typeName: 'Xs' });
          `,
          errors: [{ messageId: 'useCanonicalType' }],
        },
        {
          name: 'keeps a defaultValue the rewrite types identically',
          code: dedent`
            import * as t from 'ts-fortress';

            const T = t.boundedLengthTuple(2, 2, t.string(), {
              defaultValue: ['a', 'b'],
            });
          `,
          output: dedent`
            import * as t from 'ts-fortress';

            const T = t.fixedLengthTuple(2, t.string(), {
              defaultValue: ['a', 'b'],
            });
          `,
          errors: [{ messageId: 'useCanonicalType' }],
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
          errors: [{ messageId: 'useCanonicalType' }],
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
          errors: [{ messageId: 'useCanonicalType' }],
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
          errors: [{ messageId: 'useCanonicalType' }],
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
          errors: [{ messageId: 'useCanonicalType' }],
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
            { messageId: 'useCanonicalType' },
            { messageId: 'useCanonicalType' },
            { messageId: 'useCanonicalType' },
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
            { messageId: 'useCanonicalType' },
            { messageId: 'useCanonicalType' },
          ],
        },
        {
          name: 'adds every missing import in one pass',
          code: dedent`
            import { boundedLengthTuple, minLengthArray, string } from 'ts-fortress';

            const A = minLengthArray(1, string());
            const B = boundedLengthTuple(2, 2, string());
            const C = boundedLengthTuple(0, 5, string());
          `,
          output: dedent`
            import { nonEmptyArray } from 'ts-fortress';
            import { fixedLengthTuple } from 'ts-fortress';
            import { maxLengthTuple } from 'ts-fortress';
            import { boundedLengthTuple, minLengthArray, string } from 'ts-fortress';

            const A = nonEmptyArray(string());
            const B = fixedLengthTuple(2, string());
            const C = maxLengthTuple(5, string());
          `,
          errors: [
            { messageId: 'useCanonicalType' },
            { messageId: 'useCanonicalType' },
            { messageId: 'useCanonicalType' },
          ],
        },
        {
          name: 'still fixes the namespace call when a named one is blocked',
          code: dedent`
            import * as t from 'ts-fortress';
            import { minLengthTuple } from 'ts-fortress';

            const array = (x) => x;
            const A = minLengthTuple(0, 'x');
            const B = t.minLengthTuple(0, t.string());
          `,
          output: dedent`
            import * as t from 'ts-fortress';
            import { minLengthTuple } from 'ts-fortress';

            const array = (x) => x;
            const A = minLengthTuple(0, 'x');
            const B = t.array(t.string());
          `,
          errors: [{ messageId: 'useCanonicalType' }],
        },
      ],
    },
  );
});
