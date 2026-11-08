import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noOptionalPhantomProperty } from './no-optional-phantom-property.mjs';

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

describe('no-optional-phantom-property', () => {
  tester.run('no-optional-phantom-property', noOptionalPhantomProperty, {
    valid: [
      {
        name: 'a required property keyed by a type-only symbol',
        code: dedent`
          declare const initializedTag: unique symbol;
          export type Initialized = Readonly<{ [initializedTag]: true }>;
        `,
      },
      {
        name: 'an optional property keyed by a symbol that exists at run time',
        code: dedent`
          const brand: unique symbol = Symbol('brand');
          export type Branded = Readonly<{ [brand]?: true }>;
        `,
      },
      {
        name: 'an optional property keyed by a well-known symbol from a declaration file',
        code: dedent`
          export type MaybeIterable = Readonly<{
            [Symbol.iterator]?: () => Iterator<number>;
          }>;
        `,
      },
      {
        name: 'an optional property keyed by a symbol from a declaration file',
        code: dedent`
          import { declaredSymbol } from './test/declared-symbol.mjs';

          export type Declared = Readonly<{ [declaredSymbol]?: unknown }>;
        `,
      },
      {
        name: 'an optional key typed never, which says the marker must be absent',
        code: dedent`
          declare const validated: unique symbol;
          export type NotValidated = Readonly<{ [validated]?: never }>;
        `,
      },
      {
        name: 'a symbol in declare module, which may exist at run time',
        code: dedent`
          import { libraryTag } from 'dedent';

          declare module 'dedent' {
            const libraryTag: unique symbol;
          }

          export type Tagged = Readonly<{ [libraryTag]?: true }>;
        `,
      },
      {
        name: 'an optional key typed void',
        code: dedent`
          declare const validated: unique symbol;
          export type NotValidated = Readonly<{ [validated]?: void }>;
        `,
      },
      {
        name: 'an optional key typed a union of absent types',
        code: dedent`
          declare const validated: unique symbol;
          export type NotValidated = Readonly<{ [validated]?: undefined | void }>;
        `,
      },
      {
        name: 'an optional key typed undefined',
        code: dedent`
          declare const validated: unique symbol;
          export interface NotValidated {
            readonly [validated]?: undefined;
          }
        `,
      },
      {
        name: 'an optional property with a plain name',
        code: dedent`
          export type Options = Readonly<{ kind?: 'keep' }>;
        `,
      },
      {
        name: 'an optional property keyed by a string literal',
        code: dedent`
          export type Options = Readonly<{ ['kind']?: 'keep' }>;
        `,
      },
      {
        name: 'an optional property keyed by a declared string, which names a real property',
        code: dedent`
          declare const key: 'kind';
          export type Options = Readonly<{ [key]?: 'keep' }>;
        `,
      },
      {
        name: 'a symbol in declare global, which may exist at run time',
        code: dedent`
          declare global {
            const polyfillTag: unique symbol;
          }
          export type Tagged = Readonly<{ [polyfillTag]?: true }>;
        `,
      },
      {
        name: 'a symbol in a declared namespace, which may be merged with a run-time value',
        code: dedent`
          export function Tags(): void {}
          export declare namespace Tags {
            const kind: unique symbol;
          }
          export type Tagged = Readonly<{ [Tags.kind]?: 'keep' }>;
        `,
      },
      {
        name: 'a declare static member, which a static block may supply',
        code: dedent`
          export class Tags {
            declare static readonly kind: unique symbol;
          }
          export type Tagged = Readonly<{ [Tags.kind]?: 'keep' }>;
        `,
      },
      {
        name: 'a required class property keyed by a type-only symbol',
        code: dedent`
          declare const tag: unique symbol;
          export class Tagged {
            declare readonly [tag]: true;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'an optional property in a type literal',
        code: dedent`
          declare const initKindTag: unique symbol;
          export type Operator<K> = ((x: number) => number) &
            Readonly<{ [initKindTag]?: K }>;
        `,
        errors: [{ messageId: 'optionalPhantom' }],
      },
      {
        name: 'an optional property in an interface',
        code: dedent`
          declare const tag: unique symbol;
          export interface Tagged {
            readonly [tag]?: true;
          }
        `,
        errors: [{ messageId: 'optionalPhantom' }],
      },
      {
        name: 'an optional method signature',
        code: dedent`
          declare const tag: unique symbol;
          export interface Tagged {
            [tag]?(): void;
          }
        `,
        errors: [{ messageId: 'optionalPhantom' }],
      },
      {
        name: 'an exported type-only symbol',
        code: dedent`
          export declare const tag: unique symbol;
          export type Tagged = Readonly<{ [tag]?: true }>;
        `,
        errors: [{ messageId: 'optionalPhantom' }],
      },
      {
        name: 'a type-only symbol reached through an import alias',
        code: dedent`
          import { tag as aliased } from './file.js';

          export declare const tag: unique symbol;
          export type Tagged = Readonly<{ [aliased]?: true }>;
        `,
        errors: [{ messageId: 'optionalPhantom' }],
      },
      {
        name: 'a type-only symbol that a type alias of the same name merges with',
        code: dedent`
          declare const tag: unique symbol;
          type tag = typeof tag;
          export type Tagged = Readonly<{ [tag]?: tag }>;
        `,
        errors: [{ messageId: 'optionalPhantom' }],
      },
      {
        name: 'an optional class property',
        code: dedent`
          declare const tag: unique symbol;
          export class Tagged {
            declare readonly [tag]?: true;
          }
        `,
        errors: [{ messageId: 'optionalPhantom' }],
      },
      {
        name: 'an optional abstract class property',
        code: dedent`
          declare const tag: unique symbol;
          export abstract class Tagged {
            abstract readonly [tag]?: true;
          }
        `,
        errors: [{ messageId: 'optionalPhantom' }],
      },
      {
        name: 'an optional class method',
        code: dedent`
          declare const tag: unique symbol;
          export abstract class Tagged {
            abstract [tag]?(): void;
          }
        `,
        errors: [{ messageId: 'optionalPhantom' }],
      },
      {
        name: 'an optional abstract accessor',
        code: dedent`
          declare const tag: unique symbol;
          export abstract class Tagged {
            abstract accessor [tag]?: true;
          }
        `,
        errors: [{ messageId: 'optionalPhantom' }],
      },
      {
        name: 'an optional key typed never alongside other types',
        code: dedent`
          declare const tag: unique symbol;
          export type Tagged = Readonly<{ [tag]?: true | never }>;
        `,
        errors: [{ messageId: 'optionalPhantom' }],
      },
      {
        name: 'an optional method and accessor of a declared class',
        code: dedent`
          declare const a: unique symbol;
          declare const b: unique symbol;
          export declare class Tagged {
            [a]?(): void;
            accessor [b]?: true;
          }
        `,
        errors: [
          { messageId: 'optionalPhantom' },
          { messageId: 'optionalPhantom' },
        ],
      },
      {
        name: 'one report per optional property',
        code: dedent`
          declare const a: unique symbol;
          declare const b: unique symbol;
          export type Tagged = Readonly<{ [a]?: 1; [b]?: 2 }>;
        `,
        errors: [
          { messageId: 'optionalPhantom' },
          { messageId: 'optionalPhantom' },
        ],
      },
    ],
  });

  describe('through type wrappers', () => {
    tester.run('no-optional-phantom-property', noOptionalPhantomProperty, {
      valid: [
        {
          name: 'a runtime symbol widened by as on a method key',
          code: dedent`
            const brand: unique symbol = Symbol('brand');
            export abstract class Branded {
              [brand as symbol]?(): void {}
            }
          `,
        },
      ],
      invalid: [
        {
          name: 'a type-only symbol widened by as on a method key',
          code: dedent`
            declare const tag: unique symbol;
            export abstract class Tagged {
              [tag as symbol]?(): void {}
            }
          `,
          errors: [{ messageId: 'optionalPhantom' }],
        },
        {
          name: 'a type-only symbol behind satisfies on a method key',
          code: dedent`
            declare const tag: unique symbol;
            export abstract class Tagged {
              [tag satisfies symbol]?(): void {}
            }
          `,
          errors: [{ messageId: 'optionalPhantom' }],
        },
        {
          name: 'a type-only symbol behind a non-null assertion on a method key',
          code: dedent`
            declare const tag: unique symbol;
            export abstract class Tagged {
              [tag!]?(): void {}
            }
          `,
          errors: [{ messageId: 'optionalPhantom' }],
        },
        {
          name: 'a type-only symbol behind an angle-bracket assertion on a method key',
          code: dedent`
            declare const tag: unique symbol;
            export abstract class Tagged {
              [<symbol>tag]?(): void {}
            }
          `,
          errors: [{ messageId: 'optionalPhantom' }],
        },
        {
          name: 'a type-only symbol in parentheses on a method key',
          code: dedent`
            declare const tag: unique symbol;
            export abstract class Tagged {
              [(tag)]?(): void {}
            }
          `,
          errors: [{ messageId: 'optionalPhantom' }],
        },
        {
          name: 'a runtime symbol cast to a type-only one on a method key',
          code: dedent`
            declare const tag: unique symbol;
            const brand: unique symbol = Symbol('brand');
            export abstract class Tagged {
              [brand as unknown as typeof tag]?(): void {}
            }
          `,
          errors: [{ messageId: 'optionalPhantom' }],
        },
      ],
    });
  });
});
