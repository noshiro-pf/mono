import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { jsxBooleanLogicalOperands } from './jsx-boolean-logical-operands.mjs';

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

describe('jsx-boolean-logical-operands', () => {
  tester.run('jsx-boolean-logical-operands', jsxBooleanLogicalOperands, {
    valid: [
      {
        name: 'booleans on both sides, as a child and as an attribute',
        filename: 'file.tsx',
        code: dedent`
          declare const a: boolean, b: boolean, n: number;
          const e = <div>{a && b}</div>;
          const f = <input disabled={a || b} />;
          const g = <input disabled={a || n === 0} />;
        `,
      },
      {
        name: 'the ternary this rule asks for',
        filename: 'file.tsx',
        code: dedent`
          declare const a: boolean;
          const e = <div>{a ? <span /> : undefined}</div>;
        `,
      },
      {
        name: '`??` is not a boolean operator',
        filename: 'file.tsx',
        code: dedent`
          declare const s: string | undefined;
          const e = <div>{s ?? 'none'}</div>;
        `,
      },
      {
        name: 'outside JSX, or where the value does not come out of the braces',
        filename: 'file.tsx',
        code: dedent`
          declare const a: boolean, n: number;
          declare const f: (x: unknown) => string;
          const e = a && <span />;
          const g = <div>{f(n && 'x')}</div>;
          const h = <div>{n && a ? <span /> : undefined}</div>;
        `,
      },
    ],
    invalid: [
      {
        name: '`a && <X />` as a child becomes a ternary with `undefined`',
        filename: 'file.tsx',
        code: dedent`
          declare const a: boolean;
          const e = <div>{a && <span />}</div>;
        `,
        output: dedent`
          declare const a: boolean;
          const e = <div>{a ? <span /> : undefined}</div>;
        `,
        errors: [
          {
            messageId: 'booleanOperands',
            data: { operator: '&&', replacement: 'a ? <span /> : undefined' },
          },
        ],
      },
      {
        name: '`a || <X />` as a child: `true` renders nothing, as `undefined` does',
        filename: 'file.tsx',
        code: dedent`
          declare const a: boolean;
          const e = <div>{a || <span />}</div>;
        `,
        output: dedent`
          declare const a: boolean;
          const e = <div>{a ? undefined : <span />}</div>;
        `,
        errors: [{ messageId: 'booleanOperands' }],
      },
      {
        name: 'as an attribute the value is kept exactly: `false` and `true` stay',
        filename: 'file.tsx',
        code: dedent`
          declare const a: boolean, s: string;
          declare const Foo: (props: Readonly<{ v: string | boolean }>) => null;
          const e = <Foo v={!a && s} />;
          const f = <Foo v={a || s} />;
        `,
        output: dedent`
          declare const a: boolean, s: string;
          declare const Foo: (props: Readonly<{ v: string | boolean }>) => null;
          const e = <Foo v={!a ? s : false} />;
          const f = <Foo v={a ? true : s} />;
        `,
        errors: [
          { messageId: 'booleanOperands' },
          { messageId: 'booleanOperands' },
        ],
      },
      {
        name: 'a branch of a ternary, and an operand of a longer chain, are in JSX too',
        filename: 'file.tsx',
        code: dedent`
          declare const a: boolean, b: boolean, c: boolean;
          const e = <div>{c ? a && <span /> : null}</div>;
          const f = <div>{(a || b) && <span />}</div>;
        `,
        output: dedent`
          declare const a: boolean, b: boolean, c: boolean;
          const e = <div>{c ? a ? <span /> : undefined : null}</div>;
          const f = <div>{a || b ? <span /> : undefined}</div>;
        `,
        errors: [
          { messageId: 'booleanOperands' },
          { messageId: 'booleanOperands' },
        ],
      },
      {
        name: 'a non-boolean left side is only reported: the comparison is the author’s to write',
        filename: 'file.tsx',
        code: dedent`
          declare const n: number, s: string;
          const e = <div>{n && <span />}</div>;
          const f = <div>{s || 'none'}</div>;
        `,
        output: null,
        errors: [
          { messageId: 'nonBooleanLeft', data: { operator: '&&' } },
          { messageId: 'nonBooleanLeft', data: { operator: '||' } },
        ],
      },
      {
        name: 'a boolean left side with a non-boolean right side that is a boolean-ish union',
        filename: 'file.tsx',
        code: dedent`
          declare const a: boolean, b: boolean | undefined;
          const e = <input disabled={a && b} />;
        `,
        output: dedent`
          declare const a: boolean, b: boolean | undefined;
          const e = <input disabled={a ? b : false} />;
        `,
        errors: [{ messageId: 'booleanOperands' }],
      },
    ],
  });
});

describe('jsx-boolean-logical-operands through type wrappers', () => {
  tester.run('jsx-boolean-logical-operands', jsxBooleanLogicalOperands, {
    valid: [
      {
        name: '`satisfies` on a boolean operand changes nothing',
        filename: 'file.tsx',
        code: dedent`
          declare const a: boolean, b: boolean;
          const e = <input disabled={(a satisfies boolean) || b} />;
        `,
      },
    ],
    invalid: [
      {
        name: 'the logical expression wrapped in `satisfies` is still in JSX',
        filename: 'file.tsx',
        code: dedent`
          declare const a: boolean;
          const e = <div>{(a && <span />) satisfies unknown}</div>;
        `,
        output: dedent`
          declare const a: boolean;
          const e = <div>{(a ? <span /> : undefined) satisfies unknown}</div>;
        `,
        errors: [{ messageId: 'booleanOperands' }],
      },
      {
        name: 'a wrapped operand keeps its parentheses in the ternary',
        filename: 'file.tsx',
        code: dedent`
          declare const a: boolean;
          const e = <div>{(a satisfies boolean) && (<span /> satisfies unknown)}</div>;
        `,
        output: dedent`
          declare const a: boolean;
          const e = <div>{(a satisfies boolean) ? (<span /> satisfies unknown) : undefined}</div>;
        `,
        errors: [{ messageId: 'booleanOperands' }],
      },
      {
        name: 'a cast to `boolean` does not make an operand one',
        filename: 'file.tsx',
        code: dedent`
          declare const a: boolean, n: number;
          const e = <div>{(n as unknown as boolean) && <span />}</div>;
          const f = <input disabled={a && (n as unknown as boolean)} />;
          const g = <input disabled={a && (n as never)} />;
        `,
        output: dedent`
          declare const a: boolean, n: number;
          const e = <div>{(n as unknown as boolean) && <span />}</div>;
          const f = <input disabled={a ? (n as unknown as boolean) : false} />;
          const g = <input disabled={a ? (n as never) : false} />;
        `,
        errors: [
          { messageId: 'nonBooleanLeft' },
          { messageId: 'booleanOperands' },
          { messageId: 'booleanOperands' },
        ],
      },
      {
        name: 'nor does a non-null assertion',
        filename: 'file.tsx',
        code: dedent`
          declare const b: boolean | undefined;
          const e = <div>{b! && <span />}</div>;
        `,
        output: null,
        errors: [{ messageId: 'nonBooleanLeft' }],
      },
    ],
  });
});
