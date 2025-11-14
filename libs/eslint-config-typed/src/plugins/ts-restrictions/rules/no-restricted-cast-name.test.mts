import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { noRestrictedCastName } from './no-restricted-cast-name.mjs';

/* eslint-disable vitest/expect-expect */

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

describe('no-restricted-cast-name', () => {
  test('validates with string options', () => {
    tester.run(
      'no-restricted-cast-name with string options',
      noRestrictedCastName,
      {
        valid: [
          {
            code: 'const a = value as string;',
            options: ['number'],
          },
          {
            code: 'const a = <boolean>value;',
            options: ['number'],
          },
          {
            code: 'const a = value as MyType;',
            options: ['OtherType'],
          },
        ],
        invalid: [
          {
            code: 'const a = value as any;',
            options: ['any'],
            errors: [
              {
                messageId: 'restrictedCast',
                data: {
                  typeName: 'any',
                  fixMessage: '',
                },
              },
            ],
          },
          {
            code: 'const a = <any>value;',
            options: ['any'],
            errors: [
              {
                messageId: 'restrictedCast',
                data: {
                  typeName: 'any',
                  fixMessage: '',
                },
              },
            ],
          },
          {
            code: 'const a = value as unknown;',
            options: ['unknown'],
            errors: [
              {
                messageId: 'restrictedCast',
                data: {
                  typeName: 'unknown',
                  fixMessage: '',
                },
              },
            ],
          },
        ],
      },
    );
  });

  test('validates with fixWith type option', () => {
    tester.run(
      'no-restricted-cast-name with fixWith type option',
      noRestrictedCastName,
      {
        valid: [
          {
            code: 'const a = value as string;',
            options: [
              { name: 'any', fixWith: { kind: 'type', name: 'unknown' } },
            ],
          },
        ],
        invalid: [
          {
            code: 'const a = value as any;',
            options: [
              { name: 'any', fixWith: { kind: 'type', name: 'unknown' } },
            ],
            errors: [
              {
                messageId: 'restrictedCast',
                data: {
                  typeName: 'any',
                  fixMessage: '. Use "unknown" instead',
                },
              },
            ],
            output: 'const a = value as unknown;',
          },
          {
            code: 'const a = <any>value;',
            options: [
              { name: 'any', fixWith: { kind: 'type', name: 'unknown' } },
            ],
            errors: [
              {
                messageId: 'restrictedCast',
                data: {
                  typeName: 'any',
                  fixMessage: '. Use "unknown" instead',
                },
              },
            ],
            output: 'const a = value as unknown;',
          },
          {
            code: 'const a = foo as Bar;',
            options: [{ name: 'Bar', fixWith: { kind: 'type', name: 'Baz' } }],
            errors: [
              {
                messageId: 'restrictedCast',
              },
            ],
            output: 'const a = foo as Baz;',
          },
        ],
      },
    );
  });

  test('validates with fixWith function option', () => {
    tester.run(
      'no-restricted-cast-name with fixWith function option',
      noRestrictedCastName,
      {
        valid: [
          {
            code: 'const a = value as string;',
            options: [
              { name: 'any', fixWith: { kind: 'function', name: 'cast' } },
            ],
          },
        ],
        invalid: [
          {
            code: 'const a = value as any;',
            options: [
              { name: 'any', fixWith: { kind: 'function', name: 'cast' } },
            ],
            errors: [
              {
                messageId: 'restrictedCast',
                data: {
                  typeName: 'any',
                  fixMessage: '. Use "cast()" instead',
                },
              },
            ],
            output: 'const a = cast(value);',
          },
          {
            code: 'const a = <any>value;',
            options: [
              { name: 'any', fixWith: { kind: 'function', name: 'cast' } },
            ],
            errors: [
              {
                messageId: 'restrictedCast',
                data: {
                  typeName: 'any',
                  fixMessage: '. Use "cast()" instead',
                },
              },
            ],
            output: 'const a = cast(value);',
          },
          {
            code: 'const result = foo.bar as MyType;',
            options: [
              {
                name: 'MyType',
                fixWith: { kind: 'function', name: 'toMyType' },
              },
            ],
            errors: [
              {
                messageId: 'restrictedCast',
                data: {
                  typeName: 'MyType',
                  fixMessage: '. Use "toMyType()" instead',
                },
              },
            ],
            output: 'const result = toMyType(foo.bar);',
          },
        ],
      },
    );
  });

  test('validates with multiple options', () => {
    tester.run(
      'no-restricted-cast-name with multiple options',
      noRestrictedCastName,
      {
        valid: [
          {
            code: 'const a = value as string;',
            options: [
              'any',
              { name: 'unknown', fixWith: { kind: 'type', name: 'never' } },
            ],
          },
        ],
        invalid: [
          {
            code: 'const a = value as any;',
            options: [
              'any',
              { name: 'unknown', fixWith: { kind: 'type', name: 'never' } },
            ],
            errors: [
              {
                messageId: 'restrictedCast',
                data: {
                  typeName: 'any',
                  fixMessage: '',
                },
              },
            ],
          },
          {
            code: 'const a = value as unknown;',
            options: [
              'any',
              { name: 'unknown', fixWith: { kind: 'type', name: 'never' } },
            ],
            errors: [
              {
                messageId: 'restrictedCast',
                data: {
                  typeName: 'unknown',
                  fixMessage: '. Use "never" instead',
                },
              },
            ],
            output: 'const a = value as never;',
          },
        ],
      },
    );
  });

  test('validates qualified type names', () => {
    tester.run(
      'no-restricted-cast-name with qualified type names',
      noRestrictedCastName,
      {
        valid: [
          {
            code: 'const a = value as React.Component;',
            options: ['Component'],
          },
        ],
        invalid: [
          {
            code: 'const a = value as React.Component;',
            options: ['React.Component'],
            errors: [
              {
                messageId: 'restrictedCast',
                data: {
                  typeName: 'React.Component',
                  fixMessage: '',
                },
              },
            ],
          },
          {
            code: 'const a = <React.FC>value;',
            options: [
              {
                name: 'React.FC',
                fixWith: { kind: 'type', name: 'React.FunctionComponent' },
              },
            ],
            errors: [
              {
                messageId: 'restrictedCast',
              },
            ],
            output: 'const a = value as React.FunctionComponent;',
          },
        ],
      },
    );
  });
});
