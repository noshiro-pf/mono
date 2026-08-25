import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferObjOverEntriesRoundTrip } from './prefer-obj-over-entries-round-trip.mjs';

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

describe('prefer-obj-over-entries-round-trip', () => {
  tester.run(
    'prefer-obj-over-entries-round-trip',
    preferObjOverEntriesRoundTrip,
    {
      valid: [
        {
          name: 'ignores an entries round trip that rewrites the key',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const upper = Object.fromEntries(
              Object.entries(scores).map(([k, v]) => [k.toUpperCase(), v]),
            );
          `,
        },
        {
          name: 'ignores a callback with a block body',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const doubled = Object.fromEntries(
              Object.entries(scores).map(([k, v]) => {
                return [k, v * 2];
              }),
            );
          `,
        },
        {
          name: 'ignores a callback that takes the entry index',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const indexed = Object.fromEntries(
              Object.entries(scores).map(([k, v], i) => [k, v + i]),
            );
          `,
        },
        {
          name: 'ignores a callback that does not destructure the entry',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const same = Object.fromEntries(
              Object.entries(scores).map((entry) => entry),
            );
          `,
        },
        {
          name: 'ignores a callback passed by reference',
          code: dedent`
            const scores: Record<string, number> = { alice: 1, bob: 2 };
            const isPositive = ([, v]: readonly [string, number]) => v > 0;
            const positive = Object.fromEntries(
              Object.entries(scores).filter(isPositive),
            );
          `,
        },
        {
          name: 'ignores an entry pattern with a default or a rest element',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const a = Object.fromEntries(
              Object.entries(scores).map(([k, v = 0]) => [k, v * 2]),
            );
            const b = Object.fromEntries(
              Object.entries(scores).map(([k, ...rest]) => [k, rest.length]),
            );
          `,
        },
        {
          name: 'ignores an entry tuple asserted to a type of its own',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const widened = Object.fromEntries(
              Object.entries(scores).map(
                ([k, v]) => [k, v] as [string, number | undefined],
              ),
            );
          `,
        },
        {
          name: 'ignores a callback with an explicit return type',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const passing = Object.fromEntries(
              Object.entries(scores).filter(([, v]): boolean => v > 1),
            );
          `,
        },
        {
          name: 'ignores an async callback',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const mapped = Object.fromEntries(
              Object.entries(scores).map(async ([k, v]) => [k, v * 2]),
            );
          `,
        },
        {
          name: 'ignores a flatMap that is not a keep/drop conditional',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const a = Object.fromEntries(
              Object.entries(scores).flatMap(([k, v]) => [[k, v * 2]]),
            );
            const b = Object.fromEntries(
              Object.entries(scores).flatMap(([k, v]) =>
                v > 1 ? [[k, v]] : [[k, 0]],
              ),
            );
          `,
        },
        {
          name: 'ignores a round trip through something other than Object.entries',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const a = Object.fromEntries(
              Object.keys(scores).map((k) => [k, 0]),
            );
            const entries: (readonly [string, number])[] = [['a', 1]];
            const b = Object.fromEntries(entries.map(([k, v]) => [k, v * 2]));
          `,
        },
        {
          name: 'ignores Object.entries without the Object.fromEntries wrapper',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const pairs = Object.entries(scores).map(([k, v]) => [k, v * 2]);
          `,
        },
        {
          name: 'ignores an array method Obj has no counterpart for',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const sorted = Object.fromEntries(
              Object.entries(scores).toSorted(([a], [b]) => a.localeCompare(b)),
            );
          `,
        },
      ],

      invalid: [
        {
          name: 'replaces a value-only map with Obj.map',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const doubled = Object.fromEntries(
              Object.entries(scores).map(([k, v]) => [k, v * 2]),
            );
          `,
          output: dedent`
            import { Obj } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const doubled = Obj.map(scores, (v) => v * 2);
          `,
          errors: [{ messageId: 'useObjMap' }],
        },
        {
          name: 'keeps the key parameter when the mapped value uses it',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const labelled = Object.fromEntries(
              Object.entries(scores).map(([k, v]) => [k, k.length + v]),
            );
          `,
          output: dedent`
            import { Obj } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const labelled = Obj.map(scores, (v, k) => k.length + v);
          `,
          errors: [{ messageId: 'useObjMap' }],
        },
        {
          name: 'drops both parameters when the mapped value uses neither',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const zeroed = Object.fromEntries(
              Object.entries(scores).map(([k]) => [k, 0]),
            );
          `,
          output: dedent`
            import { Obj } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const zeroed = Obj.map(scores, () => 0);
          `,
          errors: [{ messageId: 'useObjMap' }],
        },
        {
          name: 'looks through the as const an entry tuple carries',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const doubled = Object.fromEntries(
              Object.entries(scores).map(([k, v]) => [k, v * 2] as const),
            );
          `,
          output: dedent`
            import { Obj } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const doubled = Obj.map(scores, (v) => v * 2);
          `,
          errors: [{ messageId: 'useObjMap' }],
        },
        {
          name: 'parenthesizes an object-literal body',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const wrapped = Object.fromEntries(
              Object.entries(scores).map(([k, v]) => [k, { value: v }]),
            );
          `,
          output: dedent`
            import { Obj } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const wrapped = Obj.map(scores, (v) => ({ value: v }));
          `,
          errors: [{ messageId: 'useObjMap' }],
        },
        {
          name: 'parenthesizes an object literal that keeps its own as const',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const wrapped = Object.fromEntries(
              Object.entries(scores).map(([k, v]) => [k, { value: v } as const]),
            );
          `,
          output: dedent`
            import { Obj } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const wrapped = Obj.map(scores, (v) => ({ value: v } as const));
          `,
          errors: [{ messageId: 'useObjMap' }],
        },
        {
          name: 'replaces a value predicate with Obj.filter',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const passing = Object.fromEntries(
              Object.entries(scores).filter(([, v]) => v > 1),
            );
          `,
          output: dedent`
            import { Obj } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const passing = Obj.filter(scores, (v) => v > 1);
          `,
          errors: [{ messageId: 'useObjFilter' }],
        },
        {
          name: 'names an unused value parameter when the predicate only uses the key',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const notAlice = Object.fromEntries(
              Object.entries(scores).filter(([k]) => k !== 'alice'),
            );
          `,
          output: dedent`
            import { Obj } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const notAlice = Obj.filter(scores, (_value, k) => k !== 'alice');
          `,
          errors: [{ messageId: 'useObjFilter' }],
        },
        {
          name: 'swaps the entry bindings into value-then-key order',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const kept = Object.fromEntries(
              Object.entries(scores).filter(([k, v]) => k !== 'alice' && v > 0),
            );
          `,
          output: dedent`
            import { Obj } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const kept = Obj.filter(scores, (v, k) => k !== 'alice' && v > 0);
          `,
          errors: [{ messageId: 'useObjFilter' }],
        },
        {
          name: 'replaces a keep/drop flatMap with Obj.filterMap',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const scaled = Object.fromEntries(
              Object.entries(scores).flatMap(([k, v]) =>
                v > 1 ? [[k, v * 10]] : [],
              ),
            );
          `,
          output: dedent`
            import { Obj, Optional } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const scaled = Obj.filterMap(scores, (v) => v > 1 ? Optional.some(v * 10) : Optional.none);
          `,
          errors: [{ messageId: 'useObjFilterMap' }],
        },
        {
          name: 'handles a flatMap whose branches are the other way round',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const scaled = Object.fromEntries(
              Object.entries(scores).flatMap(([k, v]) =>
                v > 1 ? [] : [[k, v * 10] as const],
              ),
            );
          `,
          output: dedent`
            import { Obj, Optional } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const scaled = Obj.filterMap(scores, (v) => v > 1 ? Optional.none : Optional.some(v * 10));
          `,
          errors: [{ messageId: 'useObjFilterMap' }],
        },
        {
          name: 'reuses an existing ts-data-forge import',
          code: dedent`
            import { Obj } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const doubled = Object.fromEntries(
              Object.entries(scores).map(([k, v]) => [k, v * 2]),
            );
          `,
          output: dedent`
            import { Obj } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const doubled = Obj.map(scores, (v) => v * 2);
          `,
          errors: [{ messageId: 'useObjMap' }],
        },
        {
          name: 'uses the local name of an aliased import',
          code: dedent`
            import { Obj as O } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const doubled = Object.fromEntries(
              Object.entries(scores).map(([k, v]) => [k, v * 2]),
            );
          `,
          output: dedent`
            import { Obj as O } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const doubled = O.map(scores, (v) => v * 2);
          `,
          errors: [{ messageId: 'useObjMap' }],
        },
        {
          name: 'imports Obj once for several round trips in one file',
          code: dedent`
            const scores = { alice: 1, bob: 2 };
            const doubled = Object.fromEntries(
              Object.entries(scores).map(([k, v]) => [k, v * 2]),
            );
            const passing = Object.fromEntries(
              Object.entries(scores).filter(([, v]) => v > 1),
            );
          `,
          output: dedent`
            import { Obj } from 'ts-data-forge';
            const scores = { alice: 1, bob: 2 };
            const doubled = Obj.map(scores, (v) => v * 2);
            const passing = Obj.filter(scores, (v) => v > 1);
          `,
          errors: [{ messageId: 'useObjMap' }, { messageId: 'useObjFilter' }],
        },
        {
          name: 'rewrites a round trip over a computed record expression',
          code: dedent`
            const wrap = (r: Record<string, number>) => r;
            const doubled = Object.fromEntries(
              Object.entries(wrap({ a: 1 })).map(([k, v]) => [k, v * 2]),
            );
          `,
          output: dedent`
            import { Obj } from 'ts-data-forge';
            const wrap = (r: Record<string, number>) => r;
            const doubled = Obj.map(wrap({ a: 1 }), (v) => v * 2);
          `,
          errors: [{ messageId: 'useObjMap' }],
        },
      ],
    },
  );
});
