import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrIsArray } from './prefer-arr-is-array.mjs';

const ruleTester = new RuleTester();

ruleTester.run('prefer-arr-is-array', preferArrIsArray, {
  valid: [
    {
      name: 'Already using Arr.isArray',
      code: dedent`
        import { Arr } from 'ts-data-forge';
        const result = Arr.isArray(value);
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
      name: 'Replace Array.isArray with Arr.isArray',
      code: dedent`
        const result = Array.isArray(value);
      `,
      output: dedent`
        import { Arr } from 'ts-data-forge';
        const result = Arr.isArray(value);
      `,
      errors: [{ messageId: 'useArrIsArray' }],
    },
    {
      name: 'Replace Array.isArray with Arr.isArray when Arr is already imported',
      code: dedent`
        import { Arr } from 'ts-data-forge';
        const result = Array.isArray(value);
      `,
      output: dedent`
        import { Arr } from 'ts-data-forge';
        const result = Arr.isArray(value);
      `,
      errors: [{ messageId: 'useArrIsArray' }],
    },
    {
      name: 'Replace multiple Array.isArray calls',
      code: dedent`
        const result1 = Array.isArray(value1);
        const result2 = Array.isArray(value2);
      `,
      output: dedent`
        import { Arr } from 'ts-data-forge';
        const result1 = Arr.isArray(value1);
        const result2 = Arr.isArray(value2);
      `,
      errors: [{ messageId: 'useArrIsArray' }, { messageId: 'useArrIsArray' }],
    },
  ],
});
