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
            import { asInt, isNonNullObject } from 'ts-data-forge';

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
            import { noop } from './noop.mjs';
            import { asInt, isNonNullObject } from 'ts-data-forge';

            const u = {};
            noop(isNonNullObject(u));
          `,
          errors: [{ messageId: 'useIsNonNullObject' }],
        },
      ] as const),
      {
        name: 'replaces multiple typeof object checks with isNonNullObject imports',
        code: dedent`
          const u = {};
          const ok = typeof u === "object" && u !== null;
          const ok2 = typeof u === "object" && u !== null;
        `,
        output: [
          dedent`
            import { isNonNullObject } from 'ts-data-forge';
            const u = {};
            const ok = isNonNullObject(u);
            const ok2 = typeof u === "object" && u !== null;
          `,
          dedent`
            import { isNonNullObject } from 'ts-data-forge';
            const u = {};
            const ok = isNonNullObject(u);
            const ok2 = isNonNullObject(u);
          `,
        ],
        errors: [
          { messageId: 'useIsNonNullObject' },
          { messageId: 'useIsNonNullObject' },
        ],
      },
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
      {
        name: 'both halves wrapped as a whole',
        code: dedent`
          import { isNonNullObject } from 'ts-data-forge';
          declare const u: unknown;
          const ok =
            ((typeof u === 'object') satisfies boolean) &&
            ((u !== null) as boolean);
        `,
        output: dedent`
          import { isNonNullObject } from 'ts-data-forge';
          declare const u: unknown;
          const ok =
            isNonNullObject(u);
        `,
        errors: [{ messageId: 'useIsNonNullObject' }],
      },
    ],
  });
}, 20000);

describe('prefer-is-non-null-object in other forms', () => {
  tester.run('prefer-is-non-null-object', preferIsNonNullObject, {
    valid: [
      {
        name: 'the two halves joined by `||`',
        code: dedent`
          declare const u: unknown;
          const ok = typeof u === 'object' || u !== null;
        `,
      },
      {
        name: 'the two halves not next to each other in the chain',
        code: dedent`
          declare const u: unknown;
          declare const a: boolean;
          const ok = typeof u === 'object' && a && u !== null;
        `,
      },
      {
        name: 'an undefined check is not a null check',
        code: dedent`
          declare const u: unknown;
          const ok = u !== undefined && typeof u === 'object';
        `,
      },
      {
        name: 'the halves split by parentheses',
        code: dedent`
          declare const u: unknown;
          declare const b: boolean;
          const ok = typeof u === 'object' && (u !== null && b);
        `,
      },
    ],
    invalid: [
      {
        name: 'the halves in reverse order',
        code: dedent`
          declare const u: unknown;
          const ok = u !== null && typeof u === 'object';
        `,
        output: dedent`
          import { isNonNullObject } from 'ts-data-forge';
          declare const u: unknown;
          const ok = isNonNullObject(u);
        `,
        errors: [{ messageId: 'useIsNonNullObject' }],
      },
      {
        name: 'each comparison with its operands swapped',
        code: dedent`
          declare const u: unknown;
          const ok = 'object' === typeof u && null !== u;
        `,
        output: dedent`
          import { isNonNullObject } from 'ts-data-forge';
          declare const u: unknown;
          const ok = isNonNullObject(u);
        `,
        errors: [{ messageId: 'useIsNonNullObject' }],
      },
      {
        name: '`!= null`, which typeof has already made the same check',
        code: dedent`
          declare const u: unknown;
          const ok = typeof u === 'object' && u != null;
        `,
        output: dedent`
          import { isNonNullObject } from 'ts-data-forge';
          declare const u: unknown;
          const ok = isNonNullObject(u);
        `,
        errors: [{ messageId: 'useIsNonNullObject' }],
      },
      {
        name: 'the pair at the start, the end and the middle of a longer chain',
        code: dedent`
          declare const u: unknown;
          declare const a: boolean;
          declare const b: boolean;
          const x = typeof u === 'object' && u !== null && 'k' in u;
          const y = a && typeof u === 'object' && u !== null;
          const z = a && u !== null && (typeof u === 'object') && b;
        `,
        output: [
          dedent`
            import { isNonNullObject } from 'ts-data-forge';
            declare const u: unknown;
            declare const a: boolean;
            declare const b: boolean;
            const x = isNonNullObject(u) && 'k' in u;
            const y = a && typeof u === 'object' && u !== null;
            const z = a && u !== null && (typeof u === 'object') && b;
          `,
          dedent`
            import { isNonNullObject } from 'ts-data-forge';
            declare const u: unknown;
            declare const a: boolean;
            declare const b: boolean;
            const x = isNonNullObject(u) && 'k' in u;
            const y = a && isNonNullObject(u);
            const z = a && isNonNullObject(u) && b;
          `,
        ],
        errors: [
          { messageId: 'useIsNonNullObject' },
          { messageId: 'useIsNonNullObject' },
          { messageId: 'useIsNonNullObject' },
        ],
      },
      {
        name: 'two pairs in one chain',
        code: dedent`
          declare const u: unknown;
          declare const v: unknown;
          const ok = typeof u === 'object' && u !== null && v !== null && typeof v === 'object';
        `,
        output: [
          dedent`
            import { isNonNullObject } from 'ts-data-forge';
            declare const u: unknown;
            declare const v: unknown;
            const ok = isNonNullObject(u) && v !== null && typeof v === 'object';
          `,
          dedent`
            import { isNonNullObject } from 'ts-data-forge';
            declare const u: unknown;
            declare const v: unknown;
            const ok = isNonNullObject(u) && isNonNullObject(v);
          `,
        ],
        errors: [
          { messageId: 'useIsNonNullObject' },
          { messageId: 'useIsNonNullObject' },
        ],
      },
    ],
  });
});
