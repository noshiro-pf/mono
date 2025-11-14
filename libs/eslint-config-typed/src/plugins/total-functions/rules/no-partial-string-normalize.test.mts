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
