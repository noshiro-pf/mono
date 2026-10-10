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
