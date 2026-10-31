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
