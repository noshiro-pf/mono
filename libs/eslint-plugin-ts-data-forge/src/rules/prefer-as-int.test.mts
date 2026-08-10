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
        {
          name: 'replaces multiple as Int with asInt imports',
          code: dedent`
            const n = 1;
            const result = n as Int;
            const another = (n + 1) as Int;
          `,
          output: dedent`
            import { asInt } from 'ts-data-forge';
            const n = 1;
            const result = asInt(n);
            const another = asInt(n + 1);
          `,
          errors: [
            { messageId: 'useBrandedNumberCastFunction' },
            { messageId: 'useBrandedNumberCastFunction' },
          ],
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
          name: 'adds import even if ts-data-forge import exists',
          code: dedent`
            import { isNonNullObject } from 'ts-data-forge';

            const n = 1;
            const result = n as Int;
          `,
          output: dedent`
            import { asInt } from 'ts-data-forge';
            import { isNonNullObject } from 'ts-data-forge';

            const n = 1;
            const result = asInt(n);
          `,
          errors: [{ messageId: 'useBrandedNumberCastFunction' }],
        },
        {
          name: 'adds import even if ts-data-forge import exists (with other imports)',
          code: dedent`
            import { noop } from './noop.mjs';
            import { isNonNullObject } from 'ts-data-forge';

            const n = 1;
            const result = n as Int;
          `,
          output: dedent`
            import { asInt } from 'ts-data-forge';
            import { noop } from './noop.mjs';
            import { isNonNullObject } from 'ts-data-forge';

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
            import { asUint32 } from 'ts-data-forge';
            import { asInt } from 'ts-data-forge';
            const n = 1;
            const a = asInt(n);
            const b = asUint32(n);
            const c = n as SafeInt;
          `,
          dedent`
            import { asSafeInt } from 'ts-data-forge';
            import { asUint32 } from 'ts-data-forge';
            import { asInt } from 'ts-data-forge';
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
