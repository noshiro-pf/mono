import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noUnnecessaryArrayFrom } from './no-unnecessary-array-from.mjs';

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

describe('no-unnecessary-array-from', () => {
  tester.run('no-unnecessary-array-from', noUnnecessaryArrayFrom, {
    valid: [
      {
        name: 'Array.from on a Set is required to get an array',
        code: dedent`
          declare const x: Set<number>;
          const y = Array.from(x).toSorted();
        `,
      },
      {
        name: 'Array.from on a Map is required to get an array',
        code: dedent`
          declare const x: Map<string, number>;
          const y = Array.from(x).toSorted();
        `,
      },
      {
        name: 'Array.from on a generic iterable is required',
        code: dedent`
          declare const x: Iterable<number>;
          const y = Array.from(x).toReversed();
        `,
      },
      {
        name: 'Array.from on a string is required',
        code: dedent`
          declare const x: string;
          const y = Array.from(x).toSorted();
        `,
      },
      {
        name: 'mutating method keeps the defensive Array.from copy',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).sort();
        `,
      },
      {
        name: 'reverse (mutating) keeps the defensive Array.from copy',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).reverse();
        `,
      },
      {
        name: 'fill (mutating) keeps the defensive Array.from copy',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).fill(0);
        `,
      },
      {
        name: 'splice (mutating) keeps the defensive Array.from copy',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).splice(0, 1);
        `,
      },
      {
        name: 'copyWithin (mutating) keeps the defensive Array.from copy',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).copyWithin(0, 1);
        `,
      },
      {
        name: 'push (mutating) keeps the defensive Array.from copy',
        code: dedent`
          declare const x: readonly number[];
          const mut_y = Array.from(x);
          mut_y.push(0);
        `,
      },
      {
        name: 'pop (mutating) keeps the defensive Array.from copy',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).pop();
        `,
      },
      {
        name: 'shift (mutating) keeps the defensive Array.from copy',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).shift();
        `,
      },
      {
        name: 'unshift (mutating) keeps the defensive Array.from copy',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).unshift(0);
        `,
      },
      {
        name: 'Array.from with a map function is not a redundant copy',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x, (n) => n + 1).toSorted();
        `,
      },
      {
        name: 'standalone Array.from copy (no chained method) is left untouched',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x);
        `,
      },
      {
        name: 'union of array and Set still needs Array.from',
        code: dedent`
          declare const x: readonly number[] | Set<number>;
          const y = Array.from(x).toSorted();
        `,
      },
      {
        name: 'any is treated conservatively as possibly non-array',
        code: dedent`
          declare const x: any;
          const y = Array.from(x).toSorted();
        `,
      },
      {
        name: 'unknown is treated conservatively as possibly non-array',
        code: dedent`
          declare const x: unknown;
          const y = Array.from(x as Iterable<number>).toSorted();
        `,
      },
      {
        name: 'method on a real array that is not Array.from is untouched',
        code: dedent`
          declare const x: readonly number[];
          const y = x.toSorted();
        `,
      },
    ],
    invalid: [
      {
        name: 'Array.from(array).toSorted() on a readonly array',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).toSorted();
        `,
        output: dedent`
          declare const x: readonly number[];
          const y = x.toSorted();
        `,
        errors: [{ messageId: 'unnecessaryArrayFrom' }],
      },
      {
        name: 'Array.from(array).toSorted() on a mutable array',
        code: dedent`
          declare const x: number[];
          const y = Array.from(x).toSorted();
        `,
        output: dedent`
          declare const x: number[];
          const y = x.toSorted();
        `,
        errors: [{ messageId: 'unnecessaryArrayFrom' }],
      },
      {
        name: 'Array.from(array).toReversed()',
        code: dedent`
          declare const x: readonly string[];
          const y = Array.from(x).toReversed();
        `,
        output: dedent`
          declare const x: readonly string[];
          const y = x.toReversed();
        `,
        errors: [{ messageId: 'unnecessaryArrayFrom' }],
      },
      {
        name: 'Array.from(array).toSpliced()',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).toSpliced(0, 1);
        `,
        output: dedent`
          declare const x: readonly number[];
          const y = x.toSpliced(0, 1);
        `,
        errors: [{ messageId: 'unnecessaryArrayFrom' }],
      },
      {
        name: 'Array.from(array).with()',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).with(0, 42);
        `,
        output: dedent`
          declare const x: readonly number[];
          const y = x.with(0, 42);
        `,
        errors: [{ messageId: 'unnecessaryArrayFrom' }],
      },
      {
        name: 'Array.from on a tuple type',
        code: dedent`
          declare const x: readonly [number, number, number];
          const y = Array.from(x).toSorted();
        `,
        output: dedent`
          declare const x: readonly [number, number, number];
          const y = x.toSorted();
        `,
        errors: [{ messageId: 'unnecessaryArrayFrom' }],
      },
      {
        name: 'argument is a member expression',
        code: dedent`
          declare const obj: { items: readonly number[] };
          const y = Array.from(obj.items).toSorted();
        `,
        output: dedent`
          declare const obj: { items: readonly number[] };
          const y = obj.items.toSorted();
        `,
        errors: [{ messageId: 'unnecessaryArrayFrom' }],
      },
      {
        name: 'argument is a call expression',
        code: dedent`
          declare const getItems: () => readonly number[];
          const y = Array.from(getItems()).toSorted();
        `,
        output: dedent`
          declare const getItems: () => readonly number[];
          const y = getItems().toSorted();
        `,
        errors: [{ messageId: 'unnecessaryArrayFrom' }],
      },
      {
        name: 'low-precedence argument is wrapped in parentheses',
        code: dedent`
          declare const a: readonly number[];
          declare const b: readonly number[];
          declare const cond: boolean;
          const y = Array.from(cond ? a : b).toSorted();
        `,
        output: dedent`
          declare const a: readonly number[];
          declare const b: readonly number[];
          declare const cond: boolean;
          const y = (cond ? a : b).toSorted();
        `,
        errors: [{ messageId: 'unnecessaryArrayFrom' }],
      },
      {
        name: 'union of two array types is safe to unwrap',
        code: dedent`
          declare const x: readonly number[] | readonly string[];
          const y = Array.from(x).toReversed();
        `,
        output: dedent`
          declare const x: readonly number[] | readonly string[];
          const y = x.toReversed();
        `,
        errors: [{ messageId: 'unnecessaryArrayFrom' }],
      },
    ],
  });
});
