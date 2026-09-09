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
