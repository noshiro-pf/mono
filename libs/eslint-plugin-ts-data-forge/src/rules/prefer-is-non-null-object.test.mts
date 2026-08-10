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
