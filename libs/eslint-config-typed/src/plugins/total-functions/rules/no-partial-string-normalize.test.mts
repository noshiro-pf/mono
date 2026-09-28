import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import dedent from 'dedent';
import { noPartialStringNormalize } from './no-partial-string-normalize.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      project: './tsconfig.tests.json',
    },
    parser,
  },
});

ruleTester.run('no-partial-string-normalize', noPartialStringNormalize, {
  valid: [
    {
      filename: 'file.ts',
      code: dedent`
        "".normalize();
        "".normalize(undefined);
        "".normalize("NFC");
        "".normalize("NFD");
        "".normalize("NFKC");
        "".normalize("NFKD");
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        const normalize = (s: string): s => s;
        normalize("hello");
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        type Foo = {
          readonly normalize: (s: string) => string;
        };
      
        const foo: Foo = {
          normalize: (s) => s,
        } as const;
      
        const bar = foo.normalize("s");
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        "".toString();
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        "".normalize("NFKD", "whoops");
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        const nfkd = "NFKD";
        "".normalize(nfkd);
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        const arg = undefined;
        "".normalize(arg);
      `,
    },
  ],
  invalid: [
    {
      filename: 'file.ts',
      code: dedent`
        "".normalize("asdf");
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        ""["normalize"]("asdf");
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const arg: string = "NFC";
        "".normalize(arg);
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const n = "normalize" as const;
        const foo = ""[n]("");
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        let n: "normalize" | "includes" = "normalize";
        if (Date.now > 0) {
          n = "includes";
        }
      
        const foo = ""[n]("");
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
  ],
} as const);

describe('no-partial-string-normalize through type wrappers', () => {
  ruleTester.run('no-partial-string-normalize', noPartialStringNormalize, {
    valid: [
      {
        name: 'a wrapped safe literal',
        filename: 'file.ts',
        code: dedent`
          declare const s: string;
          s.normalize('NFC' satisfies string);
        `,
      },
      {
        name: 'a wrapped method that is not normalize',
        filename: 'file.ts',
        code: dedent`
          declare const s: string;
          declare const t: string;
          s.includes!(t);
          s['includes' satisfies string](t);
        `,
      },
    ],
    invalid: [
      {
        name: 'a wrapped callee',
        filename: 'file.ts',
        code: dedent`
          declare const s: string;
          declare const form: string;
          s.normalize!(form);
          (s.normalize satisfies unknown)(form);
        `,
        errors: [
          { messageId: 'errorStringGeneric' },
          { messageId: 'errorStringGeneric' },
        ],
      },
      {
        name: 'a wrapped computed key',
        filename: 'file.ts',
        code: dedent`
          declare const s: string;
          declare const form: string;
          declare const k: 'normalize' | undefined;
          s['normalize' satisfies string](form);
          s[k!](form);
        `,
        errors: [
          { messageId: 'errorStringGeneric' },
          { messageId: 'errorStringGeneric' },
        ],
      },
      {
        name: 'a receiver cast to a type that is not a string',
        filename: 'file.ts',
        code: dedent`
          declare const s: string;
          declare const form: string;
          (s as { normalize(f: string): string }).normalize(form);
        `,
        errors: [{ messageId: 'errorStringGeneric' }],
      },
      {
        name: 'a receiver asserted to be a string',
        filename: 'file.ts',
        code: dedent`
          declare const u: unknown;
          declare const form: string;
          (u as string).normalize(form);
        `,
        errors: [{ messageId: 'errorStringGeneric' }],
      },
      {
        name: 'an argument cast to a safe form is still an arbitrary string',
        filename: 'file.ts',
        code: dedent`
          declare const s: string;
          declare const form: string;
          s.normalize(form as 'NFC');
        `,
        errors: [{ messageId: 'errorStringGeneric' }],
      },
    ],
  });
});
