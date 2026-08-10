import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noUnnecessaryCoalesceUndefined } from './no-unnecessary-coalesce-undefined.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

describe('no-unnecessary-coalesce-undefined', () => {
  tester.run(
    'no-unnecessary-coalesce-undefined',
    noUnnecessaryCoalesceUndefined,
    {
      valid: [
        {
          name: 'left-hand side includes null',
          code: dedent`
            declare const x: string | null;
            const y = x ?? undefined;
          `,
        },
        {
          name: 'left-hand side includes null and undefined',
          code: dedent`
            declare const x: string | null | undefined;
            const y = x ?? undefined;
          `,
        },
        {
          name: 'left-hand side is exactly null',
          code: dedent`
            declare const x: null;
            const y = x ?? undefined;
          `,
        },
        {
          name: 'any is treated as nullable (conservative)',
          code: dedent`
            declare const x: any;
            const y = x ?? undefined;
          `,
        },
        {
          name: 'unknown is treated as nullable (conservative)',
          code: dedent`
            declare const x: unknown;
            const y = x ?? undefined;
          `,
        },
        {
          name: 'right-hand side is not undefined',
          code: dedent`
            declare const x: string | undefined;
            const y = x ?? 0;
          `,
        },
        {
          name: 'operator is not ??',
          code: dedent`
            declare const x: string | undefined;
            const y = x || undefined;
          `,
        },
        {
          name: 'unconstrained type parameter could be instantiated with null',
          code: dedent`
            const f = <T>(x: T) => x ?? undefined;
          `,
        },
        {
          name: 'type parameter whose constraint includes null',
          code: dedent`
            const f = <T extends string | null>(x: T) => x ?? undefined;
          `,
        },
        {
          name: 'indexed access type could be instantiated with null',
          code: dedent`
            const f = <T, K extends keyof T>(o: T, k: K) => o[k] ?? undefined;
          `,
        },
        {
          name: 'shadowed undefined is not the undefined value',
          code: dedent`
            const undefined = 123;
            declare const x: number;
            const y = x ?? undefined;
          `,
        },
      ],
      invalid: [
        {
          name: 'left-hand side is T | undefined (no null)',
          code: dedent`
            declare const x: string | undefined;
            const y = x ?? undefined;
          `,
          output: dedent`
            declare const x: string | undefined;
            const y = x;
          `,
          errors: [{ messageId: 'unnecessaryCoalesceUndefined' }],
        },
        {
          name: 'left-hand side is a non-nullable primitive',
          code: dedent`
            declare const x: number;
            const y = x ?? undefined;
          `,
          output: dedent`
            declare const x: number;
            const y = x;
          `,
          errors: [{ messageId: 'unnecessaryCoalesceUndefined' }],
        },
        {
          name: 'left-hand side is a call expression returning T | undefined',
          code: dedent`
            declare const f: () => string | undefined;
            const y = f() ?? undefined;
          `,
          output: dedent`
            declare const f: () => string | undefined;
            const y = f();
          `,
          errors: [{ messageId: 'unnecessaryCoalesceUndefined' }],
        },
        {
          name: 'left-hand side is a member expression',
          code: dedent`
            declare const obj: { value?: number };
            const y = obj.value ?? undefined;
          `,
          output: dedent`
            declare const obj: { value?: number };
            const y = obj.value;
          `,
          errors: [{ messageId: 'unnecessaryCoalesceUndefined' }],
        },
        {
          name: 'type parameter constrained to a non-nullable type',
          code: dedent`
            const f = <T extends string>(x: T) => x ?? undefined;
          `,
          output: dedent`
            const f = <T extends string>(x: T) => x;
          `,
          errors: [{ messageId: 'unnecessaryCoalesceUndefined' }],
        },
      ],
    },
  );
});
