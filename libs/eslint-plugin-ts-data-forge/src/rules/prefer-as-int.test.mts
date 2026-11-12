import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferAsInt } from './prefer-as-int.mjs';

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

describe('prefer-as-int', () => {
  tester.run('prefer-as-int', preferAsInt, {
    valid: [
      {
        name: 'ignores non-Int assertions',
        code: dedent`
          const n = 1;
          const result = n as number;
        `,
      },
    ],
    invalid: [
      ...([
        {
          name: 'replaces as Int with asInt import',
          code: dedent`
            const n = 1;
            const result = n as Int;
          `,
          output: dedent`
            import { asInt } from 'ts-data-forge';
            const n = 1;
            const result = asInt(n);
          `,
          errors: [{ messageId: 'useBrandedNumberCastFunction' }],
        },
        {
          name: 'replaces as Int with asInt import when other imports exist',
          code: dedent`
            import { noop } from './noop.mjs';

            const n = 1;
            noop(n as Int);
          `,
          output: dedent`
            import { asInt } from 'ts-data-forge';
            import { noop } from './noop.mjs';

            const n = 1;
            noop(asInt(n));
          `,
          errors: [{ messageId: 'useBrandedNumberCastFunction' }],
        },
        // {
        //   name: 'replaces as Int with asInt import with another disabled line',
        //   code: dedent`
        //     const n = 1;

        //     // eslint-disable-next-line
        //     const result = n as Int;

        //     const another = (n + 1) as Int;
        //   `,
        //   output: dedent`
        //     import { asInt } from 'ts-data-forge';
        //     const n = 1;

        //     // eslint-disable-next-line
        //     const result = n as Int;

        //     const another = asInt(n + 1);
        //   `,
        //   errors: [{ messageId: 'useBrandedNumberCastFunction' }],
        // },
      ] as const),

      ...([
        {
          name: 'keeps existing asInt import',
          code: dedent`
            import { asInt } from 'ts-data-forge';

            const n = 1;
            const result = n as Int;
          `,
          output: dedent`
            import { asInt } from 'ts-data-forge';

            const n = 1;
            const result = asInt(n);
          `,
          errors: [{ messageId: 'useBrandedNumberCastFunction' }],
        },
        {
          name: 'keeps existing asInt import when other imports exist',
          code: dedent`
            import { noop } from './noop.mjs';
            import { asInt } from 'ts-data-forge';

            const n = 1;
            noop(n as Int);
          `,
          output: dedent`
            import { noop } from './noop.mjs';
            import { asInt } from 'ts-data-forge';

            const n = 1;
            noop(asInt(n));
          `,
          errors: [{ messageId: 'useBrandedNumberCastFunction' }],
        },
      ] as const),

      ...([
        {
          name: 'adds the name to an existing ts-data-forge import',
          code: dedent`
            import { isNonNullObject } from 'ts-data-forge';

            const n = 1;
            const result = n as Int;
          `,
          output: dedent`
            import { isNonNullObject, asInt } from 'ts-data-forge';

            const n = 1;
            const result = asInt(n);
          `,
          errors: [{ messageId: 'useBrandedNumberCastFunction' }],
        },
        {
          name: 'adds the name to an existing ts-data-forge import (with other imports)',
          code: dedent`
            import { noop } from './noop.mjs';
            import { isNonNullObject } from 'ts-data-forge';

            const n = 1;
            const result = n as Int;
          `,
          output: dedent`
            import { noop } from './noop.mjs';
            import { isNonNullObject, asInt } from 'ts-data-forge';

            const n = 1;
            const result = asInt(n);
          `,
          errors: [{ messageId: 'useBrandedNumberCastFunction' }],
        },
      ] as const),
    ],
  });

  // Test cases for other branded number types
  tester.run('prefer-as-int (other types)', preferAsInt, {
    valid: [],
    invalid: [
      {
        name: 'replaces multiple as Int with asInt imports',
        code: dedent`
          const n = 1;
          const result = n as Int;
          const another = (n + 1) as Int;
        `,
        output: [
          dedent`
            import { asInt } from 'ts-data-forge';
            const n = 1;
            const result = asInt(n);
            const another = (n + 1) as Int;
          `,
          dedent`
            import { asInt } from 'ts-data-forge';
            const n = 1;
            const result = asInt(n);
            const another = asInt(n + 1);
          `,
        ],
        errors: [
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
        ],
      },
      {
        name: 'replaces as Uint32 with asUint32',
        code: dedent`
          const n = 1;
          const result = n as Uint32;
        `,
        output: dedent`
          import { asUint32 } from 'ts-data-forge';
          const n = 1;
          const result = asUint32(n);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'replaces as SafeInt with asSafeInt',
        code: dedent`
          const n = 1;
          const result = n as SafeInt;
        `,
        output: dedent`
          import { asSafeInt } from 'ts-data-forge';
          const n = 1;
          const result = asSafeInt(n);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'replaces as PositiveInt with asPositiveInt',
        code: dedent`
          const n = 1;
          const result = n as PositiveInt;
        `,
        output: dedent`
          import { asPositiveInt } from 'ts-data-forge';
          const n = 1;
          const result = asPositiveInt(n);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'replaces multiple different branded types',
        code: dedent`
          const n = 1;
          const a = n as Int;
          const b = n as Uint32;
          const c = n as SafeInt;
        `,
        output: [
          dedent`
            import { asInt } from 'ts-data-forge';
            const n = 1;
            const a = asInt(n);
            const b = n as Uint32;
            const c = n as SafeInt;
          `,
          dedent`
            import { asInt, asUint32 } from 'ts-data-forge';
            const n = 1;
            const a = asInt(n);
            const b = asUint32(n);
            const c = n as SafeInt;
          `,
          dedent`
            import { asInt, asUint32, asSafeInt } from 'ts-data-forge';
            const n = 1;
            const a = asInt(n);
            const b = asUint32(n);
            const c = asSafeInt(n);
          `,
        ],
        errors: [
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-as-int through type wrappers', () => {
  tester.run('prefer-as-int', preferAsInt, {
    valid: [],
    invalid: [
      {
        name: 'an angle-bracket assertion',
        code: dedent`
          import { asInt } from 'ts-data-forge';
          declare const n: number;
          const a = <Int>n;
        `,
        output: dedent`
          import { asInt } from 'ts-data-forge';
          declare const n: number;
          const a = asInt(n);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
    ],
  });
}, 20000);

describe('prefer-as-int with parenthesized operands', () => {
  tester.run('prefer-as-int', preferAsInt, {
    valid: [],
    invalid: [
      {
        name: 'a sequence operand keeps its parentheses',
        code: dedent`
          import { asInt } from 'ts-data-forge';
          declare const log: () => void;
          declare const n: number;
          const a = (log(), n) as Int;
          const b = <Int>(log(), n);
        `,
        output: dedent`
          import { asInt } from 'ts-data-forge';
          declare const log: () => void;
          declare const n: number;
          const a = asInt((log(), n));
          const b = asInt((log(), n));
        `,
        errors: [
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-as-int and the import it adds', () => {
  tester.run('prefer-as-int', preferAsInt, {
    valid: [],
    invalid: [
      {
        name: 'writes the local name of an aliased import',
        code: dedent`
          import { asInt as toInt } from 'ts-data-forge';
          const n = 1;
          const result = n as Int;
        `,
        output: dedent`
          import { asInt as toInt } from 'ts-data-forge';
          const n = 1;
          const result = toInt(n);
        `,
        errors: [
          {
            messageId: 'useBrandedNumberCastFunction',
            data: { typeName: 'Int', functionName: 'toInt' },
          },
        ],
      },
      {
        name: 'no fix when an import type binds the name',
        code: dedent`
          import type { asInt } from 'ts-data-forge';
          const n = 1;
          const result = n as Int;
        `,
        output: null,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'no fix where a local binding takes the name',
        code: dedent`
          const asInt = (x: number): number => x;
          const n = 1;
          const result = n as Int;
        `,
        output: null,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
    ],
  });
}, 20000);

describe('prefer-as-int and where the type name comes from', () => {
  tester.run('prefer-as-int', preferAsInt, {
    valid: [
      {
        name: 'ignores a local type of the same name',
        code: dedent`
          type Int = number & { readonly __myInt: true };
          export const a = 1 as Int;
          export const b = <Int>2;
        `,
      },
      {
        name: 'ignores a type of the same name imported from another package',
        code: dedent`
          import { type Int } from 'other-lib';
          export const a = 1 as Int;
        `,
      },
      {
        name: 'ignores another ts-data-forge type imported under the name',
        code: dedent`
          import { type Uint32 as Int } from 'ts-data-forge';
          export const a = 1 as Int;
        `,
      },
      {
        name: 'ignores a global type of the same name without the ts-type-forge brand',
        code: dedent`
          declare global {
            type Int = number & { readonly __appInt: true };
          }
          declare const n: number;
          export const a = n as Int;
        `,
      },
      {
        name: 'ignores a global enum of the same name',
        code: dedent`
          declare global {
            enum Int {
              A,
            }
          }
          declare const n: number;
          export const a = n as Int;
        `,
      },
      {
        name: 'ignores a global type of the same name that is any',
        code: dedent`
          declare global {
            type Int = any;
          }
          declare const n: number;
          export const a = n as Int;
        `,
      },
      {
        name: 'ignores a type parameter of the same name',
        code: dedent`
          export const f = <Int,>(x: unknown): Int => x as Int;
        `,
      },
    ],
    invalid: [
      {
        name: 'reports Int imported from ts-data-forge',
        code: dedent`
          import { type Int } from 'ts-data-forge';
          export const a = 1 as Int;
        `,
        output: dedent`
          import { type Int, asInt } from 'ts-data-forge';
          export const a = asInt(1);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'reports Int imported from ts-type-forge',
        code: dedent`
          import type { Int } from 'ts-type-forge';
          export const a = <Int>1;
        `,
        output: dedent`
          import { asInt } from 'ts-data-forge';
          import type { Int } from 'ts-type-forge';
          export const a = asInt(1);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'reports Int where a value of the same name is in scope',
        code: dedent`
          import { type Int } from 'ts-data-forge';
          export const f = (n: number): Int => {
            const Int = 5;
            return Int > 0 ? (n as Int) : (0 as Int);
          };
        `,
        output: [
          dedent`
            import { type Int, asInt } from 'ts-data-forge';
            export const f = (n: number): Int => {
              const Int = 5;
              return Int > 0 ? (asInt(n)) : (0 as Int);
            };
          `,
          dedent`
            import { type Int, asInt } from 'ts-data-forge';
            export const f = (n: number): Int => {
              const Int = 5;
              return Int > 0 ? (asInt(n)) : (asInt(0));
            };
          `,
        ],
        errors: [
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
        ],
      },
      {
        name: 'reports Int imported beside a value of the same name',
        code: dedent`
          import { type Int } from 'ts-data-forge';
          const Int = 5;
          declare const n: number;
          export const a = [Int, n as Int];
        `,
        output: dedent`
          import { type Int, asInt } from 'ts-data-forge';
          const Int = 5;
          declare const n: number;
          export const a = [Int, asInt(n)];
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'reports the global Int of ts-type-forge/global',
        code: dedent`
          import type {} from 'ts-type-forge/global';
          declare const n: number;
          export const a = n as Int;
        `,
        output: dedent`
          import { asInt } from 'ts-data-forge';
          import type {} from 'ts-type-forge/global';
          declare const n: number;
          export const a = asInt(n);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'reports Int where a namespace of the same name is in scope',
        code: dedent`
          import { type Int } from 'ts-data-forge';
          declare const n: number;
          export namespace Outer {
            namespace Int {
              export const one = 1;
            }
            export const a = n as Int;
          }
        `,
        output: dedent`
          import { type Int, asInt } from 'ts-data-forge';
          declare const n: number;
          export namespace Outer {
            namespace Int {
              export const one = 1;
            }
            export const a = asInt(n);
          }
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'reports a global type of ts-type-forge/global that renames another brand',
        code: dedent`
          import type {} from 'ts-type-forge/global';
          declare const n: number;
          export const a = n as Uint;
          export const b = n as NonZeroUint32;
        `,
        output: [
          dedent`
            import { asUint } from 'ts-data-forge';
            import type {} from 'ts-type-forge/global';
            declare const n: number;
            export const a = asUint(n);
            export const b = n as NonZeroUint32;
          `,
          dedent`
            import { asUint, asNonZeroUint32 } from 'ts-data-forge';
            import type {} from 'ts-type-forge/global';
            declare const n: number;
            export const a = asUint(n);
            export const b = asNonZeroUint32(n);
          `,
        ],
        errors: [
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
        ],
      },
      {
        name: 'reports the global Int of ts-type-forge/global beside a global value of the same name',
        code: dedent`
          import type {} from 'ts-type-forge/global';
          declare global {
            const Int: unknown;
          }
          declare const n: number;
          export const a = n as Int;
        `,
        output: dedent`
          import { asInt } from 'ts-data-forge';
          import type {} from 'ts-type-forge/global';
          declare global {
            const Int: unknown;
          }
          declare const n: number;
          export const a = asInt(n);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'reports Int with no import (the ts-type-forge/global type)',
        code: dedent`
          declare const n: number;
          export const a = n as Int;
        `,
        output: dedent`
          import { asInt } from 'ts-data-forge';
          declare const n: number;
          export const a = asInt(n);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
    ],
  });
}, 20000);

// Each fixed `output` here is also in `test/as-int-fix-output.mts`, which
// compiles it against the cast functions.
describe('prefer-as-int fixes only a number operand', () => {
  tester.run('prefer-as-int', preferAsInt, {
    valid: [],
    invalid: [
      {
        name: 'fixes an operand typed number',
        code: dedent`
          declare const n: number;
          export const a = n as Int;
          export const b = <Int>n;
        `,
        output: [
          dedent`
            import { asInt } from 'ts-data-forge';
            declare const n: number;
            export const a = asInt(n);
            export const b = <Int>n;
          `,
          dedent`
            import { asInt } from 'ts-data-forge';
            declare const n: number;
            export const a = asInt(n);
            export const b = asInt(n);
          `,
        ],
        errors: [
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
        ],
      },
      {
        name: 'fixes a number literal and a length',
        code: dedent`
          export const a = (1) as Int;
          export const b = 'a'.length as Uint32;
        `,
        output: [
          dedent`
            import { asInt } from 'ts-data-forge';
            export const a = asInt(1);
            export const b = 'a'.length as Uint32;
          `,
          dedent`
            import { asInt, asUint32 } from 'ts-data-forge';
            export const a = asInt(1);
            export const b = asUint32('a'.length);
          `,
        ],
        errors: [
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
        ],
      },
      {
        // The output does not compile (`test/as-int-fix-output.mts`): the known
        // limit stated at the fix in `prefer-as-int.mts`. When the limit is
        // lifted, change this test and the `reassigned` entry in that file
        // together, dropping the entry if the fix is withheld.
        name: 'fixes a cast that initializes a let, although the call is typed Int & 0 (a known limit)',
        code: dedent`
          import type { Int } from 'ts-type-forge';
          export const reassigned = (): Int => {
            let mut_i = 0 as Int;
            mut_i = (mut_i + 1) as Int;
            return mut_i;
          };
        `,
        output: [
          dedent`
            import { asInt } from 'ts-data-forge';
            import type { Int } from 'ts-type-forge';
            export const reassigned = (): Int => {
              let mut_i = asInt(0);
              mut_i = (mut_i + 1) as Int;
              return mut_i;
            };
          `,
          dedent`
            import { asInt } from 'ts-data-forge';
            import type { Int } from 'ts-type-forge';
            export const reassigned = (): Int => {
              let mut_i = asInt(0);
              mut_i = asInt(mut_i + 1);
              return mut_i;
            };
          `,
        ],
        errors: [
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
        ],
      },
      {
        name: 'fixes an operand of another brand',
        code: dedent`
          import { type Int } from 'ts-data-forge';
          declare const i: Int;
          export const a = i as SafeInt;
        `,
        output: dedent`
          import { type Int, asSafeInt } from 'ts-data-forge';
          declare const i: Int;
          export const a = asSafeInt(i);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'fixes an operand that is a number at every wrapper layer',
        code: dedent`
          declare const n: number;
          export const a = (n satisfies number) as Uint32;
        `,
        output: dedent`
          import { asUint32 } from 'ts-data-forge';
          declare const n: number;
          export const a = asUint32(n satisfies number);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'fixes a union of numbers',
        code: dedent`
          import { type SafeInt } from 'ts-data-forge';
          declare const n: 1 | 2 | SafeInt;
          export const a = n as Int;
        `,
        output: dedent`
          import { type SafeInt, asInt } from 'ts-data-forge';
          declare const n: 1 | 2 | SafeInt;
          export const a = asInt(n);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'fixes an operand whose type parameter is constrained to number',
        code: dedent`
          export const f = <N extends number>(n: N) => n as Int;
        `,
        output: dedent`
          import { asInt } from 'ts-data-forge';
          export const f = <N extends number>(n: N) => asInt(n);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'fixes an operand that intersects a type parameter constrained to number',
        code: dedent`
          export const f = <N extends number>(n: N & { readonly tag: 1 }) =>
            n as Int;
        `,
        output: dedent`
          import { asInt } from 'ts-data-forge';
          export const f = <N extends number>(n: N & { readonly tag: 1 }) =>
            asInt(n);
        `,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
      {
        name: 'no fix for an operand that may be a template literal type',
        code: dedent`
          declare const v: number | \`\${number}\`;
          export const a = v as Int;
          export const f = <T extends \`\${number}\`>(t: T) => t as Int;
        `,
        output: null,
        errors: [
          { messageId: 'castNonNumberOperand' },
          { messageId: 'castNonNumberOperand' },
        ],
      },
      {
        name: 'no fix for an operand whose type parameter is not constrained to number',
        code: dedent`
          export const f = <T,>(t: T) => t as Int;
        `,
        output: null,
        errors: [{ messageId: 'castNonNumberOperand' }],
      },
      {
        name: 'no fix for an operand typed unknown',
        code: dedent`
          declare const u: unknown;
          export const a = u as Int;
          export const b = <Int>u;
        `,
        output: null,
        errors: [
          { messageId: 'castNonNumberOperand' },
          { messageId: 'castNonNumberOperand' },
        ],
      },
      {
        name: 'no fix for an operand typed any, string or number | undefined',
        code: dedent`
          declare const x: any;
          declare const s: string;
          declare const m: number | undefined;
          export const a = x as Int;
          export const b = s as Int;
          export const c = m as Int;
        `,
        output: null,
        errors: [
          { messageId: 'castNonNumberOperand' },
          { messageId: 'castNonNumberOperand' },
          { messageId: 'castNonNumberOperand' },
        ],
      },
      {
        name: 'no fix for an operand that is not a number at every wrapper layer',
        code: dedent`
          declare const n: number;
          export const a = n as unknown as Int;
          export const b = JSON.parse('1') as unknown as Int;
          export const c = <Int>(<unknown>n);
        `,
        output: null,
        errors: [
          { messageId: 'castNonNumberOperand' },
          { messageId: 'castNonNumberOperand' },
          { messageId: 'castNonNumberOperand' },
        ],
      },
    ],
  });
}, 20000);

const untypedTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  },
});

describe('prefer-as-int without type information', () => {
  untypedTester.run('prefer-as-int', preferAsInt, {
    valid: [
      {
        name: 'ignores a local type of the same name',
        code: dedent`
          type Int = number;
          export const a = 1 as Int;
        `,
      },
    ],
    invalid: [
      {
        name: 'fixes a number literal, whose type the syntax alone tells',
        code: dedent`
          import type { Int } from 'ts-type-forge';
          export const a = 1 as Int;
          export const b = <Int>-1;
        `,
        output: [
          dedent`
            import { asInt } from 'ts-data-forge';
            import type { Int } from 'ts-type-forge';
            export const a = asInt(1);
            export const b = <Int>-1;
          `,
          dedent`
            import { asInt } from 'ts-data-forge';
            import type { Int } from 'ts-type-forge';
            export const a = asInt(1);
            export const b = asInt(-1);
          `,
        ],
        errors: [
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
        ],
      },
      {
        name: 'fixes a number literal inside type wrappers that keep it a number',
        code: dedent`
          import { type Int } from 'ts-data-forge';
          export const a = (1 satisfies number) as Int;
          export const b = (-1 as number) as Int;
        `,
        output: [
          dedent`
            import { type Int, asInt } from 'ts-data-forge';
            export const a = asInt(1 satisfies number);
            export const b = (-1 as number) as Int;
          `,
          dedent`
            import { type Int, asInt } from 'ts-data-forge';
            export const a = asInt(1 satisfies number);
            export const b = asInt(-1 as number);
          `,
        ],
        errors: [
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
        ],
      },
      {
        name: 'reports without a fix any other operand, whose type is unknown',
        code: dedent`
          import type { Int } from 'ts-type-forge';
          declare const n: number;
          export const a = n as Int;
          export const b = '1' as Int;
          export const c = 1 as unknown as Int;
          export const d = -n as Int;
        `,
        output: null,
        errors: [
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
          { messageId: 'useBrandedNumberCastFunction' },
        ],
      },
      {
        name: "reports without a fix a literal cast to a global type, which may be the project's own",
        code: dedent`
          export const a = 1 as Int;
        `,
        output: null,
        errors: [{ messageId: 'useBrandedNumberCastFunction' }],
      },
    ],
  });
}, 20000);
