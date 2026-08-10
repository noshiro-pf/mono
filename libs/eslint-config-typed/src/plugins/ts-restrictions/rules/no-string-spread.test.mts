import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noStringSpread } from './no-string-spread.mjs';

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

describe('no-string-spread', () => {
  tester.run('no-string-spread', noStringSpread, {
    valid: [
      {
        name: 'spreading an array into an array literal',
        code: dedent`
          declare const xs: readonly number[];
          const ys = [...xs];
        `,
      },
      {
        name: 'spreading a tuple into an array literal',
        code: dedent`
          declare const xs: readonly [number, string];
          const ys = [...xs];
        `,
      },
      {
        name: 'spreading an array into a function call',
        code: dedent`
          declare const xs: readonly number[];
          const m = Math.max(...xs);
        `,
      },
      {
        name: 'spreading an object into an object literal',
        code: dedent`
          declare const obj: { readonly a: number; readonly b: number };
          const clone = { ...obj };
        `,
      },
      {
        name: 'spreading a Set is a legitimate iterable spread',
        code: dedent`
          declare const s: ReadonlySet<number>;
          const ys = [...s];
        `,
      },
      {
        name: 'spreading a Map is a legitimate iterable spread',
        code: dedent`
          declare const m: ReadonlyMap<string, number>;
          const entries = [...m];
        `,
      },
      {
        name: 'spreading a generic iterable is not a string',
        code: dedent`
          declare const it: Iterable<number>;
          const ys = [...it];
        `,
      },
      {
        name: 'any is treated conservatively and not flagged',
        code: dedent`
          declare const x: any;
          const ys = [...x];
        `,
      },
      {
        name: 'array destructuring rest is not a value spread',
        code: dedent`
          declare const xs: readonly number[];
          const [first, ...rest] = xs;
        `,
      },
      {
        name: 'object destructuring rest is not a value spread',
        code: dedent`
          declare const obj: { readonly a: number; readonly b: number };
          const { a, ...others } = obj;
        `,
      },
      {
        name: 'spreading an array of strings is fine (not a string itself)',
        code: dedent`
          declare const xs: readonly string[];
          const ys = [...xs];
        `,
      },
      {
        name: 'unconstrained generic is left alone',
        code: dedent`
          const f = <T>(xs: readonly T[]): readonly T[] => [...xs];
        `,
      },
    ],
    invalid: [
      {
        name: 'spreading a string into an array literal',
        code: dedent`
          declare const s: string;
          const chars = [...s];
        `,
        errors: [{ messageId: 'noStringSpread' }],
      },
      {
        name: 'spreading a string into a function call',
        code: dedent`
          declare const s: string;
          declare function f(...args: readonly string[]): void;
          f(...s);
        `,
        errors: [{ messageId: 'noStringSpread' }],
      },
      {
        name: 'spreading a string into an object literal',
        code: dedent`
          declare const s: string;
          const o = { ...s };
        `,
        errors: [{ messageId: 'noStringSpread' }],
      },
      {
        name: 'spreading a string literal type',
        code: dedent`
          declare const s: 'abc';
          const chars = [...s];
        `,
        errors: [{ messageId: 'noStringSpread' }],
      },
      {
        name: 'spreading a template literal type',
        code: dedent`
          declare const s: \`id_\${string}\`;
          const chars = [...s];
        `,
        errors: [{ messageId: 'noStringSpread' }],
      },
      {
        name: 'spreading a union that includes string is still flagged',
        code: dedent`
          declare const s: string | readonly string[];
          const ys = [...s];
        `,
        errors: [{ messageId: 'noStringSpread' }],
      },
      {
        name: 'spreading a branded string (intersection) is flagged',
        code: dedent`
          type UserId = string & { readonly __brand: unique symbol };
          declare const s: UserId;
          const chars = [...s];
        `,
        errors: [{ messageId: 'noStringSpread' }],
      },
      {
        name: 'spreading a generic constrained to string is flagged',
        code: dedent`
          const f = <T extends string>(s: T): readonly string[] => [...s];
        `,
        errors: [{ messageId: 'noStringSpread' }],
      },
    ],
  });
});
