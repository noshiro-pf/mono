import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferIsNonNullObject } from './prefer-is-non-null-object.mjs';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-non-null-object', preferIsNonNullObject, {
  valid: [
    {
      name: 'Already using isNonNullObject',
      code: dedent`
        import { isNonNullObject } from 'ts-std-forge';
        const ok = isNonNullObject(u);
      `,
    },
    {
      name: 'The two halves are about different identifiers',
      code: dedent`
        const ok = typeof u === 'object' && v !== null;
      `,
    },
    {
      name: 'Not an object check',
      code: dedent`
        const ok = typeof u === 'string' && u !== null;
      `,
    },
  ],
  invalid: [
    {
      name: 'Replace the object/null check',
      code: dedent`
        const ok = typeof u === 'object' && u !== null;
      `,
      output: dedent`
        import { isNonNullObject } from 'ts-std-forge';
        const ok = isNonNullObject(u);
      `,
      errors: [{ messageId: 'useIsNonNullObject' }],
    },
    {
      name: 'Reuses an existing import',
      code: dedent`
        import { isNonNullObject } from 'ts-std-forge';
        const ok = typeof u === 'object' && u !== null;
      `,
      output: dedent`
        import { isNonNullObject } from 'ts-std-forge';
        const ok = isNonNullObject(u);
      `,
      errors: [{ messageId: 'useIsNonNullObject' }],
    },
  ],
});

// The replacement names the bare identifier: that is the reference both
// halves narrow, and a wrapper around the argument would stop the guard from
// narrowing it.
describe('prefer-is-non-null-object through type wrappers', () => {
  ruleTester.run('prefer-is-non-null-object', preferIsNonNullObject, {
    valid: [
      {
        name: 'The two halves are about different identifiers behind wrappers',
        code: dedent`
          const ok = typeof (u satisfies unknown) === 'object' && v! !== null;
        `,
      },
    ],
    invalid: [
      {
        name: 'reads the typeof operand through `satisfies`',
        code: dedent`
          const ok = typeof (u satisfies unknown) === 'object' && u !== null;
        `,
        output: dedent`
          import { isNonNullObject } from 'ts-std-forge';
          const ok = isNonNullObject(u);
        `,
        errors: [{ messageId: 'useIsNonNullObject' }],
      },
      {
        name: 'reads the null check through `!` and `as`',
        code: dedent`
          const ok = typeof u === 'object' && u! !== (null as null);
        `,
        output: dedent`
          import { isNonNullObject } from 'ts-std-forge';
          const ok = isNonNullObject(u);
        `,
        errors: [{ messageId: 'useIsNonNullObject' }],
      },
      {
        name: 'reads the literal and both halves through wrappers',
        code: dedent`
          const ok =
            ((typeof (<unknown>u) === ('object' as const)) satisfies boolean) &&
            ((u !== null) as boolean);
        `,
        output: dedent`
          import { isNonNullObject } from 'ts-std-forge';
          const ok =
            isNonNullObject(u);
        `,
        errors: [{ messageId: 'useIsNonNullObject' }],
      },
    ],
  });
});

describe('prefer-is-non-null-object in other forms', () => {
  ruleTester.run('prefer-is-non-null-object', preferIsNonNullObject, {
    valid: [
      {
        name: 'the two halves joined by `||`',
        code: dedent`
          const ok = typeof u === 'object' || u !== null;
        `,
      },
      {
        name: 'the two halves not next to each other in the chain',
        code: dedent`
          declare const a: boolean;
          const ok = typeof u === 'object' && a && u !== null;
        `,
      },
      {
        name: 'an undefined check is not a null check',
        code: dedent`
          const ok = u !== undefined && typeof u === 'object';
        `,
      },
      {
        name: 'the halves split by parentheses',
        code: dedent`
          declare const b: boolean;
          const ok = typeof u === 'object' && (u !== null && b);
        `,
      },
    ],
    invalid: [
      {
        name: 'the halves in reverse order',
        code: dedent`
          const ok = u !== null && typeof u === 'object';
        `,
        output: dedent`
          import { isNonNullObject } from 'ts-std-forge';
          const ok = isNonNullObject(u);
        `,
        errors: [{ messageId: 'useIsNonNullObject' }],
      },
      {
        name: 'each comparison with its operands swapped',
        code: dedent`
          const ok = 'object' === typeof u && null !== u;
        `,
        output: dedent`
          import { isNonNullObject } from 'ts-std-forge';
          const ok = isNonNullObject(u);
        `,
        errors: [{ messageId: 'useIsNonNullObject' }],
      },
      {
        name: '`!= null`, which typeof has already made the same check',
        code: dedent`
          const ok = typeof u === 'object' && u != null;
        `,
        output: dedent`
          import { isNonNullObject } from 'ts-std-forge';
          const ok = isNonNullObject(u);
        `,
        errors: [{ messageId: 'useIsNonNullObject' }],
      },
      {
        name: 'the pair at the start, the end and the middle of a longer chain',
        code: dedent`
          declare const a: boolean;
          declare const b: boolean;
          const x = typeof u === 'object' && u !== null && 'k' in u;
          const y = a && typeof u === 'object' && u !== null;
          const z = a && u !== null && (typeof u === 'object') && b;
        `,
        output: [
          dedent`
            import { isNonNullObject } from 'ts-std-forge';
            declare const a: boolean;
            declare const b: boolean;
            const x = isNonNullObject(u) && 'k' in u;
            const y = a && typeof u === 'object' && u !== null;
            const z = a && u !== null && (typeof u === 'object') && b;
          `,
          dedent`
            import { isNonNullObject } from 'ts-std-forge';
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
          declare const v: unknown;
          const ok = typeof u === 'object' && u !== null && v !== null && typeof v === 'object';
        `,
        output: [
          dedent`
            import { isNonNullObject } from 'ts-std-forge';
            declare const v: unknown;
            const ok = isNonNullObject(u) && v !== null && typeof v === 'object';
          `,
          dedent`
            import { isNonNullObject } from 'ts-std-forge';
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
