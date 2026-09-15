import dedent from 'dedent';
import { noOverloadedFunctionExpression } from '../src/index.mjs';
import { testRule } from './rule-tester.mjs';

describe(noOverloadedFunctionExpression.ruleId, () => {
  testRule(noOverloadedFunctionExpression, {
    valid: [
      {
        name: 'a single signature',
        code: dedent`
          type Single = (value: string | number) => string;

          export const single: Single = (value: string | number): string =>
            String(value);
        `,
      },
      {
        name: 'a single signature behind an optional annotation',
        code: dedent`
          export const optional: ((value: string) => string) | undefined = (
            value: string,
          ): string => value;
        `,
      },
      {
        name: 'a reference to an overloaded function declaration',
        code: dedent`
          function declared(value: number): number;
          function declared(value: string): string;
          function declared(value: number | string): number | string {
            return value;
          }

          type Declared = ((value: number) => number) & ((value: string) => string);

          export const reference: Declared = declared;
        `,
      },
      {
        name: 'a callback, typed by the one signature the call resolved to',
        code: dedent`
          export const lengths = ['a', 'bb'].map((s: string): number => s.length);
        `,
      },
      {
        name: 'a callable value with properties has one call signature',
        code: dedent`
          type Labelled = ((value: number) => string) & Readonly<{ label: string }>;

          export const make = (f: (value: number) => string): Labelled =>
            Object.assign(f, { label: 'x' });
        `,
      },
    ],
    invalid: [
      {
        name: 'an annotated const, through an alias of an intersection',
        code: dedent`
          type Intersected = ((value: string) => string) &
            ((value: readonly string[]) => string);

          export const intersected: Intersected = (
            value: string | readonly string[],
          ): string => (typeof value === 'string' ? value : value.join());
        `,
        errors: [{ messageId: 'overloaded', line: 4 }],
      },
      {
        name: 'a type literal with call signatures, where generics are erased',
        code: dedent`
          type Erased = { <A>(a: A): A; <A>(a: A, b: A): A };

          export const erased: Erased = <A,>(a: A, _b?: A): A => a;
        `,
        errors: [{ messageId: 'overloaded', line: 3 }],
      },
      {
        name: 'a function expression',
        code: dedent`
          type Keyword = ((value: string) => string) & ((value: number) => string);

          export const keyword: Keyword = function (value: number | string): string {
            return String(value);
          };
        `,
        errors: [{ messageId: 'overloaded', line: 3 }],
      },
      {
        name: 'a property of an annotated object',
        code: dedent`
          type Codec = Readonly<{
            encode: ((value: string) => string) & ((value: number) => string);
          }>;

          export const codec: Codec = {
            encode: (value: number | string): string => String(value),
          };
        `,
        errors: [{ messageId: 'overloaded', line: 6 }],
      },
      {
        name: 'a returned function',
        code: dedent`
          type Returned = ((value: string) => string) & ((value: number) => string);

          export const makeReturned = (): Returned => (value: number | string): string =>
            String(value);
        `,
        errors: [{ messageId: 'overloaded', line: 3 }],
      },
    ],
  });
});
