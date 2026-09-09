import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferSafeArrayIsArray } from './prefer-safe-array-is-array.mjs';

const ruleTester = new RuleTester();

ruleTester.run('prefer-safe-array-is-array', preferSafeArrayIsArray, {
  valid: [
    {
      name: 'Already using SafeArray.isArray',
      code: dedent`
        import { SafeArray } from 'ts-std-forge';
        const result = SafeArray.isArray(value);
      `,
    },
    {
      name: 'Not Array.isArray call',
      code: dedent`
        const obj = { isArray: () => true };
        const result = obj.isArray(value);
      `,
    },
  ],
  invalid: [
    {
      name: 'Replace Array.isArray with SafeArray.isArray',
      code: dedent`
        const result = Array.isArray(value);
      `,
      output: dedent`
        import { SafeArray } from 'ts-std-forge';
        const result = SafeArray.isArray(value);
      `,
      errors: [{ messageId: 'useSafeArrayIsArray' }],
    },
    {
      name: 'Replace Array.isArray when SafeArray is already imported',
      code: dedent`
        import { SafeArray } from 'ts-std-forge';
        const result = Array.isArray(value);
      `,
      output: dedent`
        import { SafeArray } from 'ts-std-forge';
        const result = SafeArray.isArray(value);
      `,
      errors: [{ messageId: 'useSafeArrayIsArray' }],
    },
    {
      name: 'Replace multiple Array.isArray calls, importing once',
      code: dedent`
        const result1 = Array.isArray(value1);
        const result2 = Array.isArray(value2);
      `,
      output: dedent`
        import { SafeArray } from 'ts-std-forge';
        const result1 = SafeArray.isArray(value1);
        const result2 = SafeArray.isArray(value2);
      `,
      errors: [
        { messageId: 'useSafeArrayIsArray' },
        { messageId: 'useSafeArrayIsArray' },
      ],
    },
  ],
});
