import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferRangeForLoop } from './prefer-range-for-loop.mjs';

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

describe('prefer-range-for-loop', () => {
  tester.run('prefer-range-for-loop', preferRangeForLoop, {
    valid: [
      {
        name: 'ignores for loop with const',
        code: dedent`
          for (const i = 0; i < 10; ++i) {
            console.log(i);
          }
        `,
      },
      {
        name: 'ignores for loop with different condition',
        code: dedent`
          for (let i = 0; i <= 10; ++i) {
            console.log(i);
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'replaces for loop with ++i',
        code: dedent`
          for (let i = 0; i < 10; ++i) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          for (const i of range(0, 10)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        name: 'replaces for loop with i++',
        code: dedent`
          for (let i = 0; i < 10; i++) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          for (const i of range(0, 10)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        name: 'replaces for loop with i += 1',
        code: dedent`
          for (let i = 0; i < 10; i += 1) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          for (const i of range(0, 10)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        name: 'replaces for loop with variable bounds',
        code: dedent`
          const begin = 5;
          const end = 15;
          for (let j = begin; j < end; ++j) {
            console.log(j);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          const begin = 5;
          const end = 15;
          for (const j of range(begin, end)) {
            console.log(j);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      // {
      //   name: 'replaces for loop with different condition',
      //   code: dedent`
      //     for (let i = 0; i <= 10; ++i) {
      //       console.log(i);
      //     }
      //   `,
      //   output: dedent`
      //     import { range } from 'ts-data-forge';
      //     for (const i of range(0, 11)) {
      //       console.log(i);
      //     }
      //   `,
      //   errors: [{ messageId: 'useRangeForLoop' }],
      // },
      {
        name: 'replaces for loop with i += 2',
        code: dedent`
          for (let i = 0; i < 10; i += 2) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          for (const i of range(0, 10, 2)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },

      {
        name: 'keeps existing range import',
        code: dedent`
          import { range } from 'ts-data-forge';

          for (let i = 0; i < 10; ++i) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';

          for (const i of range(0, 10)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
    ],
  });
}, 20000);

describe('prefer-range-for-loop through type wrappers', () => {
  tester.run('prefer-range-for-loop', preferRangeForLoop, {
    valid: [
      {
        name: 'a wrapped non-positive step',
        code: dedent`
          declare const n: number;
          for (let i = 0; i < n; i += 0 as number) {
            console.log(i);
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'the loop variable or the step wrapped',
        code: dedent`
          import { range } from 'ts-data-forge';
          import type { SafeInt } from 'ts-type-forge';
          declare const n: SafeInt;
          for (let i = 0; (i satisfies number) < n; ++i) {
            console.log(i);
          }
          for (let j = 0; j! < n; j += 2 as number) {
            console.log(j);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          import type { SafeInt } from 'ts-type-forge';
          declare const n: SafeInt;
          for (const i of range(0, n)) {
            console.log(i);
          }
          for (const j of range(0, n, 2)) {
            console.log(j);
          }
        `,
        errors: [
          { messageId: 'useRangeForLoop' },
          { messageId: 'useRangeForLoop' },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-range-for-loop with parenthesized operands', () => {
  tester.run('prefer-range-for-loop', preferRangeForLoop, {
    valid: [],
    invalid: [
      {
        name: 'a sequence begin keeps its parentheses',
        code: dedent`
          import { range } from 'ts-data-forge';
          import type { SafeInt } from 'ts-type-forge';
          declare const n: SafeInt;
          declare const log: () => void;
          for (let i = (log(), 0); i < n; ++i) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          import type { SafeInt } from 'ts-type-forge';
          declare const n: SafeInt;
          declare const log: () => void;
          for (const i of range((log(), 0), n)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
    ],
  });
}, 20000);

/** The reason a loop is not rewritten when `role` may defy any cast. */
const defiesCast = (role: string): string =>
  `${role} may be a bigint, a string or a number that is not a safe integer, which no cast makes a \`SafeInt\`` as const;

const NEVER_POSITIVE_STEP =
  'the step is never positive, so the loop runs forever or not at all';

/** A loop that `range` cannot replace, for `reasons`. */
const noCastFits = (
  varName: string,
  args: string,
  ...reasons: readonly string[]
): Readonly<{
  messageId: 'noCastFitsRangeForLoop';
  data: Readonly<{ varName: string; args: string; reasons: string }>;
}> =>
  ({
    messageId: 'noCastFitsRangeForLoop',
    data: { varName, args, reasons: reasons.join('; ') },
  }) as const;

/** What a suggestion says of a step whose type decides. */
const STEP_NOTE =
  ' Its step has to be a positive one (`asPositiveSafeInt` throws on anything else): `range` takes no zero step, and with a negative one it runs while the value is above the end, where the loop runs while it is below.';

describe('prefer-range-for-loop where the rewrite would change behavior', () => {
  tester.run('prefer-range-for-loop', preferRangeForLoop, {
    valid: [
      {
        // `const i` could not be assigned.
        name: 'the loop variable assigned in the body',
        code: dedent`
          declare const n: number;
          declare const skip: boolean;
          for (let i = 0; i < n; ++i) {
            if (skip) i += 1;
          }
          for (let j = 0; j < n; ++j) {
            j = n;
          }
        `,
      },
      {
        // `range` takes safe integers only.
        name: 'a step or a begin that is not an integer',
        code: dedent`
          declare const n: number;
          for (let i = 0; i < n; i += 0.5) {
            console.log(i);
          }
          for (let j = 0.5; j < n; ++j) {
            console.log(j);
          }
        `,
      },
      {
        // `i < 2.5` runs to 2, and `range(0, 2.5)` does not compile; no cast
        // makes it, since `asSafeInt(2.5)` throws.
        name: 'a literal begin or end that is not a safe integer, negated or not',
        code: dedent`
          import type { SafeInt } from 'ts-type-forge';
          declare const n: SafeInt;
          for (let i = 0; i < 2.5; ++i) {
            console.log(i);
          }
          for (let j = 0; j < 1e20; ++j) {
            console.log(j);
          }
          for (let k = -2.5; k < n; ++k) {
            console.log(k);
          }
          for (let l = 0; l < -1e20; ++l) {
            console.log(l);
          }
        `,
      },
      {
        // `range` takes no bigint, and no cast makes one a `SafeInt`.
        name: 'a bigint literal begin or end',
        code: dedent`
          declare const b: bigint;
          for (let i = 0n; i < 10n; ++i) {
            console.log(i);
          }
          for (let j = -10n; j < b; ++j) {
            console.log(j);
          }
          for (let k = 0; k < (10n as never); ++k) {
            console.log(k);
          }
        `,
      },
      {
        // A wrapper does not change the value.
        name: 'a wrapped literal that is not a safe integer',
        code: dedent`
          declare const n: number;
          for (let i = -(2.5 as number); i < n; ++i) {
            console.log(i);
          }
        `,
      },
      {
        // `i += '1'` concatenates; no step of `range` does.
        name: 'a literal or template literal step that is not a number, negated or not',
        code: dedent`
          declare const n: number;
          for (let i = 0; i < n; i += '1' as never) {
            console.log(i);
          }
          for (let j = 0; j < n; j += \`1\`) {
            console.log(j);
          }
          for (let k = 0; k < n; k += \`\${n}\`) {
            console.log(k);
          }
          for (let l = 0; l < n; l += -'1') {
            console.log(l);
          }
          for (let m = 0; m < n; m += -true) {
            console.log(m);
          }
        `,
      },
      {
        // `i < n` with a negative step never ends; `range` yields nothing.
        name: 'a negative literal step',
        code: dedent`
          declare const n: number;
          for (let i = 0; i < n; i += -1) {
            console.log(i);
          }
        `,
      },
    ],
    invalid: [
      {
        // The loop tests its end on every iteration; `range` reads it once.
        name: 'an end that is not a literal or a never-reassigned variable gets no fix',
        code: dedent`
          declare const xs: number[];
          declare const getN: () => number;
          let m = 3;
          for (let i = 0; i < xs.length; ++i) {
            xs.pop();
          }
          for (let j = 0; j < getN(); ++j) {
            console.log(j);
          }
          for (let k = 0; k < m; ++k) {
            m -= 1;
          }
        `,
        output: null,
        errors: [
          { messageId: 'useRangeForLoop', suggestions: [] },
          { messageId: 'useRangeForLoop', suggestions: [] },
          { messageId: 'useRangeForLoop', suggestions: [] },
        ],
      },
      {
        // The loop adds the step it reads on each iteration; `range` reads it
        // once. A negated variable is not taken for a stable step, since its
        // type does not say it is never positive.
        name: 'a variable step that is reassigned, or negated, gets no fix',
        code: dedent`
          declare const n: number;
          let step = 1;
          for (let i = 0; i < n; i += step) {
            step *= 2;
          }
          const k = 1;
          for (let j = 0; j < n; j += -k) {
            console.log(j);
          }
        `,
        output: null,
        errors: [
          { messageId: 'useRangeForLoop', suggestions: [] },
          { messageId: 'useRangeForLoop', suggestions: [] },
        ],
      },
      {
        // `-(-5)` is no negative literal: the step is an expression, which the
        // rule does not take for one the same on every iteration.
        name: 'a doubly negated step is still reported',
        code: dedent`
          declare const n: number;
          for (let i = 0; i < n; i += -(-5)) {
            console.log(i);
          }
        `,
        output: null,
        errors: [{ messageId: 'useRangeForLoop', suggestions: [] }],
      },
      {
        // No cast makes a bigint, a string or `2.5` a `SafeInt`, so a suggested
        // `range` call would never compile. A literal is told by its value and
        // left unreported; a type is told only where a suggestion would be
        // offered, and the loop stays reported.
        name: 'a begin, an end or a step that may be no safe integer by its type gets neither a fix nor a suggestion, and a message saying why',
        code: dedent`
          declare const n: number;
          declare const a: bigint;
          declare const b: bigint;
          declare const c: number | bigint;
          declare const branded: bigint & { readonly brand: unique symbol };
          declare const s: string;
          const half = 2.5;
          for (let i = 0; i < b; ++i) {
            console.log(i);
          }
          for (let j = a; j < b; ++j) {
            console.log(j);
          }
          for (let k = 0; k < c; ++k) {
            console.log(k);
          }
          for (let l = 0; l < branded; ++l) {
            console.log(l);
          }
          for (let m = 0; m < (c as number); ++m) {
            console.log(m);
          }
          for (let o = 0; o < half; ++o) {
            console.log(o);
          }
          for (let p = 0; p < n; p += s) {
            console.log(p);
          }
          for (let r = 0; r < n; r += 600 as unknown as bigint) {
            console.log(r);
          }
          const f = <T extends bigint>(t: T): void => {
            for (let q = 0; q < t; ++q) {
              console.log(q);
            }
          };
          const g = <O extends { readonly b: bigint }>(e: O['b']): void => {
            for (let u = 0; u < e; ++u) {
              console.log(u);
            }
          };
          declare const halfSafe: 0.5 & import('ts-type-forge').SafeInt;
          declare const numeric: \`\${number}\`;
          for (let v = 0; v < halfSafe; ++v) {
            console.log(v);
          }
          for (let w = 0; w < numeric; ++w) {
            console.log(w);
          }
        `,
        output: null,
        errors: [
          noCastFits('i', '0, b', defiesCast('the end')),
          noCastFits(
            'j',
            'a, b',
            defiesCast('the begin'),
            defiesCast('the end'),
          ),
          noCastFits('k', '0, c', defiesCast('the end')),
          noCastFits('l', '0, branded', defiesCast('the end')),
          noCastFits('m', '0, c as number', defiesCast('the end')),
          noCastFits('o', '0, half', defiesCast('the end')),
          noCastFits('p', '0, n, s', defiesCast('the step')),
          noCastFits(
            'r',
            '0, n, 600 as unknown as bigint',
            defiesCast('the step'),
          ),
          noCastFits('q', '0, t', defiesCast('the end')),
          noCastFits('u', '0, e', defiesCast('the end')),
          noCastFits('v', '0, halfSafe', defiesCast('the end')),
          noCastFits('w', '0, numeric', defiesCast('the end')),
        ],
      },
      {
        // The reason does not hang on whether `range` could be imported.
        name: 'a loop no cast fits gets its message where another `range` is in scope',
        code: dedent`
          declare const b: bigint;
          declare const range: unknown;
          for (let i = 0; i < b; ++i) {
            console.log(i, range);
          }
        `,
        output: null,
        errors: [noCastFits('i', '0, b', defiesCast('the end'))],
      },
      {
        // Only `-` applied to a number literal is taken for a stable end.
        name: 'a negated variable or non-number literal end gets no rewrite',
        code: dedent`
          const len = 5;
          declare const big: bigint;
          declare const box: any;
          for (let i = 0; i < -len; ++i) {
            console.log(i);
          }
          for (let j = 0; j < -big; ++j) {
            console.log(j);
          }
          for (let k = 0; k < -box; ++k) {
            console.log(k);
          }
          for (let l = 0; l < -'abc'; ++l) {
            console.log(l);
          }
        `,
        output: null,
        errors: [
          { messageId: 'useRangeForLoop', suggestions: [] },
          { messageId: 'useRangeForLoop', suggestions: [] },
          { messageId: 'useRangeForLoop', suggestions: [] },
          { messageId: 'useRangeForLoop', suggestions: [] },
        ],
      },
      {
        // `isStableBound` does not ask the type, so an `any` end or step is
        // taken for stable (a known case, #4135); `any` does not fit `range`,
        // so the rewrite is a suggestion, not a fix.
        name: 'a never-reassigned end or step typed any is suggested',
        code: dedent`
          import type { SafeInt } from 'ts-type-forge';
          declare const box: any;
          declare const n: SafeInt;
          for (let i = 0; i < box; ++i) {
            console.log(i);
          }
          for (let j = 0; j < n; j += box) {
            console.log(j);
          }
        `,
        output: null,
        errors: [
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  import type { SafeInt } from 'ts-type-forge';
                  declare const box: any;
                  declare const n: SafeInt;
                  for (const i of range(0, box)) {
                    console.log(i);
                  }
                  for (let j = 0; j < n; j += box) {
                    console.log(j);
                  }
                `,
              },
            ],
          },
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  import type { SafeInt } from 'ts-type-forge';
                  declare const box: any;
                  declare const n: SafeInt;
                  for (let i = 0; i < box; ++i) {
                    console.log(i);
                  }
                  for (const j of range(0, n, box)) {
                    console.log(j);
                  }
                `,
              },
            ],
          },
        ],
      },
      {
        // `isStableBound` counts no write that declares (a known case, #4135),
        // so the `var` in the body, which writes `n`, does not stop the fix.
        name: 'an end a var declaration in the body writes is still fixed',
        code: dedent`
          import type { SafeInt } from 'ts-type-forge';
          declare const k: SafeInt;
          declare const m: SafeInt;
          var n = k;
          for (let i = 0; i < n; ++i) {
            var n = m;
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          import type { SafeInt } from 'ts-type-forge';
          declare const k: SafeInt;
          declare const m: SafeInt;
          var n = k;
          for (const i of range(0, n)) {
            var n = m;
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        // A type parameter constrained to a non-positive number is never
        // positive either.
        name: 'a step typed by a type parameter constrained to a negative literal gets a message saying why',
        code: dedent`
          import type { SafeInt } from 'ts-type-forge';
          const f = <S extends -1>(n: SafeInt, s: S): void => {
            for (let i = 0; i < n; i += s) {
              console.log(i);
            }
          };
        `,
        output: null,
        errors: [noCastFits('i', '0, n, s', NEVER_POSITIVE_STEP)],
      },
      {
        // An unconstrained type parameter may be a `number` a cast is for.
        name: 'a bound typed by an unconstrained type parameter is suggested',
        code: dedent`
          const f = <T,>(t: T): void => {
            for (let i = 0; i < t; ++i) {
              console.log(i);
            }
          };
        `,
        output: null,
        errors: [
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  const f = <T,>(t: T): void => {
                    for (const i of range(0, t)) {
                      console.log(i);
                    }
                  };
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'a parameter that is never reassigned is a fixed end',
        code: dedent`
          import type { SafeInt } from 'ts-type-forge';
          const f = (n: SafeInt): void => {
            for (let i = 0; i < n; ++i) {
              console.log(i);
            }
          };
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          import type { SafeInt } from 'ts-type-forge';
          const f = (n: SafeInt): void => {
            for (const i of range(0, n)) {
              console.log(i);
            }
          };
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
    ],
  });
}, 20000);

const unionStepCode = dedent`
  import type {
    NegativeSafeInt,
    PositiveSafeInt,
    SafeInt,
    SafeUint,
  } from 'ts-type-forge';
  const big = 600;
  const f = (
    n: SafeInt,
    either: PositiveSafeInt | NegativeSafeInt,
    sign: 1 | -1,
    u: SafeUint,
  ): void => {
    for (let i = 0; i < n; i += either) {
      console.log(i);
    }
    for (let j = 0; j < n; j += sign) {
      console.log(j);
    }
    for (let k = 0; k < n; k += u) {
      console.log(k);
    }
    for (let l = 0; l < n; l += big) {
      console.log(l);
    }
  };
`;

// `range` takes a `SafeInt` or an integer literal from -512 to 511. Every
// `output` here is also in `test/range-for-loop-fix-output.mts`, which
// `check:types` compiles.
describe('prefer-range-for-loop fixes only what `range` accepts', () => {
  tester.run('prefer-range-for-loop', preferRangeForLoop, {
    valid: [],
    invalid: [
      {
        name: 'the literals at the edges of the small-integer range are fixed',
        code: dedent`
          for (let i = -512; i < 511; ++i) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          for (const i of range(-512, 511)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        name: 'an end typed SafeInt, Uint32 or a union of fitting types is fixed',
        code: dedent`
          import type { SafeInt, SafeUint, Uint32 } from 'ts-type-forge';
          const f = (a: SafeInt, b: Uint32, c: SafeUint | 3): void => {
            for (let i = 0; i < a; ++i) {
              console.log(i);
            }
            for (let j = 0; j < b; ++j) {
              console.log(j);
            }
            for (let k = 0; k < c; ++k) {
              console.log(k);
            }
          };
        `,
        output: [
          dedent`
            import { range } from 'ts-data-forge';
            import type { SafeInt, SafeUint, Uint32 } from 'ts-type-forge';
            const f = (a: SafeInt, b: Uint32, c: SafeUint | 3): void => {
              for (const i of range(0, a)) {
                console.log(i);
              }
              for (let j = 0; j < b; ++j) {
                console.log(j);
              }
              for (let k = 0; k < c; ++k) {
                console.log(k);
              }
            };
          `,
          dedent`
            import { range } from 'ts-data-forge';
            import type { SafeInt, SafeUint, Uint32 } from 'ts-type-forge';
            const f = (a: SafeInt, b: Uint32, c: SafeUint | 3): void => {
              for (const i of range(0, a)) {
                console.log(i);
              }
              for (const j of range(0, b)) {
                console.log(j);
              }
              for (const k of range(0, c)) {
                console.log(k);
              }
            };
          `,
        ],
        errors: [
          { messageId: 'useRangeForLoop' },
          { messageId: 'useRangeForLoop' },
          { messageId: 'useRangeForLoop' },
        ],
      },
      {
        name: 'a begin typed SafeInt is fixed',
        code: dedent`
          import type { SafeInt } from 'ts-type-forge';
          const f = (from: SafeInt, to: SafeInt): void => {
            for (let i = from; i < to; ++i) {
              console.log(i);
            }
          };
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          import type { SafeInt } from 'ts-type-forge';
          const f = (from: SafeInt, to: SafeInt): void => {
            for (const i of range(from, to)) {
              console.log(i);
            }
          };
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        // An intersection is a subset of each member: `2 & Tag` is a `2`.
        name: 'a tagged literal end or step that fits is fixed',
        code: dedent`
          type Tag = Readonly<{ tag: 'tag' }>;
          const f = (last: 10 & Tag, by: 2 & Tag): void => {
            for (let i = 0; i < last; i += by) {
              console.log(i);
            }
          };
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          type Tag = Readonly<{ tag: 'tag' }>;
          const f = (last: 10 & Tag, by: 2 & Tag): void => {
            for (const i of range(0, last, by)) {
              console.log(i);
            }
          };
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        // `-` applied to a literal is the same on every iteration.
        name: 'negative literal bounds in the small-integer range are fixed',
        code: dedent`
          for (let i = -10; i < -5; ++i) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          for (const i of range(-10, -5)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        // The update is read through type wrappers, as the test is.
        name: 'a loop variable updated through a type wrapper is fixed',
        code: dedent`
          import { range } from 'ts-data-forge';
          for (let i = 0; i < 10; i! += 2) {
            console.log(i);
          }
          for (let j = 0; j < 10; (j as number)++) {
            console.log(j);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          for (const i of range(0, 10, 2)) {
            console.log(i);
          }
          for (const j of range(0, 10)) {
            console.log(j);
          }
        `,
        errors: [
          { messageId: 'useRangeForLoop' },
          { messageId: 'useRangeForLoop' },
        ],
      },
      {
        name: 'a step that is a positive safe integer, by type or by value, is fixed',
        code: dedent`
          import { range } from 'ts-data-forge';
          import type { PositiveSafeInt, SafeInt } from 'ts-type-forge';
          const two = 2;
          const f = (n: SafeInt, step: PositiveSafeInt): void => {
            for (let i = 0; i < n; i += step) {
              console.log(i);
            }
            for (let j = 0; j < n; j += two) {
              console.log(j);
            }
            for (let k = 0; k < n; k += 511) {
              console.log(k);
            }
          };
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          import type { PositiveSafeInt, SafeInt } from 'ts-type-forge';
          const two = 2;
          const f = (n: SafeInt, step: PositiveSafeInt): void => {
            for (const i of range(0, n, step)) {
              console.log(i);
            }
            for (const j of range(0, n, two)) {
              console.log(j);
            }
            for (const k of range(0, n, 511)) {
              console.log(k);
            }
          };
        `,
        errors: [
          { messageId: 'useRangeForLoop' },
          { messageId: 'useRangeForLoop' },
          { messageId: 'useRangeForLoop' },
        ],
      },
      {
        name: 'an end typed number is suggested, not fixed',
        code: dedent`
          const f = (xs: readonly string[], n: number): void => {
            const len = xs.length;
            for (let i = 0; i < len; ++i) {
              console.log(xs[i]);
            }
            for (let j = 0; j < n; j++) console.log(j);
          };
        `,
        output: null,
        errors: [
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  const f = (xs: readonly string[], n: number): void => {
                    const len = xs.length;
                    for (const i of range(0, len)) {
                      console.log(xs[i]);
                    }
                    for (let j = 0; j < n; j++) console.log(j);
                  };
                `,
              },
            ],
          },
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  const f = (xs: readonly string[], n: number): void => {
                    const len = xs.length;
                    for (let i = 0; i < len; ++i) {
                      console.log(xs[i]);
                    }
                    for (const j of range(0, n)) console.log(j);
                  };
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'a literal outside the small-integer range is suggested, not fixed',
        code: dedent`
          import { range } from 'ts-data-forge';
          for (let i = 0; i < 512; ++i) {
            console.log(i);
          }
          for (let j = -513; j < 0; ++j) {
            console.log(j);
          }
          for (let k = 0; k < 10; k += 512) {
            console.log(k);
          }
        `,
        output: null,
        errors: [
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  for (const i of range(0, 512)) {
                    console.log(i);
                  }
                  for (let j = -513; j < 0; ++j) {
                    console.log(j);
                  }
                  for (let k = 0; k < 10; k += 512) {
                    console.log(k);
                  }
                `,
              },
            ],
          },
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  for (let i = 0; i < 512; ++i) {
                    console.log(i);
                  }
                  for (const j of range(-513, 0)) {
                    console.log(j);
                  }
                  for (let k = 0; k < 10; k += 512) {
                    console.log(k);
                  }
                `,
              },
            ],
          },
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  for (let i = 0; i < 512; ++i) {
                    console.log(i);
                  }
                  for (let j = -513; j < 0; ++j) {
                    console.log(j);
                  }
                  for (const k of range(0, 10, 512)) {
                    console.log(k);
                  }
                `,
              },
            ],
          },
        ],
      },
      {
        // TypeScript types `-5` as `-5`, but `-(5)` as a `number`.
        name: 'a negated literal in parentheses is suggested, not fixed',
        code: dedent`
          import { range } from 'ts-data-forge';
          for (let i = -(5); i < 0; ++i) {
            console.log(i);
          }
        `,
        output: null,
        errors: [
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  for (const i of range(-(5), 0)) {
                    console.log(i);
                  }
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'a begin or an end typed Int, FiniteNumber or number is suggested, not fixed',
        code: dedent`
          import { range } from 'ts-data-forge';
          import type { FiniteNumber, Int } from 'ts-type-forge';
          const f = (a: Int, b: FiniteNumber, c: number): void => {
            for (let i = 0; i < a; ++i) {
              console.log(i);
            }
            for (let j = 0; j < b; ++j) {
              console.log(j);
            }
            for (let k = c; k < 10; ++k) {
              console.log(k);
            }
          };
        `,
        output: null,
        errors: [
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  import type { FiniteNumber, Int } from 'ts-type-forge';
                  const f = (a: Int, b: FiniteNumber, c: number): void => {
                    for (const i of range(0, a)) {
                      console.log(i);
                    }
                    for (let j = 0; j < b; ++j) {
                      console.log(j);
                    }
                    for (let k = c; k < 10; ++k) {
                      console.log(k);
                    }
                  };
                `,
              },
            ],
          },
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  import type { FiniteNumber, Int } from 'ts-type-forge';
                  const f = (a: Int, b: FiniteNumber, c: number): void => {
                    for (let i = 0; i < a; ++i) {
                      console.log(i);
                    }
                    for (const j of range(0, b)) {
                      console.log(j);
                    }
                    for (let k = c; k < 10; ++k) {
                      console.log(k);
                    }
                  };
                `,
              },
            ],
          },
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  import type { FiniteNumber, Int } from 'ts-type-forge';
                  const f = (a: Int, b: FiniteNumber, c: number): void => {
                    for (let i = 0; i < a; ++i) {
                      console.log(i);
                    }
                    for (let j = 0; j < b; ++j) {
                      console.log(j);
                    }
                    for (const k of range(c, 10)) {
                      console.log(k);
                    }
                  };
                `,
              },
            ],
          },
        ],
      },
      {
        // `range`'s step is a `NonZeroSafeInt`: a `SafeInt` may be zero.
        name: 'a step typed number or SafeInt is suggested, not fixed',
        code: dedent`
          import { range } from 'ts-data-forge';
          import type { SafeInt } from 'ts-type-forge';
          const f = (n: SafeInt, s: number, t: SafeInt): void => {
            for (let i = 0; i < n; i += s) {
              console.log(i);
            }
            for (let j = 0; j < n; j += t) {
              console.log(j);
            }
          };
        `,
        output: null,
        errors: [
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  import type { SafeInt } from 'ts-type-forge';
                  const f = (n: SafeInt, s: number, t: SafeInt): void => {
                    for (const i of range(0, n, s)) {
                      console.log(i);
                    }
                    for (let j = 0; j < n; j += t) {
                      console.log(j);
                    }
                  };
                `,
              },
            ],
          },
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  import type { SafeInt } from 'ts-type-forge';
                  const f = (n: SafeInt, s: number, t: SafeInt): void => {
                    for (let i = 0; i < n; i += s) {
                      console.log(i);
                    }
                    for (const j of range(0, n, t)) {
                      console.log(j);
                    }
                  };
                `,
              },
            ],
          },
        ],
      },
      {
        // With a negative step, `range` runs while the value is above the end,
        // where the loop runs while it is below: `range(10, 5, -1)` yields 10
        // to 6, where the loop runs not at all. A step that may be negative is
        // suggested with a note naming the cast it needs; one that its type
        // says is never positive (a number literal, a brand, a union or an
        // intersection of those) gets neither a fix nor a suggestion, and a
        // message saying why.
        name: 'a step typed NonZeroSafeInt is suggested, one never positive by its type gets a message saying why',
        code: dedent`
          import type {
            NegativeSafeInt,
            NonPositiveSafeInt,
            NonZeroSafeInt,
            PositiveSafeInt,
            SafeInt,
          } from 'ts-type-forge';
          const back = -1;
          const f = (
            n: SafeInt,
            s: NonZeroSafeInt,
            neg: NegativeSafeInt,
            nonPos: NonPositiveSafeInt,
            down: -1 | -2,
            negOrZero: NegativeSafeInt | 0,
            tagged: -1 & { readonly tag: unique symbol },
            liar: -1 & PositiveSafeInt,
          ): void => {
            for (let i = 0; i < n; i += s) {
              console.log(i);
            }
            for (let j = 10; j < n; j += back) {
              console.log(j);
            }
            for (let k = 10; k < n; k += neg) {
              console.log(k);
            }
            for (let l = 10; l < n; l += nonPos) {
              console.log(l);
            }
            for (let m = 10; m < n; m += down) {
              console.log(m);
            }
            for (let o = 10; o < n; o += negOrZero) {
              console.log(o);
            }
            for (let p = 10; p < n; p += tagged) {
              console.log(p);
            }
            for (let q = 10; q < n; q += liar) {
              console.log(q);
            }
          };
        `,
        output: null,
        errors: [
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                data: {
                  varName: 'i',
                  args: '0, n, s',
                  smallIntMin: -512,
                  smallIntMax: 511,
                  stepNote: STEP_NOTE,
                },
                output: dedent`
                  import { range } from 'ts-data-forge';
                  import type {
                    NegativeSafeInt,
                    NonPositiveSafeInt,
                    NonZeroSafeInt,
                    PositiveSafeInt,
                    SafeInt,
                  } from 'ts-type-forge';
                  const back = -1;
                  const f = (
                    n: SafeInt,
                    s: NonZeroSafeInt,
                    neg: NegativeSafeInt,
                    nonPos: NonPositiveSafeInt,
                    down: -1 | -2,
                    negOrZero: NegativeSafeInt | 0,
                    tagged: -1 & { readonly tag: unique symbol },
                    liar: -1 & PositiveSafeInt,
                  ): void => {
                    for (const i of range(0, n, s)) {
                      console.log(i);
                    }
                    for (let j = 10; j < n; j += back) {
                      console.log(j);
                    }
                    for (let k = 10; k < n; k += neg) {
                      console.log(k);
                    }
                    for (let l = 10; l < n; l += nonPos) {
                      console.log(l);
                    }
                    for (let m = 10; m < n; m += down) {
                      console.log(m);
                    }
                    for (let o = 10; o < n; o += negOrZero) {
                      console.log(o);
                    }
                    for (let p = 10; p < n; p += tagged) {
                      console.log(p);
                    }
                    for (let q = 10; q < n; q += liar) {
                      console.log(q);
                    }
                  };
                `,
              },
            ],
          },
          noCastFits('j', '10, n, back', NEVER_POSITIVE_STEP),
          noCastFits('k', '10, n, neg', NEVER_POSITIVE_STEP),
          noCastFits('l', '10, n, nonPos', NEVER_POSITIVE_STEP),
          noCastFits('m', '10, n, down', NEVER_POSITIVE_STEP),
          noCastFits('o', '10, n, negOrZero', NEVER_POSITIVE_STEP),
          noCastFits('p', '10, n, tagged', NEVER_POSITIVE_STEP),
          noCastFits('q', '10, n, liar', NEVER_POSITIVE_STEP),
        ],
      },
      {
        // A union with a member that may be positive may be positive, as a
        // `NonZeroSafeInt` may; a step that cannot be negative but does not fit
        // still needs the cast the note names.
        name: 'a step that may be positive by its type, a union included, is suggested with the cast it needs',
        code: unionStepCode,
        output: null,
        errors: ['either', 'sign', 'u', 'big'].map((step, index) => {
          const varName = ['i', 'j', 'k', 'l'][index] ?? '';

          return {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: `import { range } from 'ts-data-forge';\n${unionStepCode.replace(
                  `for (let ${varName} = 0; ${varName} < n; ${varName} += ${step})`,
                  `for (const ${varName} of range(0, n, ${step}))`,
                )}`,
                data: {
                  varName,
                  args: `0, n, ${step}`,
                  smallIntMin: -512,
                  smallIntMax: 511,
                  stepNote: STEP_NOTE,
                },
              },
            ],
          } as const;
        }),
      },
      {
        // The value of a literal step is known to be positive, whatever a cast
        // on it claims.
        name: 'a large literal step cast to a negative type is still suggested',
        code: dedent`
          import type { SafeInt } from 'ts-type-forge';
          const f = (n: SafeInt): void => {
            for (let i = 0; i < n; i += 600 as -1) {
              console.log(i);
            }
          };
        `,
        output: null,
        errors: [
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  import type { SafeInt } from 'ts-type-forge';
                  const f = (n: SafeInt): void => {
                    for (const i of range(0, n, 600 as -1)) {
                      console.log(i);
                    }
                  };
                `,
              },
            ],
          },
        ],
      },
      {
        // The literal 600 is no parameter type of `range`, so the step is not
        // fixed, but the suggestion keeps the cast the author wrote.
        name: 'a wrapped literal step too large to fit keeps its wrapper',
        code: dedent`
          import type { PositiveSafeInt, SafeInt } from 'ts-type-forge';
          const f = (n: SafeInt): void => {
            for (let i = 0; i < n; i += 600 as PositiveSafeInt) {
              console.log(i);
            }
          };
        `,
        output: null,
        errors: [
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                data: {
                  varName: 'i',
                  args: '0, n, 600 as PositiveSafeInt',
                  smallIntMin: -512,
                  smallIntMax: 511,
                  stepNote: STEP_NOTE,
                },
                output: dedent`
                  import { range } from 'ts-data-forge';
                  import type { PositiveSafeInt, SafeInt } from 'ts-type-forge';
                  const f = (n: SafeInt): void => {
                    for (const i of range(0, n, 600 as PositiveSafeInt)) {
                      console.log(i);
                    }
                  };
                `,
              },
            ],
          },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-range-for-loop asks every layer of a wrapped bound for its type', () => {
  tester.run('prefer-range-for-loop', preferRangeForLoop, {
    valid: [],
    invalid: [
      {
        name: 'a bound that fits at every layer is fixed with its wrapper kept',
        code: dedent`
          import { range } from 'ts-data-forge';
          import type { SafeInt, SafeUint } from 'ts-type-forge';
          const f = (n: SafeUint, m: SafeInt | undefined): void => {
            for (let i = 0; i < (n satisfies SafeUint); ++i) {
              console.log(i);
            }
            for (let j = 0; j < (n as SafeInt); ++j) {
              console.log(j);
            }
          };
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          import type { SafeInt, SafeUint } from 'ts-type-forge';
          const f = (n: SafeUint, m: SafeInt | undefined): void => {
            for (const i of range(0, n satisfies SafeUint)) {
              console.log(i);
            }
            for (const j of range(0, n as SafeInt)) {
              console.log(j);
            }
          };
        `,
        errors: [
          { messageId: 'useRangeForLoop' },
          { messageId: 'useRangeForLoop' },
        ],
      },
      {
        // A narrowing cast does not make the value a `SafeInt`, and a widening
        // one makes the call fail to type-check: one layer that does not fit is
        // enough.
        name: 'a bound cast from or to a type that does not fit is suggested, not fixed',
        code: dedent`
          import { range } from 'ts-data-forge';
          import type { SafeInt } from 'ts-type-forge';
          const f = (n: number, k: SafeInt, m: SafeInt | undefined): void => {
            for (let i = 0; i < (n as SafeInt); ++i) {
              console.log(i);
            }
            for (let j = 0; j < (k as number); ++j) {
              console.log(j);
            }
            for (let l = 0; l < m!; ++l) {
              console.log(l);
            }
          };
        `,
        output: null,
        errors: [
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  import type { SafeInt } from 'ts-type-forge';
                  const f = (n: number, k: SafeInt, m: SafeInt | undefined): void => {
                    for (const i of range(0, n as SafeInt)) {
                      console.log(i);
                    }
                    for (let j = 0; j < (k as number); ++j) {
                      console.log(j);
                    }
                    for (let l = 0; l < m!; ++l) {
                      console.log(l);
                    }
                  };
                `,
              },
            ],
          },
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  import type { SafeInt } from 'ts-type-forge';
                  const f = (n: number, k: SafeInt, m: SafeInt | undefined): void => {
                    for (let i = 0; i < (n as SafeInt); ++i) {
                      console.log(i);
                    }
                    for (const j of range(0, k as number)) {
                      console.log(j);
                    }
                    for (let l = 0; l < m!; ++l) {
                      console.log(l);
                    }
                  };
                `,
              },
            ],
          },
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  import type { SafeInt } from 'ts-type-forge';
                  const f = (n: number, k: SafeInt, m: SafeInt | undefined): void => {
                    for (let i = 0; i < (n as SafeInt); ++i) {
                      console.log(i);
                    }
                    for (let j = 0; j < (k as number); ++j) {
                      console.log(j);
                    }
                    for (const l of range(0, m!)) {
                      console.log(l);
                    }
                  };
                `,
              },
            ],
          },
        ],
      },
      {
        // The brand keys alone do not make a type ts-type-forge's `SafeInt`:
        // `range` does not take this one.
        name: 'a look-alike of the SafeInt brand is suggested, not fixed',
        code: dedent`
          type MyInt = number & {
            readonly NaNValue: false;
            readonly Finite: true;
            readonly Int: true;
            readonly SafeInt: true;
          };
          declare const n: MyInt;
          for (let i = 0; i < n; ++i) {
            console.log(i);
          }
        `,
        output: null,
        errors: [
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  type MyInt = number & {
                    readonly NaNValue: false;
                    readonly Finite: true;
                    readonly Int: true;
                    readonly SafeInt: true;
                  };
                  declare const n: MyInt;
                  for (const i of range(0, n)) {
                    console.log(i);
                  }
                `,
              },
            ],
          },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-range-for-loop keeps the comments of the loop head', () => {
  tester.run('prefer-range-for-loop', preferRangeForLoop, {
    valid: [],
    invalid: [
      {
        // The rewrite replaces the whole head, comment included.
        name: 'a comment in the head gets neither a fix nor a suggestion',
        code: dedent`
          declare const n: number;
          for (let i = /* b */ 0; i < 3 /* c */; ++i) console.log(i);
          for (let j = 0; j < n; ++j /* d */) console.log(j);
          for (
            let k = 0;
            k < 3;
            ++k // e
          ) {
            console.log(k);
          }
        `,
        output: null,
        errors: [
          { messageId: 'useRangeForLoop' },
          { messageId: 'useRangeForLoop' },
          { messageId: 'useRangeForLoop' },
        ],
      },
      {
        name: 'a comment in the body is kept by the fix',
        code: dedent`
          import { range } from 'ts-data-forge';
          for (let i = 0; i < 3; ++i) {
            // a
            console.log(i); /* b */
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          for (const i of range(0, 3)) {
            // a
            console.log(i); /* b */
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
    ],
  });
}, 20000);

describe('prefer-range-for-loop without type information', () => {
  const untypedTester = new RuleTester({
    languageOptions: {
      parser,
      parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
    },
  });

  untypedTester.run('prefer-range-for-loop', preferRangeForLoop, {
    valid: [],
    invalid: [
      {
        // A bare integer literal is its own type, so its value decides.
        name: 'literal bounds in the small-integer range are fixed',
        code: dedent`
          import { range } from 'ts-data-forge';
          for (let i = -512; i < 511; i += 2) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          for (const i of range(-512, 511, 2)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        // Nothing vouches for the type of anything else, so nothing else is
        // written unasked.
        name: 'any other bound is a suggestion',
        code: dedent`
          import { range } from 'ts-data-forge';
          declare const n: number;
          for (let i = 0; i < n; ++i) {
            console.log(i);
          }
          for (let j = 0; j < 512; ++j) {
            console.log(j);
          }
          for (let k = 0; k < (10 as number); ++k) {
            console.log(k);
          }
        `,
        output: null,
        errors: [
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  declare const n: number;
                  for (const i of range(0, n)) {
                    console.log(i);
                  }
                  for (let j = 0; j < 512; ++j) {
                    console.log(j);
                  }
                  for (let k = 0; k < (10 as number); ++k) {
                    console.log(k);
                  }
                `,
              },
            ],
          },
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  declare const n: number;
                  for (let i = 0; i < n; ++i) {
                    console.log(i);
                  }
                  for (const j of range(0, 512)) {
                    console.log(j);
                  }
                  for (let k = 0; k < (10 as number); ++k) {
                    console.log(k);
                  }
                `,
              },
            ],
          },
          {
            messageId: 'useRangeForLoop',
            suggestions: [
              {
                messageId: 'suggestRangeForLoop',
                output: dedent`
                  import { range } from 'ts-data-forge';
                  declare const n: number;
                  for (let i = 0; i < n; ++i) {
                    console.log(i);
                  }
                  for (let j = 0; j < 512; ++j) {
                    console.log(j);
                  }
                  for (const k of range(0, 10 as number)) {
                    console.log(k);
                  }
                `,
              },
            ],
          },
        ],
      },
    ],
  });
}, 20000);
