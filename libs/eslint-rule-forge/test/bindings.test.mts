import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { hasForeignBinding, isLocallyBound } from '../src/index.mjs';
import { probeRule } from './probe-rule.mjs';

const ruleTester = new RuleTester();

ruleTester.run(
  'isLocallyBound',
  probeRule((context, argument) =>
    isLocallyBound(context.sourceCode, argument, 'Exclude').toString(),
  ),
  {
    valid: [],
    invalid: [
      {
        name: 'an unresolved name',
        code: 'probe(Exclude);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a standard-library type',
        code: 'type T = Exclude<1 | 2, 1>; probe(0);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a type alias in the file',
        code: 'type Exclude<A, B> = A; probe(0);',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'an import',
        code: dedent`
          import type { Exclude } from 'm';
          probe(0);
        `,
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a parameter around the node',
        code: 'const f = (Exclude: number) => probe(Exclude);',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a parameter elsewhere',
        code: 'const f = (Exclude: number) => Exclude; probe(0);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
    ],
  },
);

ruleTester.run(
  'hasForeignBinding',
  probeRule((context, argument) =>
    hasForeignBinding(context.sourceCode, argument, 'f', 'm').toString(),
  ),
  {
    valid: [],
    invalid: [
      {
        name: 'unbound',
        code: 'probe(0);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'the module’s own import',
        code: dedent`
          import { f } from 'm';
          probe(0);
        `,
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'the module’s namespace import under that name',
        code: dedent`
          import * as f from 'm';
          probe(0);
        `,
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'an import from another module',
        code: dedent`
          import { f } from 'other';
          probe(0);
        `,
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a declaration in the file',
        code: 'const f = 1; probe(0);',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a parameter shadowing the module’s import',
        code: dedent`
          import { f } from 'm';
          const g = (f: number) => probe(f);
        `,
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a type parameter around the node',
        code: 'function g<f>() { probe(0); }',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a local type alias around the node',
        code: 'function g() { type f = number; probe(0); }',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a local interface around the node',
        code: 'function g() { interface f {} probe(0); }',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a local class, which binds a value',
        code: 'function g() { class f {} probe(0); }',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a local enum, which binds a value',
        code: 'function g() { enum f { A } probe(0); }',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a local type alias in front of a parameter outside',
        code: 'function g(f: number) { { type f = number; probe(0); } }',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a type parameter in front of a foreign binding outside',
        code: dedent`
          import { f } from 'other';
          function g<f>() { probe(0); }
        `,
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a type parameter in front of a value binding outside',
        code: dedent`
          const f = 1;
          function g<f>() { probe(0); }
        `,
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a type parameter in front of the module’s import',
        code: dedent`
          import { f } from 'm';
          function g<f>() { probe(0); }
        `,
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a top-level type alias, which an added import would conflict with',
        code: 'type f = number; probe(0);',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a top-level type alias in a file with a global return',
        code: 'type f = number; probe(0);',
        languageOptions: {
          parserOptions: {
            sourceType: 'script',
            ecmaFeatures: { globalReturn: true },
          },
        },
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
    ],
  },
);
