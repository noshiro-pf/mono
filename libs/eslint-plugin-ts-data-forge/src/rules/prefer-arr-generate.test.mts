import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrGenerate } from './prefer-arr-generate.mjs';

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

describe('prefer-arr-generate', () => {
  tester.run('prefer-arr-generate', preferArrGenerate, {
    valid: [
      {
        name: 'ignores Arr.generate',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.generate(function* () {
            for (const x of xs) {
              if (x > 0) {
                yield x;
              }
            }
          });
        `,
      },
      {
        name: 'ignores a callback that is not a conditional',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap((x) => [x, x]);
        `,
      },
      {
        name: 'ignores a conditional whose branches are both non-empty',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap((x) => (x > 0 ? [x] : [-x]));
        `,
      },
      {
        name: 'ignores a conditional whose branches are both empty',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap((x) => (x > 0 ? [] : []));
        `,
      },
      {
        name: 'ignores a spread in the kept branch',
        code: dedent`
          declare const xs: readonly (readonly number[])[];
          const ys = xs.flatMap((x) => (x.length > 0 ? [...x] : []));
        `,
      },
      {
        name: 'ignores a callback that reads the index or the array',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap((x, i) => (i > 0 ? [x] : []));
          const zs = xs.flatMap((x, _i, all) => (all.length > 1 ? [x] : []));
        `,
      },
      {
        name: 'ignores a callback with a default or a rest parameter',
        code: dedent`
          declare const xs: readonly (number | undefined)[];
          const ys = xs.flatMap((x = 0) => (x > 0 ? [x] : []));
          const zs = xs.flatMap((...args) => (args.length > 0 ? [args] : []));
        `,
      },
      {
        name: 'ignores an optional parameter',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap((x?: number) => (x !== undefined ? [x] : []));
        `,
      },
      {
        name: 'ignores a thisArg',
        code: dedent`
          declare const xs: readonly number[];
          declare const self: unknown;
          const ys = xs.flatMap((x) => (x > 0 ? [x] : []), self);
        `,
      },
      {
        name: 'ignores a function expression and an async arrow',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap(function (x) {
            return x > 0 ? [x] : [];
          });
          const zs = xs.flatMap(async (x) => (x > 0 ? [x] : []));
        `,
      },
      {
        name: 'ignores a receiver that is not an array',
        code: dedent`
          declare const o: Readonly<{
            flatMap: (f: (x: number) => readonly number[]) => readonly number[];
          }>;
          const ys = o.flatMap((x) => (x > 0 ? [x] : []));
        `,
      },
      {
        name: 'ignores an optional call',
        code: dedent`
          declare const xs: readonly number[] | undefined;
          const ys = xs?.flatMap((x) => (x > 0 ? [x] : []));
        `,
      },
      {
        name: 'ignores `this` and `arguments`, which the generator function would rebind',
        code: dedent`
          class C {
            readonly xs: readonly number[] = [];
            readonly k = 1;
            f(): readonly number[] {
              return this.xs.flatMap((x) => (x > this.k ? [x] : []));
            }
          }
          function g(xs: readonly number[]): readonly unknown[] {
            return xs.flatMap((x) => (x > 0 ? [arguments.length] : []));
          }
        `,
      },
      {
        name: 'ignores a receiver that names the parameter, which the loop would shadow',
        code: dedent`
          type Node = Readonly<{ id: number; children: readonly Node[] }>;
          declare const node: Node;
          const ys = node.children.flatMap((node) => (node.id > 0 ? [node] : []));
        `,
      },
      {
        name: 'ignores a block body with another return',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap((x) => {
            if (x > 10) {
              return [x, x];
            }
            return x > 0 ? [x] : [];
          });
        `,
      },
      {
        name: 'ignores a block body that does not end in the conditional',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap((x) => {
            const y = x > 0 ? [x] : [];
            return y;
          });
        `,
      },
      {
        name: 'ignores a callback wrapped in a type assertion, which may be what types its parameter',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap(((x) => (x > 0 ? [x] : [])) as (
            x: number,
          ) => readonly number[]);
        `,
      },
    ],
    invalid: [
      {
        name: 'replaces a filter-and-map flatMap',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap((x) => (x > 0 ? [x * 2] : []));
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.generate(function* () {
            for (const x of xs) {
              if (x > 0) {
                yield x * 2;
              }
            }
          });
        `,
        errors: [{ messageId: 'useArrGenerate' }],
      },
      {
        name: 'negates the condition when the empty array comes first',
        code: dedent`
          declare const xs: readonly (number | undefined)[];
          declare const skip: boolean;
          const ys = xs.flatMap((x) => (x === undefined ? [] : [x]));
          const zs = xs.flatMap((x) => (skip ? [] : [x]));
        `,
        output: [
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const xs: readonly (number | undefined)[];
            declare const skip: boolean;
            const ys = Arr.generate(function* () {
              for (const x of xs) {
                if (x !== undefined) {
                  yield x;
                }
              }
            });
            const zs = xs.flatMap((x) => (skip ? [] : [x]));
          `,
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const xs: readonly (number | undefined)[];
            declare const skip: boolean;
            const ys = Arr.generate(function* () {
              for (const x of xs) {
                if (x !== undefined) {
                  yield x;
                }
              }
            });
            const zs = Arr.generate(function* () {
              for (const x of xs) {
                if (!skip) {
                  yield x;
                }
              }
            });
          `,
        ],
        errors: [
          { messageId: 'useArrGenerate' },
          { messageId: 'useArrGenerate' },
        ],
      },
      {
        name: 'negates the short way: an inverted comparison, De Morgan, and a dropped double negation, but a comparison that may be NaN only with !',
        code: dedent`
          declare const xs: readonly (string | undefined)[];
          declare const ok: (x: string | undefined) => boolean;
          declare const n: number;
          const a = xs.flatMap((x) => (x === undefined || x === '' ? [] : [x]));
          const b = xs.flatMap((x) => (ok(x) ? [] : [x]));
          const c = xs.flatMap((x) => (n < 0 ? [] : [x]));
          const d = xs.flatMap((x) => (!ok(x) ? [] : [x]));
        `,
        output: [
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const xs: readonly (string | undefined)[];
            declare const ok: (x: string | undefined) => boolean;
            declare const n: number;
            const a = Arr.generate(function* () {
              for (const x of xs) {
                if (x !== undefined && x !== '') {
                  yield x;
                }
              }
            });
            const b = xs.flatMap((x) => (ok(x) ? [] : [x]));
            const c = xs.flatMap((x) => (n < 0 ? [] : [x]));
            const d = xs.flatMap((x) => (!ok(x) ? [] : [x]));
          `,
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const xs: readonly (string | undefined)[];
            declare const ok: (x: string | undefined) => boolean;
            declare const n: number;
            const a = Arr.generate(function* () {
              for (const x of xs) {
                if (x !== undefined && x !== '') {
                  yield x;
                }
              }
            });
            const b = Arr.generate(function* () {
              for (const x of xs) {
                if (!ok(x)) {
                  yield x;
                }
              }
            });
            const c = Arr.generate(function* () {
              for (const x of xs) {
                if (!(n < 0)) {
                  yield x;
                }
              }
            });
            const d = Arr.generate(function* () {
              for (const x of xs) {
                if (ok(x)) {
                  yield x;
                }
              }
            });
          `,
        ],
        errors: [
          { messageId: 'useArrGenerate' },
          { messageId: 'useArrGenerate' },
          { messageId: 'useArrGenerate' },
          { messageId: 'useArrGenerate' },
        ],
      },
      {
        name: 'moves the statements of a block body into the loop',
        code: dedent`
          declare const xs: readonly string[];
          declare const lookup: (key: string) => number | undefined;
          const ys = xs.flatMap((key) => {
            const value = lookup(key);

            // Only the keys that resolve.
            return value === undefined ? [] : [[key, value] as const];
          });
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly string[];
          declare const lookup: (key: string) => number | undefined;
          const ys = Arr.generate(function* () {
            for (const key of xs) {
              const value = lookup(key);

              // Only the keys that resolve.
              if (value !== undefined) {
                yield [key, value] as const;
              }
            }
          });
        `,
        errors: [{ messageId: 'useArrGenerate' }],
      },
      {
        name: 'leaves the lines of a multi-line template literal as they are',
        code: [
          'declare const xs: readonly string[];',
          'const ys = xs.flatMap((x) =>',
          '  x.length > 0',
          '    ? [`first line',
          '  continued`]',
          '    : [],',
          ');',
        ].join('\n'),
        output: [
          "import { Arr } from 'ts-data-forge';",
          'declare const xs: readonly string[];',
          'const ys = Arr.generate(function* () {',
          '  for (const x of xs) {',
          '    if (x.length > 0) {',
          '      yield `first line',
          '  continued`;',
          '    }',
          '  }',
          '});',
        ].join('\n'),
        errors: [{ messageId: 'useArrGenerate' }],
      },
      {
        name: 'moves a comment at the top of a block body into the loop too',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap((x) => {
            // Odd ones only.
            return x % 2 === 1 ? [x] : [];
          });
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.generate(function* () {
            for (const x of xs) {
              // Odd ones only.
              if (x % 2 === 1) {
                yield x;
              }
            }
          });
        `,
        errors: [{ messageId: 'useArrGenerate' }],
      },
      {
        name: 'yields each element of the kept branch, and keeps a destructuring parameter',
        code: dedent`
          declare const xs: readonly Readonly<{ a: number; b: number }>[];
          const ys = xs.flatMap(({ a, b }) => (a > b ? [a, b] : []));
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly Readonly<{ a: number; b: number }>[];
          const ys = Arr.generate(function* () {
            for (const { a, b } of xs) {
              if (a > b) {
                yield a;
                yield b;
              }
            }
          });
        `,
        errors: [{ messageId: 'useArrGenerate' }],
      },
      {
        name: 'parenthesizes a sequence expression yielded or iterated',
        code: dedent`
          declare const xs: readonly number[];
          declare const f: () => void;
          const ys = (f(), xs).flatMap((x) => (x > 0 ? [(f(), x)] : []));
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const f: () => void;
          const ys = Arr.generate(function* () {
            for (const x of (f(), xs)) {
              if (x > 0) {
                yield (f(), x);
              }
            }
          });
        `,
        errors: [{ messageId: 'useArrGenerate' }],
      },
      {
        name: 'keeps an explicit type argument',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap<number | string>((x) => (x > 0 ? [x] : []));
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.generate<number | string>(function* () {
            for (const x of xs) {
              if (x > 0) {
                yield x;
              }
            }
          });
        `,
        errors: [{ messageId: 'useArrGenerate' }],
      },
      {
        name: 'uses an existing or aliased Arr import',
        code: dedent`
          import { Arr as A } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = xs.flatMap((x) => (x > 0 ? [x] : []));
        `,
        output: dedent`
          import { Arr as A } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = A.generate(function* () {
            for (const x of xs) {
              if (x > 0) {
                yield x;
              }
            }
          });
        `,
        errors: [{ messageId: 'useArrGenerate' }],
      },
      {
        name: 'no fix when an import type binds Arr',
        code: dedent`
          import type { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = xs.flatMap((x) => (x > 0 ? [x] : []));
        `,
        output: null,
        errors: [{ messageId: 'useArrGenerate' }],
      },
      {
        name: 'no fix where a local binding takes Arr',
        code: dedent`
          declare const xs: readonly number[];
          export const f = (Arr: unknown) => xs.flatMap((x) => (x > 0 ? [x] : []));
        `,
        output: null,
        errors: [{ messageId: 'useArrGenerate' }],
      },
      {
        name: 'indents from the line the call starts on, and accepts a mutable array, a tuple or a type parameter',
        code: dedent`
          declare const ms: number[];
          declare const ts: readonly [number, number];
          export const f = <T extends readonly number[]>(xs: T): void => {
            const a = ms.flatMap((x) => (x > 0 ? [x] : []));
            const b = ts.flatMap((x) => (x > 0 ? [x] : []));
            const c = xs.flatMap((x) => (x > 0 ? [x] : []));
          };
        `,
        output: [
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const ms: number[];
            declare const ts: readonly [number, number];
            export const f = <T extends readonly number[]>(xs: T): void => {
              const a = Arr.generate(function* () {
                for (const x of ms) {
                  if (x > 0) {
                    yield x;
                  }
                }
              });
              const b = ts.flatMap((x) => (x > 0 ? [x] : []));
              const c = xs.flatMap((x) => (x > 0 ? [x] : []));
            };
          `,
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const ms: number[];
            declare const ts: readonly [number, number];
            export const f = <T extends readonly number[]>(xs: T): void => {
              const a = Arr.generate(function* () {
                for (const x of ms) {
                  if (x > 0) {
                    yield x;
                  }
                }
              });
              const b = Arr.generate(function* () {
                for (const x of ts) {
                  if (x > 0) {
                    yield x;
                  }
                }
              });
              const c = Arr.generate(function* () {
                for (const x of xs) {
                  if (x > 0) {
                    yield x;
                  }
                }
              });
            };
          `,
        ],
        errors: [
          { messageId: 'useArrGenerate' },
          { messageId: 'useArrGenerate' },
          { messageId: 'useArrGenerate' },
        ],
      },
      {
        name: 'only suggests when the result is used as a mutable array',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap((x) => (x > 0 ? [x] : []));
          ys.push(1);
        `,
        output: null,
        errors: [
          {
            messageId: 'useArrGenerate',
            suggestions: [
              {
                messageId: 'suggestArrGenerate',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  declare const xs: readonly number[];
                  const ys = Arr.generate(function* () {
                    for (const x of xs) {
                      if (x > 0) {
                        yield x;
                      }
                    }
                  });
                  ys.push(1);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'only suggests when the parameter is annotated, since the loop variable cannot be',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap((x: number) => (x > 0 ? [x] : []));
        `,
        output: null,
        errors: [
          {
            messageId: 'useArrGenerate',
            suggestions: [
              {
                messageId: 'suggestArrGenerate',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  declare const xs: readonly number[];
                  const ys = Arr.generate(function* () {
                    for (const x of xs) {
                      if (x > 0) {
                        yield x;
                      }
                    }
                  });
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'only suggests when the callback declares its return type, which may be what types the elements',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap((x): readonly (number | string)[] =>
            x > 0 ? [x] : [],
          );
        `,
        output: null,
        errors: [
          {
            messageId: 'useArrGenerate',
            suggestions: [
              {
                messageId: 'suggestArrGenerate',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  declare const xs: readonly number[];
                  const ys = Arr.generate(function* () {
                    for (const x of xs) {
                      if (x > 0) {
                        yield x;
                      }
                    }
                  });
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'only suggests for a filter() receiver, which the loop would iterate as an intermediate array',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.filter((x) => x > 0).flatMap((x) => (x > 1 ? [x] : []));
        `,
        output: null,
        errors: [
          {
            messageId: 'useArrGenerate',
            suggestions: [
              {
                messageId: 'suggestArrGenerate',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  declare const xs: readonly number[];
                  const ys = Arr.generate(function* () {
                    for (const x of xs.filter((x) => x > 0)) {
                      if (x > 1) {
                        yield x;
                      }
                    }
                  });
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'only suggests when the receiver relies on a narrowing that does not reach into the generator function',
        code: dedent`
          type Decl = Readonly<{ items: readonly number[] }>;
          declare const s: Readonly<{ decl: Decl | null }>;
          let mut_xs: readonly number[] | undefined = [];
          export const f = (): readonly number[] => {
            if (s.decl === null || mut_xs === undefined) {
              return [];
            }
            const a = s.decl.items.flatMap((x) => (x > 0 ? [x] : []));
            const b = mut_xs.flatMap((x) => (x > 0 ? [x] : []));
            return [...a, ...b];
          };
          mut_xs = undefined;
        `,
        output: null,
        errors: [
          {
            messageId: 'useArrGenerate',
            suggestions: [
              {
                messageId: 'suggestArrGenerate',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  type Decl = Readonly<{ items: readonly number[] }>;
                  declare const s: Readonly<{ decl: Decl | null }>;
                  let mut_xs: readonly number[] | undefined = [];
                  export const f = (): readonly number[] => {
                    if (s.decl === null || mut_xs === undefined) {
                      return [];
                    }
                    const a = Arr.generate(function* () {
                      for (const x of s.decl.items) {
                        if (x > 0) {
                          yield x;
                        }
                      }
                    });
                    const b = mut_xs.flatMap((x) => (x > 0 ? [x] : []));
                    return [...a, ...b];
                  };
                  mut_xs = undefined;
                `,
              },
            ],
          },
          {
            messageId: 'useArrGenerate',
            suggestions: [
              {
                messageId: 'suggestArrGenerate',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  type Decl = Readonly<{ items: readonly number[] }>;
                  declare const s: Readonly<{ decl: Decl | null }>;
                  let mut_xs: readonly number[] | undefined = [];
                  export const f = (): readonly number[] => {
                    if (s.decl === null || mut_xs === undefined) {
                      return [];
                    }
                    const a = s.decl.items.flatMap((x) => (x > 0 ? [x] : []));
                    const b = Arr.generate(function* () {
                      for (const x of mut_xs) {
                        if (x > 0) {
                          yield x;
                        }
                      }
                    });
                    return [...a, ...b];
                  };
                  mut_xs = undefined;
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'fixes a receiver narrowed through a const or a parameter that is never reassigned, which the generator function still sees narrowed',
        code: dedent`
          declare const c: readonly number[] | undefined;
          export const f = (p: readonly number[] | undefined): readonly number[] => {
            if (c === undefined || p === undefined) {
              return [];
            }
            const a = c.flatMap((x) => (x > 0 ? [x] : []));
            const b = p.flatMap((x) => (x > 0 ? [x] : []));
            return [...a, ...b];
          };
        `,
        output: [
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const c: readonly number[] | undefined;
            export const f = (p: readonly number[] | undefined): readonly number[] => {
              if (c === undefined || p === undefined) {
                return [];
              }
              const a = Arr.generate(function* () {
                for (const x of c) {
                  if (x > 0) {
                    yield x;
                  }
                }
              });
              const b = p.flatMap((x) => (x > 0 ? [x] : []));
              return [...a, ...b];
            };
          `,
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const c: readonly number[] | undefined;
            export const f = (p: readonly number[] | undefined): readonly number[] => {
              if (c === undefined || p === undefined) {
                return [];
              }
              const a = Arr.generate(function* () {
                for (const x of c) {
                  if (x > 0) {
                    yield x;
                  }
                }
              });
              const b = Arr.generate(function* () {
                for (const x of p) {
                  if (x > 0) {
                    yield x;
                  }
                }
              });
              return [...a, ...b];
            };
          `,
        ],
        errors: [
          { messageId: 'useArrGenerate' },
          { messageId: 'useArrGenerate' },
        ],
      },
      {
        name: 'fixes a receiver whose narrowing only makes it a non-empty tuple of the same elements, and a receiver that calls a method',
        code: dedent`
          declare const isNonEmpty: <T,>(
            xs: readonly T[],
          ) => xs is readonly [T, ...T[]];
          declare const o: Readonly<{ names: readonly string[] }>;
          declare const nested: readonly (readonly string[])[];
          export const f = (): readonly string[] => {
            if (!isNonEmpty(o.names)) {
              return [];
            }
            const a = o.names.flatMap((x) => (x !== '' ? [x] : []));
            const b = nested.flat().flatMap((x) => (x !== '' ? [x] : []));
            return [...a, ...b];
          };
        `,
        output: [
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const isNonEmpty: <T,>(
              xs: readonly T[],
            ) => xs is readonly [T, ...T[]];
            declare const o: Readonly<{ names: readonly string[] }>;
            declare const nested: readonly (readonly string[])[];
            export const f = (): readonly string[] => {
              if (!isNonEmpty(o.names)) {
                return [];
              }
              const a = Arr.generate(function* () {
                for (const x of o.names) {
                  if (x !== '') {
                    yield x;
                  }
                }
              });
              const b = nested.flat().flatMap((x) => (x !== '' ? [x] : []));
              return [...a, ...b];
            };
          `,
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const isNonEmpty: <T,>(
              xs: readonly T[],
            ) => xs is readonly [T, ...T[]];
            declare const o: Readonly<{ names: readonly string[] }>;
            declare const nested: readonly (readonly string[])[];
            export const f = (): readonly string[] => {
              if (!isNonEmpty(o.names)) {
                return [];
              }
              const a = Arr.generate(function* () {
                for (const x of o.names) {
                  if (x !== '') {
                    yield x;
                  }
                }
              });
              const b = Arr.generate(function* () {
                for (const x of nested.flat()) {
                  if (x !== '') {
                    yield x;
                  }
                }
              });
              return [...a, ...b];
            };
          `,
        ],
        errors: [
          { messageId: 'useArrGenerate' },
          { messageId: 'useArrGenerate' },
        ],
      },
      {
        name: 'only suggests when a comment would be lost',
        code: dedent`
          declare const xs: readonly number[];
          const ys = xs.flatMap((x) =>
            // keep the positives
            x > 0 ? [x] : [],
          );
        `,
        output: null,
        errors: [
          {
            messageId: 'useArrGenerate',
            suggestions: [
              {
                messageId: 'suggestArrGenerate',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  declare const xs: readonly number[];
                  const ys = Arr.generate(function* () {
                    for (const x of xs) {
                      if (x > 0) {
                        yield x;
                      }
                    }
                  });
                `,
              },
            ],
          },
        ],
      },
    ],
  });
});

describe('prefer-arr-generate through type wrappers', () => {
  tester.run('prefer-arr-generate', preferArrGenerate, {
    valid: [
      {
        name: 'an array widened by `as` to a union with something that is not one',
        code: dedent`
          declare const xs: readonly number[];
          const ys = (
            xs as
              | readonly number[]
              | Readonly<{
                  flatMap: (
                    f: (x: number) => readonly number[],
                  ) => readonly number[];
                }>
          ).flatMap((x) => (x > 0 ? [x] : []));
        `,
      },
      {
        name: 'an array asserted onto something that is not one',
        code: dedent`
          declare const o: Readonly<{
            flatMap: (f: (x: number) => readonly number[]) => readonly number[];
          }>;
          const ys = (o as unknown as readonly number[]).flatMap((x) =>
            x > 0 ? [x] : [],
          );
        `,
      },
    ],
    invalid: [
      {
        name: 'an array widened by `as` to another array is still one at every layer',
        code: dedent`
          declare const xs: readonly number[];
          const ys = (xs as readonly (number | string)[]).flatMap((x) =>
            x !== '' ? [x] : [],
          );
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ys = Arr.generate(function* () {
            for (const x of xs as readonly (number | string)[]) {
              if (x !== '') {
                yield x;
              }
            }
          });
        `,
        errors: [{ messageId: 'useArrGenerate' }],
      },
      {
        name: 'a wrapped receiver or method keeps its wrapper',
        code: dedent`
          declare const xs: readonly number[];
          const a = (xs satisfies readonly number[]).flatMap((x) =>
            x > 0 ? [x] : [],
          );
          const b = xs.flatMap!((x) => (x > 0 ? [x] : []));
        `,
        output: [
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const xs: readonly number[];
            const a = Arr.generate(function* () {
              for (const x of xs satisfies readonly number[]) {
                if (x > 0) {
                  yield x;
                }
              }
            });
            const b = xs.flatMap!((x) => (x > 0 ? [x] : []));
          `,
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const xs: readonly number[];
            const a = Arr.generate(function* () {
              for (const x of xs satisfies readonly number[]) {
                if (x > 0) {
                  yield x;
                }
              }
            });
            const b = Arr.generate(function* () {
              for (const x of xs) {
                if (x > 0) {
                  yield x;
                }
              }
            });
          `,
        ],
        errors: [
          { messageId: 'useArrGenerate' },
          { messageId: 'useArrGenerate' },
        ],
      },
      {
        name: 'a wrapped condition or element keeps its wrapper',
        code: dedent`
          declare const xs: readonly (number | undefined)[];
          const ys = xs.flatMap((x) =>
            ((x !== undefined) satisfies boolean) ? [x!] : [],
          );
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly (number | undefined)[];
          const ys = Arr.generate(function* () {
            for (const x of xs) {
              if ((x !== undefined) satisfies boolean) {
                yield x!;
              }
            }
          });
        `,
        errors: [{ messageId: 'useArrGenerate' }],
      },
      {
        name: 'a wrapped branch or conditional, which may be what types the result, is only suggested',
        code: dedent`
          declare const xs: readonly number[];
          const a = xs.flatMap((x) => (x > 0 ? [x] : ([] as readonly string[])));
          const b = xs.flatMap((x) => (x > 0 ? [x] : []) as readonly number[]);
        `,
        output: null,
        errors: [
          {
            messageId: 'useArrGenerate',
            suggestions: [
              {
                messageId: 'suggestArrGenerate',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  declare const xs: readonly number[];
                  const a = Arr.generate(function* () {
                    for (const x of xs) {
                      if (x > 0) {
                        yield x;
                      }
                    }
                  });
                  const b = xs.flatMap((x) => (x > 0 ? [x] : []) as readonly number[]);
                `,
              },
            ],
          },
          {
            messageId: 'useArrGenerate',
            suggestions: [
              {
                messageId: 'suggestArrGenerate',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  declare const xs: readonly number[];
                  const a = xs.flatMap((x) => (x > 0 ? [x] : ([] as readonly string[])));
                  const b = Arr.generate(function* () {
                    for (const x of xs) {
                      if (x > 0) {
                        yield x;
                      }
                    }
                  });
                `,
              },
            ],
          },
        ],
      },
    ],
  });
});
