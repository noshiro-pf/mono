import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferLogicalOverBooleanTernary } from './prefer-logical-over-boolean-ternary.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

describe('prefer-logical-over-boolean-ternary', () => {
  tester.run(
    'prefer-logical-over-boolean-ternary',
    preferLogicalOverBooleanTernary,
    {
      valid: [
        {
          name: 'both branches literal is no-unneeded-ternary’s',
          code: dedent`
            declare const a: boolean;
            const x = a ? true : false;
          `,
        },
        {
          name: 'no boolean literal branch',
          code: dedent`
            declare const a: boolean, b: string, c: string;
            const x = a ? b : c;
          `,
        },
        {
          name: '`a ? true : b` keeps `true` where `a || b` would give `a`',
          code: dedent`
            declare const a: number, b: boolean;
            const x = a ? true : b;
          `,
        },
        {
          name: '`a ? b : false` gives `false` where `a && b` would give `a`',
          code: dedent`
            declare const a: string, b: boolean;
            const x = a ? b : false;
          `,
        },
        {
          name: 'the negation of a non-boolean negation would be `!!a`',
          code: dedent`
            declare const a: number, b: boolean;
            const x = !a ? false : b;
          `,
        },
        {
          name: 'the negation of a comparison that may be NaN',
          code: dedent`
            declare const a: number, b: boolean;
            const x = a < 1 ? false : b;
          `,
        },
        {
          name: 'no `&&` in JSX, where react/jsx-no-leaked-render turns it back into a ternary with `null`',
          filename: 'file.tsx',
          code: dedent`
            declare const a: boolean, b: string;
            const e = <input value={a ? false : b} />;
            const f = <input value={a ? b : false} />;
          `,
        },
      ],
      invalid: [
        {
          name: 'a ? true : b',
          code: dedent`
            declare const a: boolean, b: string;
            const x = a ? true : b;
          `,
          output: dedent`
            declare const a: boolean, b: string;
            const x = a || b;
          `,
          errors: [{ messageId: 'preferLogical' }],
        },
        {
          name: 'a ? false : b, whatever a is',
          code: dedent`
            declare const a: number, b: string;
            const x = a ? false : b;
          `,
          output: dedent`
            declare const a: number, b: string;
            const x = !a && b;
          `,
          errors: [{ messageId: 'preferLogical' }],
        },
        {
          name: 'a ? b : false',
          code: dedent`
            declare const a: boolean, b: string;
            const x = a ? b : false;
          `,
          output: dedent`
            declare const a: boolean, b: string;
            const x = a && b;
          `,
          errors: [{ messageId: 'preferLogical' }],
        },
        {
          name: 'a ? b : true, whatever a is',
          code: dedent`
            declare const a: number, b: boolean;
            const x = a ? b : true;
          `,
          output: dedent`
            declare const a: number, b: boolean;
            const x = !a || b;
          `,
          errors: [{ messageId: 'preferLogical' }],
        },
        {
          name: '!a ? false : b',
          code: dedent`
            declare const a: boolean, b: string;
            const x = !a ? false : b;
          `,
          output: dedent`
            declare const a: boolean, b: string;
            const x = a && b;
          `,
          errors: [{ messageId: 'preferLogical' }],
        },
        {
          name: '!a ? true : b',
          code: dedent`
            declare const a: number, b: boolean;
            const x = !a ? true : b;
          `,
          output: dedent`
            declare const a: number, b: boolean;
            const x = !a || b;
          `,
          errors: [{ messageId: 'preferLogical' }],
        },
        {
          name: 'a comparison is negated by inverting it',
          code: dedent`
            declare const a: number, b: boolean;
            const x = a === 1 ? false : b;
          `,
          output: dedent`
            declare const a: number, b: boolean;
            const x = a !== 1 && b;
          `,
          errors: [{ messageId: 'preferLogical' }],
        },
        {
          name: 'a comparison that cannot be NaN is negated by inverting it',
          code: dedent`
            declare const a: string, b: boolean;
            const x = a < 'm' ? b : true;
          `,
          output: dedent`
            declare const a: string, b: boolean;
            const x = a >= 'm' || b;
          `,
          errors: [{ messageId: 'preferLogical' }],
        },
        {
          name: 'a call is negated with !',
          code: dedent`
            declare const f: () => number, b: boolean;
            const x = f() ? false : b;
          `,
          output: dedent`
            declare const f: () => number, b: boolean;
            const x = !f() && b;
          `,
          errors: [{ messageId: 'preferLogical' }],
        },
        {
          name: 'a logical test is negated in parentheses',
          code: dedent`
            declare const a: boolean, b: boolean, c: string;
            const x = a || b ? false : c;
          `,
          output: dedent`
            declare const a: boolean, b: boolean, c: string;
            const x = !(a || b) && c;
          `,
          errors: [{ messageId: 'preferLogical' }],
        },
        {
          name: 'operands of lower precedence are parenthesized',
          code: dedent`
            declare const a: boolean, b: boolean, c: boolean;
            declare const d: string | undefined;
            const x = a ? false : b || c;
            const y = a ? true : d ?? 'e';
          `,
          output: dedent`
            declare const a: boolean, b: boolean, c: boolean;
            declare const d: string | undefined;
            const x = !a && (b || c);
            const y = a || (d ?? 'e');
          `,
          errors: [
            { messageId: 'preferLogical' },
            { messageId: 'preferLogical' },
          ],
        },
        {
          name: '`||` in JSX is fine',
          filename: 'file.tsx',
          code: dedent`
            declare const a: boolean, b: string;
            const e = <input value={a ? true : b} />;
          `,
          output: dedent`
            declare const a: boolean, b: string;
            const e = <input value={a || b} />;
          `,
          errors: [{ messageId: 'preferLogical' }],
        },
        {
          name: 'the prefer-ternary shape `a ? true : b ? c : d`',
          code: dedent`
            declare const a: boolean, b: boolean, c: string, d: string;
            const x = a ? true : b ? c : d;
          `,
          output: dedent`
            declare const a: boolean, b: boolean, c: string, d: string;
            const x = a || (b ? c : d);
          `,
          errors: [{ messageId: 'preferLogical' }],
        },
      ],
    },
  );
});
