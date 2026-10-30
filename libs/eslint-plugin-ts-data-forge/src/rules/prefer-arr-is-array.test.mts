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
      output: [
        dedent`
          import { Arr } from 'ts-data-forge';
          const result1 = Arr.isArray(value1);
          const result2 = Array.isArray(value2);
        `,
        dedent`
          import { Arr } from 'ts-data-forge';
          const result1 = Arr.isArray(value1);
          const result2 = Arr.isArray(value2);
        `,
      ],
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

describe('prefer-arr-is-array brings Arr into scope', () => {
  ruleTester.run('prefer-arr-is-array', preferArrIsArray, {
    valid: [],
    invalid: [
      {
        name: 'after a leading directive',
        code: dedent`
          'use client';
          const result = Array.isArray(value);
        `,
        output: dedent`
          'use client';
          import { Arr } from 'ts-data-forge';
          const result = Arr.isArray(value);
        `,
        errors: [{ messageId: 'useIsArray' }],
      },
      {
        name: 'in the existing named import',
        code: dedent`
          import { Num } from 'ts-data-forge';
          const result = Array.isArray(value);
        `,
        output: dedent`
          import { Num, Arr } from 'ts-data-forge';
          const result = Arr.isArray(value);
        `,
        errors: [{ messageId: 'useIsArray' }],
      },
      {
        name: 'an inline type import becomes a value import',
        code: dedent`
          import { type Arr } from 'ts-data-forge';
          const result = Array.isArray(value);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const result = Arr.isArray(value);
        `,
        errors: [{ messageId: 'useIsArray' }],
      },
      {
        name: 'no fix when a type-only declaration imports it',
        code: dedent`
          import type { Arr } from 'ts-data-forge';
          const result = Array.isArray(value);
        `,
        output: null,
        errors: [{ messageId: 'useIsArray' }],
      },
      {
        name: 'the local name of an aliased import',
        code: dedent`
          import { Arr as A } from 'ts-data-forge';
          const result = Array.isArray(value);
        `,
        output: dedent`
          import { Arr as A } from 'ts-data-forge';
          const result = A.isArray(value);
        `,
        errors: [{ messageId: 'useIsArray' }],
      },
      {
        name: 'no fix when something else is named Arr where the call is',
        code: dedent`
          const Arr = 1;
          const result = Array.isArray(value);
        `,
        output: null,
        errors: [{ messageId: 'useIsArray' }],
      },
    ],
  });
});
