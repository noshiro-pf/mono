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
      tsconfigRootDir: `${import.meta.dirname}/../..`,
    },
  },
});

describe('prefer-non-mutating-array-method', () => {
  tester.run('prefer-non-mutating-array-method', preferNonMutatingArrayMethod, {
    valid: [
      {
        // `splice` returns the removed elements and `toSpliced` the array
        // without them, so `toSpliced` is never the rewrite; `slice` has the
        // same value only for the shapes the rule fixes.
        name: 'splice on a copy whose value slice does not have is left alone',
        code: dedent`
          declare const x: readonly number[];
          declare const args: readonly [number, number];
          declare const n: number;
          declare const f: () => number;
          const a = Array.from(x).splice(1, 0, 10, 20);
          Array.from(x).splice(...args);
          const b = Array.from(x).splice(-3, 1);
          const c = Array.from(x).splice(1, n);
          const d = Array.from(x).splice(f());
          const e = Array.from(x).splice();
        `,
      },
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
        name: 'Array.from(array).fill(v) → Array.from(array, () => v)',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).fill(0);
        `,
        output: dedent`
          declare const x: readonly number[];
          const y = Array.from(x, () => 0);
        `,
        errors: [{ messageId: 'preferArrayFromMapFunction' }],
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
          const y = Array.from(x, () => v);
        `,
        errors: [{ messageId: 'preferArrayFromMapFunction' }],
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

describe('prefer-non-mutating-array-method through type wrappers', () => {
  tester.run('prefer-non-mutating-array-method', preferNonMutatingArrayMethod, {
    valid: [
      {
        name: 'a cast does not make a Set an array',
        code: dedent`
          declare const s: ReadonlySet<number>;
          Array.from(s as unknown as number[]).sort();
        `,
      },
      {
        name: 'a cast does not make a fill value safe to re-evaluate',
        code: dedent`
          declare const xs: readonly number[];
          declare const f: () => number;
          const y = Array.from(xs).fill(f() as number);
        `,
      },
      {
        name: 'a cast widening an array to an iterable is the author saying it may not be an array',
        code: dedent`
          declare const xs: readonly number[];
          const y = Array.from(xs as Iterable<number>).sort();
        `,
      },
      {
        name: 'a `satisfies` the original array does not meet keeps the copy',
        code: dedent`
          declare const xs: readonly number[];
          const y = (Array.from(xs) satisfies number[]).sort();
        `,
      },
    ],
    invalid: [
      {
        name: 'an argument that is an array at every layer',
        code: dedent`
          declare const xs: number[];
          const y = Array.from(xs as readonly number[]).sort();
        `,
        output: dedent`
          declare const xs: number[];
          const y = (xs as readonly number[]).toSorted();
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
      {
        name: 'the `Array.from()` call is wrapped in `as` or `!`',
        code: dedent`
          declare const xs: readonly number[];
          const y = (Array.from(xs) as number[]).sort();
          const z = Array.from(xs)!.reverse();
        `,
        output: dedent`
          declare const xs: readonly number[];
          const y = (xs as number[]).toSorted();
          const z = xs!.toReversed();
        `,
        errors: [
          { messageId: 'preferNonMutatingMethod' },
          { messageId: 'preferNonMutatingMethod' },
        ],
      },
      {
        name: 'a `satisfies` the original array meets too',
        code: dedent`
          declare const xs: number[];
          const y = (Array.from(xs) satisfies readonly number[]).sort();
        `,
        output: dedent`
          declare const xs: number[];
          const y = (xs satisfies readonly number[]).toSorted();
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
      {
        name: 'a fill value wrapped in `satisfies`',
        code: dedent`
          declare const xs: readonly number[];
          const y = Array.from(xs).fill(0 satisfies number);
        `,
        output: dedent`
          declare const xs: readonly number[];
          const y = Array.from(xs, () => 0 satisfies number);
        `,
        errors: [{ messageId: 'preferArrayFromMapFunction' }],
      },
    ],
  });
});

describe('prefer-non-mutating-array-method with parenthesized operands', () => {
  tester.run('prefer-non-mutating-array-method', preferNonMutatingArrayMethod, {
    valid: [],
    invalid: [
      {
        name: 'a comma expression argument keeps its parentheses',
        code: dedent`
          declare const xs: readonly number[];
          declare const cmp: (a: number, b: number) => number;
          const y = Array.from(xs).sort((0, cmp));
        `,
        output: dedent`
          declare const xs: readonly number[];
          declare const cmp: (a: number, b: number) => number;
          const y = xs.toSorted((0, cmp));
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
    ],
  });
});

describe('prefer-non-mutating-array-method and splice', () => {
  tester.run('prefer-non-mutating-array-method', preferNonMutatingArrayMethod, {
    valid: [],
    invalid: (
      [
        ['splice(1)', 'slice(1)'],
        ['splice(-2)', 'slice(-2)'],
        ['splice(0, 2)', 'slice(0, 2)'],
        ['splice(2, 3)', 'slice(2, 5)'],
        ['splice(1, 0)', 'slice(1, 1)'],
        ['splice(1 as number, 2)', 'slice(1, 3)'],
        ['splice(+1)', 'slice(+1)'],
        ['splice(s)', 'slice(s)'],
      ] as const
    ).map(([call, replacement]) => ({
      name: `the removed elements of ${call} are ${replacement} of the original`,
      code: dedent`
        declare const x: readonly number[];
        declare const s: number;
        const y = Array.from(x).${call};
      `,
      output: dedent`
        declare const x: readonly number[];
        declare const s: number;
        const y = x.${replacement};
      `,
      errors: [{ messageId: 'preferNonMutatingMethod' as const }],
    })),
  });
});

describe('prefer-non-mutating-array-method and a comment in a splice', () => {
  tester.run('prefer-non-mutating-array-method', preferNonMutatingArrayMethod, {
    valid: [],
    invalid: [
      {
        name: 'a comment among two literal arguments is reported without a fix',
        code: dedent`
          declare const x: readonly number[];
          const y = Array.from(x).splice(/* the header row */ 1, 2);
        `,
        output: null,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
    ],
  });
});

// `Array.from(xs)` copies `xs` before the arguments are evaluated, and
// `xs.toSorted(…)` reads `xs` after them, so an argument that may change `xs`
// makes the rewrite a suggestion.
describe('prefer-non-mutating-array-method and an argument with an effect', () => {
  tester.run('prefer-non-mutating-array-method', preferNonMutatingArrayMethod, {
    valid: [],
    invalid: [
      {
        name: 'a comparator returned by a call is suggested',
        code: dedent`
          const xs = [3, 1];
          const cmpAfterPush = () => {
            xs.push(2);
            return (a: number, b: number) => a - b;
          };
          const sorted = Array.from(xs).sort(cmpAfterPush());
        `,
        output: null,
        errors: [
          {
            messageId: 'preferNonMutatingMethodUnlessArgumentChangesArray',
            suggestions: [
              {
                messageId: 'useNonMutatingMethod',
                output: dedent`
                  const xs = [3, 1];
                  const cmpAfterPush = () => {
                    xs.push(2);
                    return (a: number, b: number) => a - b;
                  };
                  const sorted = xs.toSorted(cmpAfterPush());
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'an assignment in the argument is suggested',
        code: dedent`
          let mut_cmp: ((a: number, b: number) => number) | undefined;
          declare const xs: readonly number[];
          const sorted = Array.from(xs).sort((mut_cmp = (a, b) => a - b));
        `,
        output: null,
        errors: [
          {
            messageId: 'preferNonMutatingMethodUnlessArgumentChangesArray',
            suggestions: [
              {
                messageId: 'useNonMutatingMethod',
                output: dedent`
                  let mut_cmp: ((a: number, b: number) => number) | undefined;
                  declare const xs: readonly number[];
                  const sorted = xs.toSorted(mut_cmp = (a, b) => a - b);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'a function expression, which runs nothing when evaluated, is still fixed',
        code: dedent`
          declare const xs: readonly number[];
          const sorted = Array.from(xs).sort((a, b) => a - b);
        `,
        output: dedent`
          declare const xs: readonly number[];
          const sorted = xs.toSorted((a, b) => a - b);
        `,
        errors: [{ messageId: 'preferNonMutatingMethod' }],
      },
    ],
  });
});

// `Array.from(xs)` turns a hole of a sparse array into `undefined`, which `fill`
// overwrites, while `xs.map` skips a hole and keeps it; a mapping function
// given to `Array.from` is called for every index, holes included.
describe('prefer-non-mutating-array-method and fill on a sparse array', () => {
  tester.run('prefer-non-mutating-array-method', preferNonMutatingArrayMethod, {
    valid: [],
    invalid: [
      {
        name: 'Array.from(Array(n)).fill(v) keeps filling every slot',
        code: dedent`
          const zeros = Array.from(Array(3)).fill(0);
        `,
        output: dedent`
          const zeros = Array.from(Array(3), () => 0);
        `,
        errors: [{ messageId: 'preferArrayFromMapFunction' }],
      },
      {
        name: 'new Array(n) is filled the same way',
        code: dedent`
          const zeros = Array.from(new Array(3)).fill(0);
        `,
        output: dedent`
          const zeros = Array.from(new Array(3), () => 0);
        `,
        errors: [{ messageId: 'preferArrayFromMapFunction' }],
      },
      {
        name: 'a type wrapper around the call is kept',
        code: dedent`
          declare const xs: readonly number[];
          const y = (Array.from(xs) as number[]).fill(0);
        `,
        output: dedent`
          declare const xs: readonly number[];
          const y = (Array.from(xs, () => 0) as number[]);
        `,
        errors: [{ messageId: 'preferArrayFromMapFunction' }],
      },
      {
        name: 'an optional call is dropped with its ?.',
        code: dedent`
          declare const xs: readonly number[];
          const y = Array.from(xs)?.fill(0);
        `,
        output: dedent`
          declare const xs: readonly number[];
          const y = Array.from(xs, () => 0);
        `,
        errors: [{ messageId: 'preferArrayFromMapFunction' }],
      },
      {
        name: 'a parenthesized argument and a trailing comma',
        code: dedent`
          declare const xs: readonly number[];
          const y = Array.from((xs),).fill(0);
        `,
        output: dedent`
          declare const xs: readonly number[];
          const y = Array.from((xs), () => 0);
        `,
        errors: [{ messageId: 'preferArrayFromMapFunction' }],
      },
    ],
  });
});
