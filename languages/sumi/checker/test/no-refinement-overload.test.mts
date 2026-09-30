import dedent from 'dedent';
import { noRefinementOverload } from '../src/index.mjs';
import { testRule } from './rule-tester.mjs';

describe(noRefinementOverload.ruleId, () => {
  testRule(noRefinementOverload, {
    valid: [
      {
        name: 'the arity ranges do not overlap',
        code: dedent`
          export function arity(): number;
          export function arity(a: number): string;
          export function arity(a?: number): number | string {
            return a === undefined ? 0 : String(a);
          }
        `,
      },
      {
        name: 'typeof tells the parameter types apart',
        code: dedent`
          export function byTypeof(value: number): number;
          export function byTypeof(value: string): string;
          export function byTypeof(value: number | string): number | string {
            return value;
          }
        `,
      },
      {
        name: 'a function and an object are told apart by typeof',
        code: dedent`
          export function lazy(value: () => number): number;
          export function lazy(value: Readonly<{ n: number }>): string;
          export function lazy(
            value: (() => number) | Readonly<{ n: number }>,
          ): number | string {
            return typeof value === 'function' ? value() : String(value.n);
          }
        `,
      },
      {
        name: 'a branded number is a number',
        code: dedent`
          type Brand = number & Readonly<{ brand: 'brand' }>;

          export function branded(value: Brand): Brand;
          export function branded(value: string): string;
          export function branded(value: Brand | string): Brand | string {
            return value;
          }
        `,
      },
      {
        name: 'a type parameter is judged by its constraint',
        code: dedent`
          export function constrained<S extends string>(value: S): S;
          export function constrained(value: number): number;
          export function constrained(value: number | string): number | string {
            return value;
          }
        `,
      },
      {
        name: 'a discriminant property tells the parameter types apart',
        code: dedent`
          type Circle = Readonly<{ kind: 'circle'; r: number }>;
          type Square = Readonly<{ kind: 'square'; side: number }>;

          export function area(shape: Circle): 'round';
          export function area(shape: Square): 'angular';
          export function area(shape: Circle | Square): 'round' | 'angular' {
            return shape.kind === 'circle' ? 'round' : 'angular';
          }
        `,
      },
      {
        name: 'a later position tells them apart when the first cannot',
        code: dedent`
          export function second(key: string, value: number): number;
          export function second(key: string, value: string): string;
          export function second(
            key: string,
            value: number | string,
          ): number | string {
            return key.length > 0 ? value : value;
          }
        `,
      },
      {
        name: 'an optional parameter absent on one side is undefined there',
        code: dedent`
          export function optional(a: number, b?: number): number;
          export function optional(a: number, b: string): string;
          export function optional(
            a: number,
            b?: number | string,
          ): number | string {
            return b ?? a;
          }
        `,
      },
      {
        name: 'a function without overloads, and overloads in a block',
        code: dedent`
          export const single = (value: number): number => value;

          export const nested = (): number => {
            function inner(value: number): number;
            function inner(value: string): string;
            function inner(value: number | string): number | string {
              return value;
            }

            return inner(1);
          };
        `,
      },
    ],
    invalid: [
      {
        name: 'subtypes of each other: one runtime body',
        code: dedent`
          type Base = Readonly<{ id: number }>;
          type Derived = Readonly<{ id: number; name: string }>;

          export function describeIt(value: Derived): string;
          export function describeIt(value: Base): number;
          export function describeIt(value: Base): number | string {
            return value.id;
          }
        `,
        errors: [{ messageId: 'indistinguishable', line: 5 }],
      },
      {
        name: 'a type-guard predicate and a boolean predicate are both functions',
        code: dedent`
          export function filterIt<A, B extends A>(
            pred: (a: A) => a is B,
          ): (xs: readonly A[]) => readonly B[];
          export function filterIt<A>(
            pred: (a: A) => boolean,
          ): (xs: readonly A[]) => readonly A[];
          export function filterIt<A>(
            pred: (a: A) => boolean,
          ): (xs: readonly A[]) => readonly A[] {
            return (xs) => xs.filter(pred);
          }
        `,
        errors: [{ messageId: 'indistinguishable', line: 4 }],
      },
      {
        name: 'an unconstrained type parameter may be anything',
        code: dedent`
          export function anything<T>(value: T): T;
          export function anything(value: number): string;
          export function anything(value: unknown): unknown {
            return value;
          }
        `,
        errors: [{ messageId: 'indistinguishable', line: 2 }],
      },
      {
        name: 'literal members of one typeof class overlap without a tag',
        code: dedent`
          export function literal(value: 'a'): 1;
          export function literal(value: string): 2;
          export function literal(value: string): 1 | 2 {
            return value === 'a' ? 1 : 2;
          }
        `,
        errors: [{ messageId: 'indistinguishable', line: 2 }],
      },
      {
        name: 'overlapping tag values',
        code: dedent`
          type Loose = Readonly<{ kind: 'a' | 'b' }>;
          type Tight = Readonly<{ kind: 'b' | 'c' }>;

          export function tag(value: Loose): 1;
          export function tag(value: Tight): 2;
          export function tag(value: Loose | Tight): 1 | 2 {
            return value.kind === 'a' ? 1 : 2;
          }
        `,
        errors: [{ messageId: 'indistinguishable', line: 5 }],
      },
      {
        name: 'each signature is reported once, against the first it overlaps',
        code: dedent`
          export function many(value: object): 1;
          export function many(value: Readonly<{ a: number }>): 2;
          export function many(value: Readonly<{ b: number }>): 3;
          export function many(value: object): 1 | 2 | 3 {
            return 'a' in value ? 2 : 1;
          }
        `,
        errors: [
          { messageId: 'indistinguishable', line: 2 },
          { messageId: 'indistinguishable', line: 3 },
        ],
      },
      {
        name: 'ambient overloads with no implementation',
        code: dedent`
          export declare function ambient(value: readonly number[]): number;
          export declare function ambient(value: readonly string[]): string;
        `,
        errors: [{ messageId: 'indistinguishable', line: 2 }],
      },
    ],
  });
});
