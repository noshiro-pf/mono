import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferUnknownToAny } from './prefer-unknown-to-any.mjs';
import { codeFromStringLines } from './utils.mjs';

const ruleTester = new RuleTester();

ruleTester.run('prefer-unknown-to-any', preferUnknownToAny, {
  valid: [
    'const number: number = 1;',
    'function greet(): string {}',
    'function greet(): Array<string> {}',
    'function greet(): string[] {}',
    'function greet(): Array<Array<string>> {}',
    'function greet(): Array<string[]> {}',
    'function greet(param: Array<string>): Array<string> {}',

    codeFromStringLines(
      //
      'class Greeter {',
      '  message: string;',
      '}',
    ),
    codeFromStringLines(
      //
      'class Greeter {',
      '  message: Array<string>;',
      '}',
    ),
    codeFromStringLines(
      //
      'class Greeter {',
      '  message: string[];',
      '}',
    ),
    codeFromStringLines(
      //
      'class Greeter {',
      '  message: Array<Array<string>>;',
      '}',
    ),
    codeFromStringLines(
      //
      'class Greeter {',
      '  message: Array<string[]>;',
      '}',
    ),
    codeFromStringLines(
      //
      'interface Greeter {',
      '  message: string;',
      '}',
    ),
    codeFromStringLines(
      //
      'interface Greeter {',
      '  message: Array<string>;',
      '}',
    ),
    codeFromStringLines(
      //
      'interface Greeter {',
      '  message: string[];',
      '}',
    ),
    codeFromStringLines(
      //
      'interface Greeter {',
      '  message: Array<Array<string>>;',
      '}',
    ),
    codeFromStringLines(
      //
      'interface Greeter {',
      '  message: Array<string[]>;',
      '}',
    ),
    codeFromStringLines(
      //
      'type obj = {',
      '  message: string;',
      '};',
    ),
    codeFromStringLines(
      //
      'type obj = {',
      '  message: Array<string>;',
      '};',
    ),
    codeFromStringLines(
      //
      'type obj = {',
      '  message: string[];',
      '};',
    ),
    codeFromStringLines(
      //
      'type obj = {',
      '  message: Array<Array<string>>;',
      '};',
    ),
    codeFromStringLines(
      //
      'type obj = {',
      '  message: Array<string[]>;',
      '};',
    ),
    codeFromStringLines(
      //
      'type obj = {',
      '  message: string | number;',
      '};',
    ),
    codeFromStringLines(
      //
      'type obj = {',
      '  message: string | Array<string>;',
      '};',
    ),
    codeFromStringLines(
      //
      'type obj = {',
      '  message: string | string[];',
      '};',
    ),
    codeFromStringLines(
      //
      'type obj = {',
      '  message: string | Array<Array<string>>;',
      '};',
    ),
    codeFromStringLines(
      //
      'type obj = {',
      '  message: string & number;',
      '};',
    ),
    codeFromStringLines(
      //
      'type obj = {',
      '  message: string & Array<string>;',
      '};',
    ),
    codeFromStringLines(
      //
      'type obj = {',
      '  message: string & string[];',
      '};',
    ),
    codeFromStringLines(
      //
      'type obj = {',
      '  message: string & Array<Array<string>>;',
      '};',
    ),
  ],
  invalid: [
    {
      code: 'const number: any = 1',
      output: 'const number: unknown = 1',
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'function generic(): any {}',
      output: 'function generic(): unknown {}',
      errors: [
        {
          column: 21,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'function generic(): Array<any> {}',
      output: 'function generic(): Array<unknown> {}',
      errors: [
        {
          column: 27,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'function generic(): any[] {}',
      output: 'function generic(): unknown[] {}',
      errors: [
        {
          column: 21,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'function generic(param: Array<any>): number {}',
      output: 'function generic(param: Array<unknown>): number {}',
      errors: [
        {
          column: 31,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'function generic(param: any[]): number {}',
      output: 'function generic(param: unknown[]): number {}',
      errors: [
        {
          column: 25,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'function generic(param: Array<any>): Array<any> {}',
      output: 'function generic(param: Array<unknown>): Array<unknown> {}',
      errors: [
        {
          column: 31,
          line: 1,
          messageId: 'unexpectedAny',
        },
        {
          column: 44,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'function generic(): Array<Array<any>> {}',
      output: 'function generic(): Array<Array<unknown>> {}',
      errors: [
        {
          column: 33,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'function generic(): Array<any[]> {}',
      output: 'function generic(): Array<unknown[]> {}',
      errors: [
        {
          column: 27,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'class Greeter {',
        '  constructor(param: Array<any>) {}',
        '}',
      ),
      output: codeFromStringLines(
        //
        'class Greeter {',
        '  constructor(param: Array<unknown>) {}',
        '}',
      ),
      errors: [
        {
          column: 28,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'class Greeter {',
        '  message: any;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'class Greeter {',
        '  message: unknown;',
        '}',
      ),
      errors: [
        {
          column: 12,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'class Greeter {',
        '  message: Array<any>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'class Greeter {',
        '  message: Array<unknown>;',
        '}',
      ),
      errors: [
        {
          column: 18,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'class Greeter {',
        '  message: any[];',
        '}',
      ),
      output: codeFromStringLines(
        //
        'class Greeter {',
        '  message: unknown[];',
        '}',
      ),
      errors: [
        {
          column: 12,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'class Greeter {',
        '  message: Array<Array<any>>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'class Greeter {',
        '  message: Array<Array<unknown>>;',
        '}',
      ),
      errors: [
        {
          column: 24,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'class Greeter {',
        '  message: Array<any[]>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'class Greeter {',
        '  message: Array<unknown[]>;',
        '}',
      ),
      errors: [
        {
          column: 18,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'interface Greeter {',
        '  message: any;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'interface Greeter {',
        '  message: unknown;',
        '}',
      ),
      errors: [
        {
          column: 12,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'interface Greeter {',
        '  message: Array<any>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'interface Greeter {',
        '  message: Array<unknown>;',
        '}',
      ),
      errors: [
        {
          column: 18,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'interface Greeter {',
        '  message: any[];',
        '}',
      ),
      output: codeFromStringLines(
        //
        'interface Greeter {',
        '  message: unknown[];',
        '}',
      ),
      errors: [
        {
          column: 12,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'interface Greeter {',
        '  message: Array<Array<any>>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'interface Greeter {',
        '  message: Array<Array<unknown>>;',
        '}',
      ),
      errors: [
        {
          column: 24,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'interface Greeter {',
        '  message: Array<any[]>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'interface Greeter {',
        '  message: Array<unknown[]>;',
        '}',
      ),
      errors: [
        {
          column: 18,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: any;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: unknown;',
        '}',
      ),
      errors: [
        {
          column: 12,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: Array<any>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: Array<unknown>;',
        '}',
      ),
      errors: [
        {
          column: 18,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: any[];',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: unknown[];',
        '}',
      ),
      errors: [
        {
          column: 12,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: Array<Array<any>>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: Array<Array<unknown>>;',
        '}',
      ),
      errors: [
        {
          column: 24,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: Array<any[]>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: Array<unknown[]>;',
        '}',
      ),
      errors: [
        {
          column: 18,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: string | any;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: string | unknown;',
        '}',
      ),
      errors: [
        {
          column: 21,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: string | Array<any>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: string | Array<unknown>;',
        '}',
      ),
      errors: [
        {
          column: 27,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: string | any[];',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: string | unknown[];',
        '}',
      ),
      errors: [
        {
          column: 21,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: string | Array<Array<any>>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: string | Array<Array<unknown>>;',
        '}',
      ),
      errors: [
        {
          column: 33,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: string | Array<any[]>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: string | Array<unknown[]>;',
        '}',
      ),
      errors: [
        {
          column: 27,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: string & any;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: string & unknown;',
        '}',
      ),
      errors: [
        {
          column: 21,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: string & Array<any>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: string & Array<unknown>;',
        '}',
      ),
      errors: [
        {
          column: 27,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: string & any[];',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: string & unknown[];',
        '}',
      ),
      errors: [
        {
          column: 21,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: string & Array<Array<any>>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: string & Array<Array<unknown>>;',
        '}',
      ),
      errors: [
        {
          column: 33,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: codeFromStringLines(
        //
        'type obj = {',
        '  message: string & Array<any[]>;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'type obj = {',
        '  message: string & Array<unknown[]>;',
        '}',
      ),
      errors: [
        {
          column: 27,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'class Foo<t = any> extends Bar<any> {}',
      output: 'class Foo<t = unknown> extends Bar<unknown> {}',
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'unexpectedAny',
        },
        {
          column: 32,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'abstract class Foo<t = any> extends Bar<any> {}',
      output: 'abstract class Foo<t = unknown> extends Bar<unknown> {}',
      errors: [
        {
          column: 24,
          line: 1,
          messageId: 'unexpectedAny',
        },
        {
          column: 41,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'abstract class Foo<t = any> implements Bar<any>, Baz<any> {}',
      output:
        'abstract class Foo<t = unknown> implements Bar<unknown>, Baz<unknown> {}',
      errors: [
        {
          column: 24,
          line: 1,
          messageId: 'unexpectedAny',
        },
        {
          column: 44,
          line: 1,
          messageId: 'unexpectedAny',
        },
        {
          column: 54,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'new Foo<any>()',
      output: 'new Foo<unknown>()',
      errors: [
        {
          column: 9,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'Foo<any>()',
      output: 'Foo<unknown>()',
      errors: [
        {
          column: 5,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/64
      code: codeFromStringLines(
        //
        'function test<T extends Partial<any>>() {}',
        'const test = <T extends Partial<any>>() => {};',
      ),
      output: codeFromStringLines(
        //
        'function test<T extends Partial<unknown>>() {}',
        'const test = <T extends Partial<unknown>>() => {};',
      ),
      errors: [
        {
          column: 33,
          line: 1,
          messageId: 'unexpectedAny',
        },
        {
          column: 33,
          line: 2,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      // https://github.com/eslint/typescript-eslint-parser/issues/397
      code: codeFromStringLines(
        //
        'function foo(a: number, ...rest: any[]): void {',
        '  return;',
        '}',
      ),
      output: codeFromStringLines(
        //
        'function foo(a: number, ...rest: unknown[]): void {',
        '  return;',
        '}',
      ),
      errors: [
        {
          column: 34,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'type Any = any;',
      output: 'type Any = unknown;',
      errors: [
        {
          column: 12,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'function foo5(...args: any) {}',
      output: 'function foo5(...args: unknown) {}',
      errors: [
        {
          column: 24,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'const bar5 = function (...args: any) {}',
      output: 'const bar5 = function (...args: unknown) {}',
      errors: [
        {
          column: 33,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'const baz5 = (...args: any) => {}',
      output: 'const baz5 = (...args: unknown) => {}',
      errors: [
        {
          column: 24,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'interface Qux5 { (...args: any): void; }',
      output: 'interface Qux5 { (...args: unknown): void; }',
      errors: [
        {
          column: 28,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'function quux5(fn: (...args: any) => void): void {}',
      output: 'function quux5(fn: (...args: unknown) => void): void {}',
      errors: [
        {
          column: 30,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'function quuz5(): ((...args: any) => void) {}',
      output: 'function quuz5(): ((...args: unknown) => void) {}',
      errors: [
        {
          column: 30,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'type Fred5 = (...args: any) => void;',
      output: 'type Fred5 = (...args: unknown) => void;',
      errors: [
        {
          column: 24,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'type Corge5 = new (...args: any) => void;',
      output: 'type Corge5 = new (...args: unknown) => void;',
      errors: [
        {
          column: 29,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'interface Grault5 { new (...args: any): void; }',
      output: 'interface Grault5 { new (...args: unknown): void; }',
      errors: [
        {
          column: 35,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'interface Garply5 { f(...args: any): void; }',
      output: 'interface Garply5 { f(...args: unknown): void; }',
      errors: [
        {
          column: 32,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
    {
      code: 'declare function waldo5(...args: any): void;',
      output: 'declare function waldo5(...args: unknown): void;',
      errors: [
        {
          column: 34,
          line: 1,
          messageId: 'unexpectedAny',
        },
      ],
    },
  ],
  // valid: [],
  // invalid: [
  //   {
  //     code: 'function generic(param: Array<any>): Array<any> {}',
  //     output: 'function generic(param: Array<unknown>): Array<unknown> {}',
  //     errors: [
  //       {
  //         column: 31,
  //         line: 1,
  //         messageId: 'unexpectedAny',
  //       },
  //       {
  //         column: 44,
  //         line: 1,
  //         messageId: 'unexpectedAny',
  //       },
  //     ],
  //   },
  // ],
} as const);
