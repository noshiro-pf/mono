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
    {
      name: 'A computed member named by a variable is not `isArray`',
      code: dedent`
        declare const isArray: 'from';
        const result = Array[isArray](value);
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
      errors: [{ messageId: 'useIsArray' }],
    },
    {
      name: 'Arr imported by a second ts-data-forge declaration is not imported again',
      code: dedent`
        import type { Optional } from 'ts-data-forge';
        import { Arr } from 'ts-data-forge';
        const result = Array.isArray(value);
      `,
      output: dedent`
        import type { Optional } from 'ts-data-forge';
        import { Arr } from 'ts-data-forge';
        const result = Arr.isArray(value);
      `,
      errors: [{ messageId: 'useIsArray' }],
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
      errors: [{ messageId: 'useIsArray' }],
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
      errors: [{ messageId: 'useIsArray' }, { messageId: 'useIsArray' }],
    },
  ],
});

describe('prefer-arr-is-array through type wrappers', () => {
  ruleTester.run('prefer-arr-is-array', preferArrIsArray, {
    valid: [],
    invalid: [
      {
        name: 'Array reached through `as`',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          const result = (Array as ArrayConstructor).isArray(value);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const result = Arr.isArray(value);
        `,
        errors: [{ messageId: 'useIsArray' }],
      },
      {
        name: 'Array reached through `!`',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          const result = Array!.isArray(value);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const result = Arr.isArray(value);
        `,
        errors: [{ messageId: 'useIsArray' }],
      },
      {
        name: 'the callee reached through `satisfies`',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          const result = (Array.isArray satisfies unknown)(value);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const result = Arr.isArray(value);
        `,
        errors: [{ messageId: 'useIsArray' }],
      },
    ],
  });
});

describe('prefer-arr-is-array with parenthesized operands', () => {
  ruleTester.run('prefer-arr-is-array', preferArrIsArray, {
    valid: [],
    invalid: [
      {
        name: 'a parenthesized callee',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          const result = (Array.isArray)(value);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const result = Arr.isArray(value);
        `,
        errors: [{ messageId: 'useIsArray' }],
      },
      {
        name: 'a doubly parenthesized callee of an optional call',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          const result = ((Array.isArray))?.(value);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const result = Arr.isArray?.(value);
        `,
        errors: [{ messageId: 'useIsArray' }],
      },
    ],
  });
});
