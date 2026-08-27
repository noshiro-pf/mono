import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferNullishCoalescingWhenSafe } from './prefer-nullish-coalescing-when-safe.mjs';

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

describe('prefer-nullish-coalescing-when-safe', () => {
  tester.run(
    'prefer-nullish-coalescing-when-safe',
    preferNullishCoalescingWhenSafe,
    {
      valid: [
        {
          name: 'non-nullable left-hand side with a non-matching default',
          code: dedent`
            declare const x: string;
            const y = x || 'a';
          `,
        },
        {
          name: 'non-nullable number (may hold NaN or -0)',
          code: dedent`
            declare const x: number;
            const y = x || 0;
          `,
        },
        {
          name: 'ordinary boolean logic is not a removable default',
          code: dedent`
            declare const a: boolean;
            declare const b: boolean;
            const y = a || b;
          `,
        },
        {
          name: 'non-nullable string whose falsy case would run an effectful right-hand side',
          code: dedent`
            declare const x: string;
            declare const f: () => '';
            const y = x || f();
          `,
        },
        {
          name: 'operator is already ??',
          code: dedent`
            declare const x: string | undefined;
            const y = x ?? '';
          `,
        },
        {
          name: 'nullable string with a non-empty default',
          code: dedent`
            declare const x: string | undefined;
            const y = x || 'default';
          `,
        },
        {
          name: 'nullable number (may hold NaN or -0)',
          code: dedent`
            declare const x: number | undefined;
            const y = x || 0;
          `,
        },
        {
          name: 'nullable boolean with true as default',
          code: dedent`
            declare const x: boolean | undefined;
            const y = x || true;
          `,
        },
        {
          name: 'two possible falsy values cannot both match the right-hand side',
          code: dedent`
            declare const x: string | boolean | undefined;
            const y = x || '';
          `,
        },
        {
          name: 'any is unsafe',
          code: dedent`
            declare const x: any;
            const y = x || '';
          `,
        },
        {
          name: 'unknown is unsafe',
          code: dedent`
            declare const x: unknown;
            const y = x || '';
          `,
        },
        {
          name: 'member-less {} accepts falsy primitives',
          code: dedent`
            declare const x: {} | undefined;
            const y = x || 'a';
          `,
        },
        {
          name: 'branded number may hold NaN at runtime',
          code: dedent`
            declare const x: (number & { readonly brand: 'Int' }) | undefined;
            const y = x || 0;
          `,
        },
        {
          name: 'unconstrained type parameter is unsafe',
          code: dedent`
            const f = <T>(x: T | undefined) => x || 'a';
          `,
        },
        {
          name: 'right-hand side with a potential side effect is not skippable',
          code: dedent`
            declare const x: string | undefined;
            declare const f: () => '';
            const y = x || f();
          `,
        },
        {
          name: 'member access on the right-hand side could invoke a getter',
          code: dedent`
            declare const x: string | undefined;
            declare const obj: { empty: '' };
            const y = x || obj.empty;
          `,
        },
        {
          name: 'inner || of a chain is skipped, and the outer one does not match',
          code: dedent`
            declare const a: string | undefined;
            declare const b: string | undefined;
            const y = a || b || 'x';
          `,
        },
        {
          name: '||= on a property whose falsy case is reachable (setter could observe the assignment)',
          code: dedent`
            declare const obj: { s: string | undefined };
            obj.s ||= '';
          `,
        },
        {
          name: '||= on a non-nullable target',
          code: dedent`
            let mut_x = 'a';
            mut_x ||= 'b';
          `,
        },
      ],
      invalid: [
        {
          name: 'nullable string defaulted with the empty string',
          code: dedent`
            declare const x: string | undefined;
            const y = x || '';
          `,
          output: dedent`
            declare const x: string | undefined;
            const y = x ?? '';
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'null on the left-hand side counts as nullish',
          code: dedent`
            declare const x: string | null;
            const y = x || '';
          `,
          output: dedent`
            declare const x: string | null;
            const y = x ?? '';
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'empty template literal as the default',
          code: dedent`
            declare const x: string | undefined;
            const y = x || \`\`;
          `,
          output: dedent`
            declare const x: string | undefined;
            const y = x ?? \`\`;
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'identifier with the literal type of the empty string',
          code: dedent`
            declare const x: string | undefined;
            const EMPTY = '';
            const y = x || EMPTY;
          `,
          output: dedent`
            declare const x: string | undefined;
            const EMPTY = '';
            const y = x ?? EMPTY;
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'nullable boolean defaulted with false',
          code: dedent`
            declare const x: boolean | undefined;
            const y = x || false;
          `,
          output: dedent`
            declare const x: boolean | undefined;
            const y = x ?? false;
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'nullable bigint defaulted with 0n',
          code: dedent`
            declare const x: bigint | undefined;
            const y = x || 0n;
          `,
          output: dedent`
            declare const x: bigint | undefined;
            const y = x ?? 0n;
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'literal union whose only falsy value matches the default',
          code: dedent`
            declare const x: 0 | 1 | undefined;
            const y = x || 0;
          `,
          output: dedent`
            declare const x: 0 | 1 | undefined;
            const y = x ?? 0;
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'left-hand side with no falsy value allows any default',
          code: dedent`
            declare const x: 1 | 2 | undefined;
            const y = x || 3;
          `,
          output: dedent`
            declare const x: 1 | 2 | undefined;
            const y = x ?? 3;
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'nullable object type allows any default',
          code: dedent`
            declare const x: { readonly a: number } | undefined;
            declare const d: { readonly a: number };
            const y = x || d;
          `,
          output: dedent`
            declare const x: { readonly a: number } | undefined;
            declare const d: { readonly a: number };
            const y = x ?? d;
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'nullable array with an arbitrary default expression',
          code: dedent`
            declare const x: readonly number[] | undefined;
            const y = x || [];
          `,
          output: dedent`
            declare const x: readonly number[] | undefined;
            const y = x ?? [];
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'branded string still has only the empty string as its falsy value',
          code: dedent`
            declare const x: (string & { readonly brand: 'S' }) | undefined;
            const y = x || '';
          `,
          output: dedent`
            declare const x: (string & { readonly brand: 'S' }) | undefined;
            const y = x ?? '';
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'type parameter constrained to string',
          code: dedent`
            const f = <T extends string>(x: T | undefined) => x || '';
          `,
          output: dedent`
            const f = <T extends string>(x: T | undefined) => x ?? '';
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'left operand that is a && expression gets parenthesized',
          code: dedent`
            declare const a: string | undefined;
            declare const b: string | undefined;
            const y = a && b || '';
          `,
          output: dedent`
            declare const a: string | undefined;
            declare const b: string | undefined;
            const y = (a && b) ?? '';
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'outer || of a chain gets its left operand parenthesized',
          code: dedent`
            declare const a: string | undefined;
            declare const b: string | undefined;
            const y = a || b || '';
          `,
          output: dedent`
            declare const a: string | undefined;
            declare const b: string | undefined;
            const y = (a || b) ?? '';
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'right operand that is a && expression gets parenthesized',
          code: dedent`
            declare const x: { readonly a: 0 } | undefined;
            declare const b: boolean;
            declare const c: { readonly a: 0 };
            const y = x || b && c;
          `,
          output: dedent`
            declare const x: { readonly a: 0 } | undefined;
            declare const b: boolean;
            declare const c: { readonly a: 0 };
            const y = x ?? (b && c);
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'parenthesized || nested inside ??',
          code: dedent`
            declare const b: string | null;
            const y = (b || '') ?? 'x';
          `,
          output: dedent`
            declare const b: string | null;
            const y = (b ?? '') ?? 'x';
          `,
          errors: [{ messageId: 'preferNullishCoalescing' }],
        },
        {
          name: 'non-nullable string defaulted with the empty string is just the string',
          code: dedent`
            declare const x: string;
            const y = x || '';
          `,
          output: dedent`
            declare const x: string;
            const y = x;
          `,
          errors: [{ messageId: 'removeUnnecessaryLogicalOr' }],
        },
        {
          name: 'non-nullable boolean defaulted with false is just the boolean',
          code: dedent`
            declare const x: boolean;
            const y = x || false;
          `,
          output: dedent`
            declare const x: boolean;
            const y = x;
          `,
          errors: [{ messageId: 'removeUnnecessaryLogicalOr' }],
        },
        {
          name: 'non-nullable bigint defaulted with 0n is just the bigint',
          code: dedent`
            declare const x: bigint;
            const y = x || 0n;
          `,
          output: dedent`
            declare const x: bigint;
            const y = x;
          `,
          errors: [{ messageId: 'removeUnnecessaryLogicalOr' }],
        },
        {
          name: 'never-falsy non-nullable left-hand side makes any default dead code',
          code: dedent`
            declare const x: 1 | 2;
            const y = x || 3;
          `,
          output: dedent`
            declare const x: 1 | 2;
            const y = x;
          `,
          errors: [{ messageId: 'removeUnnecessaryLogicalOr' }],
        },
        {
          name: 'never-falsy left-hand side allows dropping even an effectful default (it was never evaluated)',
          code: dedent`
            declare const x: { readonly a: number };
            declare const f: () => '';
            const y = x || f();
          `,
          output: dedent`
            declare const x: { readonly a: number };
            declare const f: () => '';
            const y = x;
          `,
          errors: [{ messageId: 'removeUnnecessaryLogicalOr' }],
        },
        {
          name: 'removal applies to the outer || of a non-nullable chain',
          code: dedent`
            declare const a: string;
            declare const b: string;
            const y = a || b || '';
          `,
          output: dedent`
            declare const a: string;
            declare const b: string;
            const y = a || b;
          `,
          errors: [{ messageId: 'removeUnnecessaryLogicalOr' }],
        },
        {
          name: 'removal keeps the parentheses around a parenthesized left operand',
          code: dedent`
            declare const a: string;
            declare const b: string;
            const y = (a && b) || '';
          `,
          output: dedent`
            declare const a: string;
            declare const b: string;
            const y = (a && b);
          `,
          errors: [{ messageId: 'removeUnnecessaryLogicalOr' }],
        },
        {
          name: '||= on an identifier whose only falsy value matches the default',
          code: dedent`
            let mut_x: string | undefined;
            mut_x ||= '';
          `,
          output: dedent`
            let mut_x: string | undefined;
            mut_x ??= '';
          `,
          errors: [{ messageId: 'preferNullishCoalescingAssignment' }],
        },
        {
          name: '||= on a property whose type has no falsy value',
          code: dedent`
            declare const obj: { p: readonly number[] | undefined };
            obj.p ||= [];
          `,
          output: dedent`
            declare const obj: { p: readonly number[] | undefined };
            obj.p ??= [];
          `,
          errors: [{ messageId: 'preferNullishCoalescingAssignment' }],
        },
      ],
    },
  );
});
