import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { noRestrictedCastName } from './no-restricted-cast-name.mjs';

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
  describe('with string options', () => {
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

  describe('with fixWith type option', () => {
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

  describe('with fixWith function option', () => {
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

  describe('with multiple options', () => {
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

  describe('with qualified type names', () => {
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

describe('no-restricted-cast-name with parenthesized operands', () => {
  const toUnknown = [
    { name: 'any', fixWith: { kind: 'type', name: 'unknown' } },
  ] as const;

  const toCast = [
    { name: 'any', fixWith: { kind: 'function', name: 'cast' } },
  ] as const;

  tester.run('no-restricted-cast-name', noRestrictedCastName, {
    valid: [],
    invalid: [
      {
        name: 'an `as` keeps the parentheses around its operand',
        code: 'const f = () => ({ a: 1 }) as any;',
        options: toUnknown,
        errors: [{ messageId: 'restrictedCast' }],
        output: 'const f = () => ({ a: 1 }) as unknown;',
      },
      {
        name: 'a comma expression passed to the function keeps its parentheses',
        code: 'const y = (log(), x) as any;',
        options: toCast,
        errors: [{ messageId: 'restrictedCast' }],
        output: 'const y = cast((log(), x));',
      },
      {
        name: 'a comma expression under `<T>` passed to the function',
        code: 'const y = <any>(log(), x);',
        options: toCast,
        errors: [{ messageId: 'restrictedCast' }],
        output: 'const y = cast((log(), x));',
      },
      {
        name: '`<T>` turned into `as` under a binary operator is parenthesized',
        code: 'const y = 1 + <any>s;',
        options: toUnknown,
        errors: [{ messageId: 'restrictedCast' }],
        output: 'const y = 1 + (s as unknown);',
      },
      {
        name: 'the operand of `<T>` turned into `as` keeps its parentheses',
        code: 'const y = <any>(a == b);',
        options: toUnknown,
        errors: [{ messageId: 'restrictedCast' }],
        output: 'const y = (a == b) as unknown;',
      },
      {
        name: 'an object literal under `<T>` in an arrow body',
        code: 'const f = () => <any>{ a: 1 };',
        options: toUnknown,
        errors: [{ messageId: 'restrictedCast' }],
        output: 'const f = () => ({ a: 1 }) as unknown;',
      },
    ],
  });
});
