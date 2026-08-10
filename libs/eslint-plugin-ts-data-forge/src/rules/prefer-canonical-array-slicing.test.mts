import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferCanonicalArraySlicing } from './prefer-canonical-array-slicing.mjs';

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

describe('prefer-canonical-array-slicing', () => {
  tester.run('prefer-canonical-array-slicing', preferCanonicalArraySlicing, {
    valid: [
      {
        name: 'full copy via slice() is out of scope',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.slice();
        `,
      },
      {
        name: 'full copy via slice(0) is out of scope',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.slice(0);
        `,
      },
      {
        name: 'slice with a non-literal count is left untouched',
        code: dedent`
          declare const xs: readonly number[];
          declare const n: number;
          const ys = xs.slice(n);
        `,
      },
      {
        name: 'slice on a string is not an array operation',
        code: dedent`
          declare const s: string;
          const t = s.slice(1);
        `,
      },
      {
        name: 'value-based filter is left untouched',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.filter((v) => v > 0);
        `,
      },
      {
        name: 'filter whose element param shadows the receiver is skipped',
        code: dedent`
          declare const xs: readonly (readonly number[])[];
          const ys = xs.filter((xs, i) => i < xs.length - 1);
        `,
      },
      {
        name: 'concat with an array argument flattens, not appends',
        code: dedent`
          declare const xs: readonly number[];
          declare const ys: readonly number[];
          const zs = xs.concat(ys);
        `,
      },
      {
        name: 'toSpliced(0, -N) clamps the delete count and is a plain copy',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.toSpliced(0, -2);
        `,
      },
      {
        name: 'Arr.skip with a count other than 1 is already canonical',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.skip(xs, 2);
        `,
      },
      {
        name: 'receiver with side effects is not referenced twice',
        code: dedent`
          declare const getXs: () => readonly number[];
          const ys = getXs().filter((_, i) => i < getXs().length - 1);
        `,
      },
      {
        name: 'spreading a Set is a genuine conversion, not element addition',
        code: dedent`
          declare const xs: Set<number>;
          const ys = [...xs, 0];
        `,
      },
      {
        name: 'two-element array literal without spread is out of scope',
        code: dedent`
          declare const a: number;
          declare const b: number;
          const ys = [a, b];
        `,
      },
    ],
    invalid: [
      // ---- tail ----
      {
        name: 'xs.toSpliced(0, 1) → Arr.tail(xs)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.toSpliced(0, 1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.tail(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.slice(1) → Arr.tail(xs)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.slice(1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.tail(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.filter((_, i) => i >= 1) → Arr.tail(xs)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.filter((_, i) => i >= 1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.tail(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.filter((_, i) => i > 0) → Arr.tail(xs)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.filter((_, i) => i > 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.tail(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.filter((_, i) => i !== 0) → Arr.tail(xs)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.filter((_, i) => i !== 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.tail(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'flipped operand order (0 < i) is also recognized',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.filter((_, i) => 0 < i);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.tail(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'Arr.skip(xs, 1) → Arr.tail(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.skip(xs, 1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.tail(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'aliased import: A.skip(xs, 1) → A.tail(xs)',
        code: dedent`
          import { Arr as A } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = A.skip(xs, 1);
        `,
        output: dedent`
          import { Arr as A } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = A.tail(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      // ---- skip N ----
      {
        name: 'xs.toSpliced(0, 3) → Arr.skip(xs, 3)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.toSpliced(0, 3);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.skip(xs, 3);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.slice(2) → Arr.skip(xs, 2)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.slice(2);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.skip(xs, 2);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.filter((_, i) => i >= 2) → Arr.skip(xs, 2)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.filter((_, i) => i >= 2);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.skip(xs, 2);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      // ---- take N ----
      {
        name: 'xs.toSpliced(2) → Arr.take(xs, 2)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.toSpliced(2);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.take(xs, 2);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.slice(0, 2) → Arr.take(xs, 2)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.slice(0, 2);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.take(xs, 2);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.filter((_, i) => i < 2) → Arr.take(xs, 2)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.filter((_, i) => i < 2);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.take(xs, 2);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      // ---- butLast ----
      {
        name: 'xs.toSpliced(-1) → Arr.butLast(xs)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.toSpliced(-1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.butLast(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.slice(0, -1) → Arr.butLast(xs)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.slice(0, -1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.butLast(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.filter((_, i) => i < xs.length - 1) → Arr.butLast(xs)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.filter((_, i) => i < xs.length - 1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.butLast(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.filter((_, i) => i !== xs.length - 1) → Arr.butLast(xs)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.filter((_, i) => i !== xs.length - 1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.butLast(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'Arr.skipLast(xs, 1) → Arr.butLast(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.skipLast(xs, 1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.butLast(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      // ---- skipLast N ----
      {
        name: 'xs.toSpliced(-2) → Arr.skipLast(xs, 2)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.toSpliced(-2);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.skipLast(xs, 2);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.slice(0, -2) → Arr.skipLast(xs, 2)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.slice(0, -2);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.skipLast(xs, 2);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.filter((_, i) => i < xs.length - 2) → Arr.skipLast(xs, 2)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.filter((_, i) => i < xs.length - 2);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.skipLast(xs, 2);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      // ---- takeLast N ----
      {
        name: 'xs.slice(-2) → Arr.takeLast(xs, 2)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.slice(-2);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.takeLast(xs, 2);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.filter((_, i) => i >= xs.length - 2) → Arr.takeLast(xs, 2)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.filter((_, i) => i >= xs.length - 2);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.takeLast(xs, 2);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.toSpliced(0, xs.length - 2) → Arr.takeLast(xs, 2)',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.toSpliced(0, xs.length - 2);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.takeLast(xs, 2);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      // ---- toUnshifted ----
      {
        name: '[v, ...xs] → Arr.toUnshifted(v)(xs)',
        code: dedent`
          declare const xs: readonly number[];
          declare const v: number;
          const ys = [v, ...xs];
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const v: number;
          const ys = Arr.toUnshifted(v)(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: '[v].concat(xs) → Arr.toUnshifted(v)(xs)',
        code: dedent`
          declare const xs: readonly number[];
          declare const v: number;
          const ys = [v].concat(xs);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const v: number;
          const ys = Arr.toUnshifted(v)(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.toSpliced(0, 0, v) → Arr.toUnshifted(v)(xs)',
        code: dedent`
          declare const xs: readonly number[];
          declare const v: number;
          const ys = xs.toSpliced(0, 0, v);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const v: number;
          const ys = Arr.toUnshifted(v)(xs);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      // ---- toPushed ----
      {
        name: '[...xs, v] → Arr.toPushed(xs, v)',
        code: dedent`
          declare const xs: readonly number[];
          declare const v: number;
          const ys = [...xs, v];
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const v: number;
          const ys = Arr.toPushed(xs, v);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.concat(v) with a non-array value → Arr.toPushed(xs, v)',
        code: dedent`
          declare const xs: readonly number[];
          declare const v: number;
          const ys = xs.concat(v);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const v: number;
          const ys = Arr.toPushed(xs, v);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.concat([v]) → Arr.toPushed(xs, v)',
        code: dedent`
          declare const xs: readonly number[];
          declare const v: number;
          const ys = xs.concat([v]);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const v: number;
          const ys = Arr.toPushed(xs, v);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'xs.toSpliced(xs.length, 0, v) → Arr.toPushed(xs, v)',
        code: dedent`
          declare const xs: readonly number[];
          declare const v: number;
          const ys = xs.toSpliced(xs.length, 0, v);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const v: number;
          const ys = Arr.toPushed(xs, v);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      // ---- misc ----
      {
        name: 'member-expression receiver is supported',
        code: dedent`
          declare const obj: { items: readonly number[] };
          const ys = obj.items.filter((_, i) => i < obj.items.length - 1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const obj: { items: readonly number[] };
          const ys = Arr.butLast(obj.items);
        `,
        errors: [{ messageId: 'preferCanonicalArraySlicing' }],
      },
      {
        name: 'the import is inserted only once for multiple fixes',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.slice(1);
          const zs = xs.slice(0, -1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.tail(xs);
          const zs = Arr.butLast(xs);
        `,
        errors: [
          { messageId: 'preferCanonicalArraySlicing' },
          { messageId: 'preferCanonicalArraySlicing' },
        ],
      },
    ],
  });
});
