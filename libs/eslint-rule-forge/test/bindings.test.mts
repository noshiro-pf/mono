import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import dedent from 'dedent';
import {
  hasForeignBinding,
  isLocallyBound,
  isRuntimeBound,
} from '../src/index.mjs';
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

ruleTester.run(
  'isRuntimeBound',
  probeRule((context, argument) =>
    isRuntimeBound(
      context.sourceCode,
      argument,
      argument.type === AST_NODE_TYPES.Identifier ? argument.name : '',
    ).toString(),
  ),
  {
    valid: [],
    invalid: [
      {
        name: 'an unresolved name',
        code: 'probe(u);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a `const`',
        code: 'const u = {}; probe(u);',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a function',
        code: 'function u() {} probe(u);',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a class',
        code: 'class u {} probe(u);',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'an enum',
        code: 'enum u { A } probe(u);',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a parameter',
        code: 'const f = (u: unknown) => probe(u);',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'an import',
        code: dedent`
          import { u } from 'm';
          probe(u);
        `,
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a `declare const`',
        code: 'declare const u: unknown; probe(u);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a `declare let`',
        code: 'declare let u: unknown; probe(u);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a `declare function`',
        code: 'declare function u(): void; probe(u);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a `declare class`',
        code: 'declare class u {} probe(u);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a `declare enum`',
        code: 'declare enum u { A } probe(u);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a `const enum`, which compiles away',
        code: 'const enum u { A } probe(u);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a `declare namespace`',
        code: 'declare namespace u { const x: number; } probe(u);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a name in a `declare global` block, not visible outside it',
        code: dedent`
          declare global { const u: unknown; }
          probe(u);
          export {};
        `,
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a name in a `declare module` block, not visible outside it',
        code: dedent`
          declare module 'm' { const u: unknown; }
          probe(u);
        `,
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'an interface and a `declare const` of one name',
        code: 'interface u {} declare const u: unknown; probe(u);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'an interface and a `const` of one name',
        code: 'interface u {} const u = {}; probe(u);',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a type alias only',
        code: 'type u = number; probe(u);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a local type alias in front of a `const` outside',
        code: 'const u = {}; function f() { type u = string; probe(u); }',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a type parameter in front of a `declare const` outside',
        code: 'declare const u: unknown; function f<u>() { probe(u); }',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a parameter elsewhere',
        code: 'const f = (u: unknown) => u; probe(u);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a type-only import',
        code: dedent`
          import type { u } from 'm';
          probe(u);
        `,
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'an inline type-only import',
        code: dedent`
          import { type u } from 'm';
          probe(u);
        `,
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'a function’s `arguments`',
        code: 'function f() { probe(arguments); }',
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'an `import type … = require(…)`',
        code: "import type u = require('m'); probe(u);",
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
      {
        name: 'an `import … = require(…)`',
        code: "import u = require('m'); probe(u);",
        errors: [{ messageId: 'result', data: { result: 'true' } }],
      },
      {
        name: 'a global the scope manager knows of from `lib`',
        code: 'probe(Math);',
        errors: [{ messageId: 'result', data: { result: 'false' } }],
      },
    ],
  },
);
