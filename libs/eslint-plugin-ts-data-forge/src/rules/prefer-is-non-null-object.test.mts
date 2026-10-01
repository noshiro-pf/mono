import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferIsNonNullObject } from './prefer-is-non-null-object.mjs';

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

describe('prefer-is-non-null-object', () => {
  tester.run('prefer-is-non-null-object', preferIsNonNullObject, {
    valid: [
      {
        name: 'ignores non-matching typeof checks',
        code: dedent`
          const u = {};
          const ok = typeof u === "object" && v !== null;
        `,
      },
    ],
    invalid: [
      ...([
        {
          name: 'replaces typeof object check with isNonNullObject import',
          code: dedent`
            const u = {};
            const ok = typeof u === "object" && u !== null;
          `,
          output: dedent`
            import { isNonNullObject } from 'ts-data-forge';
            const u = {};
            const ok = isNonNullObject(u);
          `,
          errors: [{ messageId: 'useIsNonNullObject' }],
        },
        {
          name: 'replaces typeof object check with isNonNullObject import when other imports exist',
          code: dedent`
            import { noop } from './noop.mjs';

            const u = {};
            noop(typeof u === "object" && u !== null);
          `,
          output: dedent`
            import { isNonNullObject } from 'ts-data-forge';
            import { noop } from './noop.mjs';

            const u = {};
            noop(isNonNullObject(u));
          `,
          errors: [{ messageId: 'useIsNonNullObject' }],
        },
        {
          name: 'replaces multiple typeof object checks with isNonNullObject imports',
          code: dedent`
            const u = {};
            const ok = typeof u === "object" && u !== null;
            const ok2 = typeof u === "object" && u !== null;
          `,
          output: dedent`
            import { isNonNullObject } from 'ts-data-forge';
            const u = {};
            const ok = isNonNullObject(u);
            const ok2 = isNonNullObject(u);
          `,
          errors: [
            { messageId: 'useIsNonNullObject' },
            { messageId: 'useIsNonNullObject' },
          ],
        },
      ] as const),

      ...([
        {
          name: 'keeps existing isNonNullObject import',
          code: dedent`
            import { isNonNullObject } from 'ts-data-forge';

            const ok = typeof u === "object" && u !== null;
          `,
          output: dedent`
            import { isNonNullObject } from 'ts-data-forge';

            const ok = isNonNullObject(u);
          `,
          errors: [{ messageId: 'useIsNonNullObject' }],
        },
        {
          name: 'keeps existing isNonNullObject import when other imports exist',
          code: dedent`
            import { noop } from './noop.mjs';
            import { isNonNullObject } from 'ts-data-forge';

            const u = {};
            noop(typeof u === "object" && u !== null);
          `,
          output: dedent`
            import { noop } from './noop.mjs';
            import { isNonNullObject } from 'ts-data-forge';

            const u = {};
            noop(isNonNullObject(u));
          `,
          errors: [{ messageId: 'useIsNonNullObject' }],
        },
      ] as const),

      ...([
        {
          name: 'adds import even if ts-data-forge import exists',
          code: dedent`
            import { asInt } from 'ts-data-forge';

            const ok = typeof u === "object" && u !== null;
          `,
          output: dedent`
            import { isNonNullObject } from 'ts-data-forge';
            import { asInt } from 'ts-data-forge';

            const ok = isNonNullObject(u);
          `,
          errors: [{ messageId: 'useIsNonNullObject' }],
        },
        {
          name: 'adds import even if ts-data-forge import exists (with other imports)',
          code: dedent`
            import { noop } from './noop.mjs';
            import { asInt } from 'ts-data-forge';

            const u = {};
            noop(typeof u === "object" && u !== null);
          `,
          output: dedent`
            import { isNonNullObject } from 'ts-data-forge';
            import { noop } from './noop.mjs';
            import { asInt } from 'ts-data-forge';

            const u = {};
            noop(isNonNullObject(u));
          `,
          errors: [{ messageId: 'useIsNonNullObject' }],
        },
      ] as const),
    ],
  });
}, 20000);

describe('prefer-is-non-null-object through type wrappers', () => {
  tester.run('prefer-is-non-null-object', preferIsNonNullObject, {
    valid: [
      {
        name: 'checks on two different values, one wrapped',
        code: dedent`
          declare const u: unknown;
          declare const v: unknown;
          const ok = typeof u === 'object' && (v satisfies unknown) !== null;
        `,
      },
    ],
    invalid: [
      {
        name: 'the value wrapped on either side',
        code: dedent`
          import { isNonNullObject } from 'ts-data-forge';
          declare const u: unknown;
          const a = typeof u === 'object' && (u satisfies unknown) !== null;
          const b = typeof u === 'object' && u! !== null;
          const c = typeof (u satisfies unknown) === 'object' && u !== null;
          const d = typeof u === ('object' as const) && u !== (null as null);
        `,
        output: dedent`
          import { isNonNullObject } from 'ts-data-forge';
          declare const u: unknown;
          const a = isNonNullObject(u);
          const b = isNonNullObject(u);
          const c = isNonNullObject(u);
          const d = isNonNullObject(u);
        `,
        errors: [
          { messageId: 'useIsNonNullObject' },
          { messageId: 'useIsNonNullObject' },
          { messageId: 'useIsNonNullObject' },
          { messageId: 'useIsNonNullObject' },
        ],
      },
    ],
  });
}, 20000);
