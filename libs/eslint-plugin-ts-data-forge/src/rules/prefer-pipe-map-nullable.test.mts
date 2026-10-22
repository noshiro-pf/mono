import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferPipeMapNullable } from './prefer-pipe-map-nullable.mjs';

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

/** The same rule with no type information. */
const untypedTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

describe('prefer-pipe-map-nullable', () => {
  tester.run('prefer-pipe-map-nullable', preferPipeMapNullable, {
    valid: [
      {
        name: 'ignores pipe(x).mapNullable(fn)',
        code: dedent`
          import { pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = pipe(x).mapNullable((v) => v + 1).value;
        `,
      },
      {
        name: 'ignores map with another function',
        code: dedent`
          import { pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          declare const f: (v: number | undefined) => number;
          const y = pipe(x).map(f).value;
        `,
      },
      {
        name: 'ignores the two-argument mapNullable(value, fn)',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          declare const g: (v: number | undefined) => (w: number) => number;
          const y = pipe(x).map((v) => mapNullable(v, (w) => w + 1)).value;
          const z = pipe(x).map(g(mapNullable(x, (w) => w + 1))).value;
        `,
      },
      {
        name: 'ignores mapNullable with explicit type arguments',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = pipe(x).map(mapNullable<number, number>((v) => v + 1)).value;
        `,
      },
      {
        name: 'ignores map with explicit type arguments',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = pipe(x).map<number | undefined>(mapNullable((v: number) => v + 1)).value;
        `,
      },
      {
        name: 'ignores a mapNullable not imported from ts-data-forge',
        code: dedent`
          import { pipe } from 'ts-data-forge';
          const mapNullable =
            <A, B>(fn: (a: A) => B) =>
            (a: A | null | undefined): B | undefined =>
              a == null ? undefined : fn(a);
          declare const x: number | undefined;
          const y = pipe(x).map(mapNullable((v: number) => v + 1)).value;
        `,
      },
      {
        name: 'ignores a mapNullable that shadows the import',
        code: dedent`
          import { mapNullable as _m, pipe } from 'ts-data-forge';
          import { mapNullable } from 'ts-data-forge';
          declare const x: number | undefined;
          const run = (mapNullable: (fn: (v: number) => number) => (v: number | undefined) => number) =>
            pipe(x).map(mapNullable((v) => v + 1)).value;
        `,
      },
      {
        name: 'ignores a map on something that is not a pipe',
        code: dedent`
          import { mapNullable } from 'ts-data-forge';
          declare const xs: readonly (number | undefined)[];
          const ys = xs.map(mapNullable((v) => v + 1));
        `,
      },
      {
        name: 'ignores a pipe not imported from ts-data-forge',
        code: dedent`
          import { mapNullable } from 'ts-data-forge';
          import { pipe } from 'some-other-pipe';
          declare const x: number | undefined;
          const y = pipe(x).map(mapNullable((v: number) => v + 1));
        `,
      },
      {
        name: 'ignores a pipe held in a variable',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const p = pipe(x);
          const y = p.map(mapNullable((v) => v + 1)).value;
        `,
      },
      {
        name: 'ignores optional calls',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = pipe(x).map?.(mapNullable((v) => v + 1));
        `,
      },
      {
        name: 'ignores a spread argument',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          declare const args: readonly [(v: number) => number];
          const y = pipe(x).map(mapNullable(...args));
        `,
      },
    ],
    invalid: [
      {
        name: 'fixes an inline function whose result type is not a literal',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = pipe(x).map(mapNullable((v) => v + 1)).value;
        `,
        output: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = pipe(x).mapNullable((v) => v + 1).value;
        `,
        errors: [{ messageId: 'useMapNullable' }],
      },
      {
        name: 'fixes a function reference',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: string | undefined;
          declare const f: (s: string) => 'a';
          const y = pipe(x).map(mapNullable(f)).value;
        `,
        output: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: string | undefined;
          declare const f: (s: string) => 'a';
          const y = pipe(x).mapNullable(f).value;
        `,
        errors: [{ messageId: 'useMapNullable' }],
      },
      {
        name: 'fixes an inline function with a return type annotation',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = pipe(x).map(mapNullable((v): 'a' => 'a')).value;
        `,
        output: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = pipe(x).mapNullable((v): 'a' => 'a').value;
        `,
        errors: [{ messageId: 'useMapNullable' }],
      },
      {
        name: 'fixes an inline function returning an object of non-literals',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = pipe(x).map(mapNullable((v) => ({ v, ok: v > 0 }))).value;
        `,
        output: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = pipe(x).mapNullable((v) => ({ v, ok: v > 0 })).value;
        `,
        errors: [{ messageId: 'useMapNullable' }],
      },
      {
        name: 'fixes every link of a chain',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: string | undefined;
          const y = pipe(x)
            .map(mapNullable((s) => s.length))
            .map((n) => n)
            .map(mapNullable((n) => n * 2)).value;
        `,
        output: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: string | undefined;
          const y = pipe(x)
            .mapNullable((s) => s.length)
            .map((n) => n)
            .mapNullable((n) => n * 2).value;
        `,
        errors: [
          { messageId: 'useMapNullable' },
          { messageId: 'useMapNullable' },
        ],
      },
      {
        name: 'fixes after mapOptional and mapNullable links',
        code: dedent`
          import { mapNullable, Optional, pipe } from 'ts-data-forge';
          declare const o: Optional<number>;
          const y = pipe(o)
            .mapOptional((n) => n + 1)
            .map((p) => Optional.unwrapOr(p, undefined))
            .mapNullable((n) => n)
            .map(mapNullable((n) => n * 2)).value;
        `,
        output: dedent`
          import { mapNullable, Optional, pipe } from 'ts-data-forge';
          declare const o: Optional<number>;
          const y = pipe(o)
            .mapOptional((n) => n + 1)
            .map((p) => Optional.unwrapOr(p, undefined))
            .mapNullable((n) => n)
            .mapNullable((n) => n * 2).value;
        `,
        errors: [{ messageId: 'useMapNullable' }],
      },
      {
        name: 'fixes aliased and namespace imports',
        code: dedent`
          import * as tdf from 'ts-data-forge';
          import { mapNullable as mapN } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = tdf.pipe(x).map(tdf.mapNullable((v) => v + 1)).value;
          const z = tdf.pipe(x).map(mapN((v) => v + 1)).value;
        `,
        output: dedent`
          import * as tdf from 'ts-data-forge';
          import { mapNullable as mapN } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = tdf.pipe(x).mapNullable((v) => v + 1).value;
          const z = tdf.pipe(x).mapNullable((v) => v + 1).value;
        `,
        errors: [
          { messageId: 'useMapNullable' },
          { messageId: 'useMapNullable' },
        ],
      },
      {
        name: 'fixes a pipe imported from ts-std-forge',
        code: dedent`
          import { mapNullable } from 'ts-data-forge';
          import { pipe } from 'ts-std-forge';
          declare const x: number | undefined;
          const y = pipe(x).map(mapNullable((v) => v + 1)).value;
        `,
        output: dedent`
          import { mapNullable } from 'ts-data-forge';
          import { pipe } from 'ts-std-forge';
          declare const x: number | undefined;
          const y = pipe(x).mapNullable((v) => v + 1).value;
        `,
        errors: [{ messageId: 'useMapNullable' }],
      },
      {
        name: 'keeps comments around the function and a sequence argument',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          declare const f: (v: number) => number;
          const y = pipe(x).map(/* a */ mapNullable((0, f)) /* b */).value;
        `,
        output: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          declare const f: (v: number) => number;
          const y = pipe(x).mapNullable(/* a */ (0, f) /* b */).value;
        `,
        errors: [{ messageId: 'useMapNullable' }],
      },
      {
        name: 'suggests when the inferred result is a literal',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = pipe(x).map(mapNullable((v) => 'a')).value;
        `,
        errors: [
          {
            messageId: 'useMapNullable',
            suggestions: [
              {
                messageId: 'suggestMapNullable',
                output: dedent`
                  import { mapNullable, pipe } from 'ts-data-forge';
                  declare const x: number | undefined;
                  const y = pipe(x).mapNullable((v) => 'a').value;
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'suggests when the inferred result is a tuple',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = pipe(x).map(mapNullable((v) => [v, 1])).value;
        `,
        errors: [
          {
            messageId: 'useMapNullable',
            suggestions: [
              {
                messageId: 'suggestMapNullable',
                output: dedent`
                  import { mapNullable, pipe } from 'ts-data-forge';
                  declare const x: number | undefined;
                  const y = pipe(x).mapNullable((v) => [v, 1]).value;
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'suggests when a literal is nested in an object',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          const y = pipe(x).map(mapNullable((v) => ({ kind: 'n', v }))).value;
        `,
        errors: [
          {
            messageId: 'useMapNullable',
            suggestions: [
              {
                messageId: 'suggestMapNullable',
                output: dedent`
                  import { mapNullable, pipe } from 'ts-data-forge';
                  declare const x: number | undefined;
                  const y = pipe(x).mapNullable((v) => ({ kind: 'n', v })).value;
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'suggests when a comment inside mapNullable(…) would be dropped',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          declare const f: (v: number) => number;
          const y = pipe(x).map(mapNullable(/* keep */ f)).value;
        `,
        errors: [
          {
            messageId: 'useMapNullable',
            suggestions: [
              {
                messageId: 'suggestMapNullable',
                output: dedent`
                  import { mapNullable, pipe } from 'ts-data-forge';
                  declare const x: number | undefined;
                  declare const f: (v: number) => number;
                  const y = pipe(x).mapNullable(f).value;
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'suggests when a type wrapper around mapNullable would be dropped',
        code: dedent`
          import { mapNullable, pipe } from 'ts-data-forge';
          declare const x: number | undefined;
          declare const f: (v: number) => number;
          const y = pipe(x).map((mapNullable as typeof mapNullable)(f)).value;
        `,
        errors: [
          {
            messageId: 'useMapNullable',
            suggestions: [
              {
                messageId: 'suggestMapNullable',
                output: dedent`
                  import { mapNullable, pipe } from 'ts-data-forge';
                  declare const x: number | undefined;
                  declare const f: (v: number) => number;
                  const y = pipe(x).mapNullable(f).value;
                `,
              },
            ],
          },
        ],
      },
    ],
  });

  untypedTester.run(
    'prefer-pipe-map-nullable (no type information)',
    preferPipeMapNullable,
    {
      valid: [],
      invalid: [
        {
          name: 'fixes a function reference',
          code: dedent`
            import { mapNullable, pipe } from 'ts-data-forge';
            declare const x: number | undefined;
            declare const f: (v: number) => number;
            const y = pipe(x).map(mapNullable(f)).value;
          `,
          output: dedent`
            import { mapNullable, pipe } from 'ts-data-forge';
            declare const x: number | undefined;
            declare const f: (v: number) => number;
            const y = pipe(x).mapNullable(f).value;
          `,
          errors: [{ messageId: 'useMapNullable' }],
        },
        {
          name: 'suggests for an inline function it cannot type',
          code: dedent`
            import { mapNullable, pipe } from 'ts-data-forge';
            declare const x: number | undefined;
            const y = pipe(x).map(mapNullable((v) => v + 1)).value;
          `,
          errors: [
            {
              messageId: 'useMapNullable',
              suggestions: [
                {
                  messageId: 'suggestMapNullable',
                  output: dedent`
                    import { mapNullable, pipe } from 'ts-data-forge';
                    declare const x: number | undefined;
                    const y = pipe(x).mapNullable((v) => v + 1).value;
                  `,
                },
              ],
            },
          ],
        },
      ],
    },
  );
});
