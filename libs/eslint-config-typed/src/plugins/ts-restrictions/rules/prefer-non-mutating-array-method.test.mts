import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferNonMutatingArrayMethod } from './prefer-non-mutating-array-method.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

describe('prefer-non-mutating-array-method', () => {
  tester.run('prefer-non-mutating-array-method', preferNonMutatingArrayMethod, {
    valid: [
      {
        name: 'Array.from on a Set is a genuine conversion, not a copy',
        code: dedent`
          declare const x: Set<number>;
          const y = Array.from(x).sort();
        `,
      },
      {
        name: 'Array.from on a generic iterable is a genuine conversion',
        code: dedent`
          declare const x: Iterable<number>;
          const y = Array.from(x).reverse();
        `,
      },
      {
        name: 'Array.from with a map function is not a plain copy',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x, (n) => n + 1).sort();
        `,
      },
      {
        name: 'non-mutating method on Array.from is out of scope of this rule',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).toSorted();
        `,
      },
      {
        name: 'mutating method directly on an array is out of scope',
        code: dedent`
          declare const x: number[];
          x.sort();
        `,
      },
      {
        name: 'fill with start/end arguments has no direct counterpart',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).fill(0, 1, 2);
        `,
      },
      {
        name: 'fill with a re-evaluation-unsafe value keeps the copy',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).fill({ id: 1 });
        `,
      },
      {
        name: 'sort with spread arguments is left untouched',
        code: dedent`
          declare const x: readonly number[];
          declare const cmpFns: readonly [(a: number, b: number) => number];
          const y = Array.from(x).sort(...cmpFns);
        `,
      },
      {
        name: 'any is treated conservatively as possibly non-array',
        code: dedent`
          declare const x: any;
          const y = Array.from(x).sort();
        `,
      },
      {
        name: 'copyWithin has no non-mutating counterpart',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).copyWithin(0, 1);
        `,
      },
    ],
    invalid: [
      {
        name: 'Array.from(array).reverse() → array.toReversed()',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).reverse();
        `,
        output: dedent`
          declare const x: readonly number[];
          const y = x.toReversed();
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
      {
        name: 'Array.from(array).sort() → array.toSorted()',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).sort();
        `,
        output: dedent`
          declare const x: readonly number[];
          const y = x.toSorted();
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
      {
        name: 'Array.from(array).sort(cmp) keeps the comparator',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).sort((a, b) => a - b);
        `,
        output: dedent`
          declare const x: readonly number[];
          const y = x.toSorted((a, b) => a - b);
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
      {
        name: 'Array.from(array).splice(args) → array.toSpliced(args)',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).splice(0, 1);
        `,
        output: dedent`
          declare const x: readonly number[];
          const y = x.toSpliced(0, 1);
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
      {
        name: 'Array.from(array).splice with insertion arguments',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).splice(1, 0, 10, 20);
        `,
        output: dedent`
          declare const x: readonly number[];
          const y = x.toSpliced(1, 0, 10, 20);
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
      {
        name: 'Array.from(array).fill(v) → array.map(() => v)',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).fill(0);
        `,
        output: dedent`
          declare const x: readonly number[];
          const y = x.map(() => 0);
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
      {
        name: 'fill with an identifier value is safe to re-evaluate',
        code: dedent`
          declare const x: readonly number[];
          declare const v: string;
          const y = Array.from(x).fill(v);
        `,
        output: dedent`
          declare const x: readonly number[];
          declare const v: string;
          const y = x.map(() => v);
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
      {
        name: 'mutable array receiver is also targeted',
        code: dedent`
          declare const x: number[];
          const y = Array.from(x).sort();
        `,
        output: dedent`
          declare const x: number[];
          const y = x.toSorted();
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
      {
        name: 'low-precedence argument is wrapped in parentheses',
        code: dedent`
          declare const a: readonly number[];
          declare const b: readonly number[];
          declare const cond: boolean;
          const y = Array.from(cond ? a : b).sort();
        `,
        output: dedent`
          declare const a: readonly number[];
          declare const b: readonly number[];
          declare const cond: boolean;
          const y = (cond ? a : b).toSorted();
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
      {
        name: 'argument is a member expression',
        code: dedent`
          declare const obj: { items: readonly number[] };
          const y = Array.from(obj.items).reverse();
        `,
        output: dedent`
          declare const obj: { items: readonly number[] };
          const y = obj.items.toReversed();
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
    ],
  });
});
