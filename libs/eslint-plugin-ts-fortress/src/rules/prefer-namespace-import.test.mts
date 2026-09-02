import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferNamespaceImport } from './prefer-namespace-import.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

describe('prefer-namespace-import', () => {
  tester.run('prefer-namespace-import', preferNamespaceImport, {
    valid: [
      {
        name: 'accepts a namespace import',
        code: dedent`
          import * as t from 'ts-fortress';

          const T = t.string();
        `,
      },
      {
        name: 'accepts a type-only namespace import',
        code: dedent`
          import type * as t from 'ts-fortress';

          export type S = t.TypeOf<t.Type<string>>;
        `,
      },
      {
        name: 'accepts any namespace name',
        code: dedent`
          import * as fortress from 'ts-fortress';

          const T = fortress.string();
        `,
      },
      {
        name: 'accepts a bare side-effect import',
        code: dedent`
          import 'ts-fortress';
        `,
      },
      {
        name: 'leaves named imports from other modules alone',
        code: dedent`
          import { string } from './my-schemas.mjs';

          const T = string();
        `,
      },
    ],
    invalid: [
      {
        name: 'rewrites a named import and its references',
        code: dedent`
          import { record, string } from 'ts-fortress';

          const User = record({ name: string() });
        `,
        output: dedent`
          import * as t from 'ts-fortress';

          const User = t.record({ name: t.string() });
        `,
        errors: [{ messageId: 'useNamespaceImport' }],
      },
      {
        name: 'rewrites an aliased named import to its canonical name',
        code: dedent`
          import { nonEmptyArray as nea, string } from 'ts-fortress';

          const Tags = nea(string());
        `,
        output: dedent`
          import * as t from 'ts-fortress';

          const Tags = t.nonEmptyArray(t.string());
        `,
        errors: [{ messageId: 'useNamespaceImport' }],
      },
      {
        name: 'rewrites a type-only import to a type-only namespace import',
        code: dedent`
          import type { Type, TypeOf } from 'ts-fortress';

          export type Of<T extends Type<unknown>> = TypeOf<T>;
        `,
        output: dedent`
          import type * as t from 'ts-fortress';

          export type Of<T extends t.Type<unknown>> = t.TypeOf<T>;
        `,
        errors: [{ messageId: 'useNamespaceImport' }],
      },
      {
        name: 'rewrites an inline type specifier',
        code: dedent`
          import { string, type Type } from 'ts-fortress';

          export const Name: Type<string> = string();
        `,
        output: dedent`
          import * as t from 'ts-fortress';

          export const Name: t.Type<string> = t.string();
        `,
        errors: [{ messageId: 'useNamespaceImport' }],
      },
      {
        name: 'merges into the namespace import the file already has',
        code: dedent`
          import * as t from 'ts-fortress';
          import { string } from 'ts-fortress';

          const T = t.record({ name: string() });
        `,
        output: dedent`
          import * as t from 'ts-fortress';

          const T = t.record({ name: t.string() });
        `,
        errors: [{ messageId: 'useNamespaceImport' }],
      },
      {
        name: 'reuses the local name of the existing namespace import',
        code: dedent`
          import * as fortress from 'ts-fortress';
          import { string } from 'ts-fortress';

          const T = fortress.record({ name: string() });
        `,
        output: dedent`
          import * as fortress from 'ts-fortress';

          const T = fortress.record({ name: fortress.string() });
        `,
        errors: [
          {
            messageId: 'useNamespaceImport',
            data: { namespaceName: 'fortress' },
          },
        ],
      },
      {
        name: 'folds two offending declarations into one namespace import',
        code: dedent`
          import type { Type } from 'ts-fortress';
          import { string } from 'ts-fortress';

          export const Name: Type<string> = string();
        `,
        output: dedent`
          import * as t from 'ts-fortress';

          export const Name: t.Type<string> = t.string();
        `,
        errors: [
          { messageId: 'useNamespaceImport' },
          { messageId: 'useNamespaceImport' },
        ],
      },
      {
        name: 'expands a shorthand property',
        code: dedent`
          import { string } from 'ts-fortress';

          const schemas = { string };
        `,
        output: dedent`
          import * as t from 'ts-fortress';

          const schemas = { string: t.string };
        `,
        errors: [{ messageId: 'useNamespaceImport' }],
      },
      {
        name: 'rewrites a default import to the namespace itself',
        code: dedent`
          import fortress from 'ts-fortress';

          const T = fortress.string();
        `,
        output: dedent`
          import * as t from 'ts-fortress';

          const T = t.string();
        `,
        errors: [{ messageId: 'useNamespaceImport' }],
      },
      {
        name: 'removes an unused named import',
        code: dedent`
          import * as t from 'ts-fortress';
          import { string } from 'ts-fortress';

          const T = t.number();
        `,
        output: dedent`
          import * as t from 'ts-fortress';

          const T = t.number();
        `,
        errors: [{ messageId: 'useNamespaceImport' }],
      },
      {
        name: 'honours the configured namespace name',
        code: dedent`
          import { string } from 'ts-fortress';

          const T = string();
        `,
        options: [{ namespaceName: 'tf' }],
        output: dedent`
          import * as tf from 'ts-fortress';

          const T = tf.string();
        `,
        errors: [
          { messageId: 'useNamespaceImport', data: { namespaceName: 'tf' } },
        ],
      },
      {
        name: 'reports without a fix when the namespace name is taken',
        code: dedent`
          import { string } from 'ts-fortress';

          const t = 1;
          const T = string();
        `,
        output: null,
        errors: [{ messageId: 'useNamespaceImport' }],
      },
      {
        name: 'reports without a fix when the namespace name is shadowed at a reference',
        code: dedent`
          import { string } from 'ts-fortress';

          const build = () => {
            const t = 1;
            return string();
          };
        `,
        output: null,
        errors: [{ messageId: 'useNamespaceImport' }],
      },
      {
        name: 'reports without a fix when a binding is re-exported by name',
        code: dedent`
          import { string } from 'ts-fortress';

          export { string };
        `,
        output: null,
        errors: [{ messageId: 'useNamespaceImport' }],
      },
      {
        name: 'reports without a fix when a value import would merge into a type-only namespace',
        code: dedent`
          import type * as t from 'ts-fortress';
          import { string } from 'ts-fortress';

          const T = string();
        `,
        output: null,
        errors: [{ messageId: 'useNamespaceImport' }],
      },
      {
        name: 'reports without a fix when a declaration mixes a default and a namespace import',
        code: dedent`
          import fortress, * as t from 'ts-fortress';

          const T = t.record({ name: fortress.string() });
        `,
        output: null,
        errors: [{ messageId: 'useNamespaceImport' }],
      },
    ],
  });
});
