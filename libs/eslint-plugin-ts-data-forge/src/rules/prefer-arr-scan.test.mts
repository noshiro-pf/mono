import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrScan } from './prefer-arr-scan.mjs';

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

describe('prefer-arr-scan', () => {
  tester.run('prefer-arr-scan', preferArrScan, {
    valid: [
      {
        name: 'map callback that reads its element',
        code: dedent`
          declare const xs: readonly string[];
          const ys = xs.map((x, i) => [x, ...xs.slice(0, i + 1)]);
        `,
      },
      {
        name: 'map callback with no slicing at all',
        code: dedent`
          declare const xs: readonly string[];
          const ys = xs.map((_, i) => i * 2);
        `,
      },
      {
        name: 'slicing a different array',
        code: dedent`
          declare const xs: readonly string[];
          declare const ys: readonly string[];
          const zs = xs.map((_, i) => ys.slice(0, i + 1).join(''));
        `,
      },
      {
        name: 'slice bounds that do not come from the index',
        code: dedent`
          declare const xs: readonly string[];
          const ys = xs.map((_, i) => xs.slice(0, 2).join(String(i)));
        `,
      },
      {
        name: 'map with only one parameter',
        code: dedent`
          declare const xs: readonly string[];
          const ys = xs.map((x) => x.length);
        `,
      },
      {
        name: 'reduce that does not rebuild its accumulator',
        code: dedent`
          declare const xs: readonly number[];
          const total = xs.reduce((acc, x) => acc + x, 0);
        `,
      },
      {
        name: 'reduce spreading its accumulator but with no initial value',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.reduce<readonly number[]>((acc, x) => [...acc, x]);
        `,
      },
      {
        name: 'toPushed applied to an array other than the accumulator',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const seed: readonly number[];
          const ys = xs.reduce<readonly number[]>(
            (acc, x) => Arr.toPushed(seed, x),
            [],
          );
        `,
      },
      {
        name: 'reduce spreading something other than the accumulator',
        code: dedent`
          declare const xs: readonly number[];
          declare const seed: readonly number[];
          const ys = xs.reduce<readonly number[]>((acc, x) => [...seed, x], []);
        `,
      },
    ],
    invalid: [
      {
        name: 'prefix rebuilt with slice(0, i + 1)',
        code: dedent`
          declare const segments: readonly string[];
          declare const resolve: (...parts: readonly string[]) => string;
          const ancestors = segments.map((_, index) =>
            resolve(...segments.slice(0, index + 1)),
          );
        `,
        errors: [{ messageId: 'preferArrScanPrefix' }],
      },
      {
        name: 'prefix rebuilt backwards, from the length',
        code: dedent`
          declare const segments: readonly string[];
          const ancestors = segments.map((_, index) =>
            segments.slice(0, segments.length - index).join('/'),
          );
        `,
        errors: [{ messageId: 'preferArrScanPrefix' }],
      },
      {
        name: 'a member expression as the array, spelled the same way twice',
        code: dedent`
          declare const state: { readonly parts: readonly string[] };
          const rows = state.parts.map((_, i) => state.parts.slice(0, i).join(''));
        `,
        errors: [{ messageId: 'preferArrScanPrefix' }],
      },
      {
        name: 'reduce accumulating into a new array on every step',
        code: dedent`
          declare const xs: readonly number[];
          const totals = xs.reduce<readonly number[]>(
            (acc, x) => [...acc, (acc.at(-1) ?? 0) + x],
            [0],
          );
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const totals = Arr.scan(xs, (acc, x) => (acc) + x, 0);
        `,
        errors: [{ messageId: 'preferArrScanAccumulate' }],
      },
      {
        name: 'the fix reuses an Arr already imported',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const totals = xs.reduce<readonly number[]>(
            (acc, x) => [...acc, (acc.at(-1) ?? 0) + x],
            [0],
          );
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const totals = Arr.scan(xs, (acc, x) => (acc) + x, 0);
        `,
        errors: [{ messageId: 'preferArrScanAccumulate' }],
      },
      {
        name: 'the index parameter is carried over',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const totals = xs.reduce<readonly number[]>(
            (acc, x, i) => [...acc, (acc.at(-1) ?? 0) + x * i],
            [0],
          );
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const totals = Arr.scan(xs, (acc, x, i) => (acc) + x * i, 0);
        `,
        errors: [{ messageId: 'preferArrScanAccumulate' }],
      },
      {
        name: 'more than one accumulator read is rewritten',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const totals = xs.reduce<readonly number[]>(
            (acc, x) => [...acc, (acc.at(-1) ?? 0) + x * (acc.at(-1) ?? 1)],
            [0],
          );
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const totals = Arr.scan(xs, (acc, x) => (acc) + x * (acc), 0);
        `,
        errors: [{ messageId: 'preferArrScanAccumulate' }],
      },
      {
        name: 'the Arr.toPushed spelling, which prefer-canonical-array-slicing produces',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const totals = xs.reduce<readonly number[]>(
            (acc, x) => Arr.toPushed(acc, (acc.at(-1) ?? 0) + x),
            [0],
          );
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const totals = Arr.scan(xs, (acc, x) => (acc) + x, 0);
        `,
        errors: [{ messageId: 'preferArrScanAccumulate' }],
      },
      {
        name: 'identifiers other than the accumulator are left alone',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const seed: readonly number[];
          const totals = xs.reduce<readonly number[]>(
            (acc, x) => Arr.toPushed(acc, (acc.at(-1) ?? 0) + x + seed.length),
            [0],
          );
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const seed: readonly number[];
          const totals = Arr.scan(xs, (acc, x) => (acc) + x + seed.length, 0);
        `,
        errors: [{ messageId: 'preferArrScanAccumulate' }],
      },
      {
        name: 'reported without a fix: the accumulator is read as an array',
        code: dedent`
          declare const xs: readonly number[];
          const totals = xs.reduce<readonly number[]>(
            (acc, x) => [...acc, acc.length + x],
            [0],
          );
        `,
        errors: [{ messageId: 'preferArrScanAccumulate' }],
      },
      {
        name: 'reported without a fix: the initial value is not a one-element array',
        code: dedent`
          declare const xs: readonly number[];
          const totals = xs.reduce<readonly number[]>(
            (acc, x) => [...acc, (acc.at(-1) ?? 0) + x],
            [0, 1],
          );
        `,
        errors: [{ messageId: 'preferArrScanAccumulate' }],
      },
      {
        name: 'reported without a fix: two elements appended per step',
        code: dedent`
          declare const xs: readonly number[];
          const totals = xs.reduce<readonly number[]>(
            (acc, x) => [...acc, (acc.at(-1) ?? 0) + x, x],
            [0],
          );
        `,
        errors: [{ messageId: 'preferArrScanAccumulate' }],
      },
      {
        name: 'reported without a fix: the previous value is never read',
        code: dedent`
          declare const xs: readonly number[];
          const doubled = xs.reduce<readonly number[]>(
            (acc, x) => [...acc, x * 2],
            [0],
          );
        `,
        errors: [{ messageId: 'preferArrScanAccumulate' }],
      },
      {
        name: 'reported without a fix: an annotated accumulator parameter',
        code: dedent`
          declare const xs: readonly number[];
          const totals = xs.reduce<readonly number[]>(
            (acc: readonly number[], x) => [...acc, (acc.at(-1) ?? 0) + x],
            [0],
          );
        `,
        errors: [{ messageId: 'preferArrScanAccumulate' }],
      },
      {
        name: 'reported without a fix: an index other than -1',
        code: dedent`
          declare const xs: readonly number[];
          const totals = xs.reduce<readonly number[]>(
            (acc, x) => [...acc, (acc.at(-2) ?? 0) + x],
            [0],
          );
        `,
        errors: [{ messageId: 'preferArrScanAccumulate' }],
      },
    ],
  });
});
