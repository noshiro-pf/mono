import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { ESLintUtils } from '@typescript-eslint/utils';
import dedent from 'dedent';
import { Arr, asUint32 } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { noHiddenTypeAssertions } from './no-hidden-type-assertions.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      project: './tsconfig.tests.json',
    },
    parser,
  },
});

ruleTester.run('no-hidden-type-assertions', noHiddenTypeAssertions, {
  valid: [
    // A cast to a function type that returns `unknown` asserts nothing
    {
      filename: 'file.ts',
      code: dedent`
        declare const parse: <T>(text: string) => T;
        export const result = (parse as (text: string) => unknown)('{}');
      `,
    },
    // A cast of a generic function whose type parameter appears in a parameter
    {
      filename: 'file.ts',
      code: dedent`
        declare const id: <T>(x: T) => T;
        export const result = (id as (x: string) => string)('a');
      `,
    },
    // A cast of a function that is not generic
    {
      filename: 'file.ts',
      code: dedent`
        declare const f: (text: string) => number;
        export const result = (f as (text: string) => number)('a');
      `,
    },
    // No call signature
    {
      filename: 'file.ts',
      code: dedent`
        foo()
      `,
    },
    // Hidden type assertion but set to `unknown`
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T = any>(url: string) => Promise<T>;
        }
        declare const axios: Axios;
        export const result: Promise<unknown> = axios.request<unknown>("hello");
      `,
    },
    // Hidden type assertion but set to `never`
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T>() => Promise<T>;
        }
        declare const axios: Axios;
        export const result = axios.request<never>();
      `,
    },
    // Generic used in input value, explicitly provided
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T = any>(url: T) => T;
        }
        declare const axios: Axios;
        export const result: string = axios.request<string>("hello");
      `,
    },
    // Generic used in input value, not explicitly provided
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T = any>(url: T) => Promise<T>;
        }
        declare const axios: Axios;
        export const result = axios.request("hello");
      `,
    },
    // Generic used in input value, not explicitly provided, no default
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T>(url: T) => Promise<T>;
        }
        declare const axios: Axios;
        export const result = axios.request("hello");
      `,
    },
    // No generic
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: (url: string) => Promise<string>;
        }
        declare const axios: Axios;
        export const result: Promise<string> = axios.request("hello");
      `,
    },
    // Reused generic name
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: <T = any>(
          a: string,
          b: T
        ) => typeof a extends (infer T)[] ? T : typeof a;
        export const result = foo("hello", "world");
      `,
    },
    // function type parameter
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T = any>(url: () => T) => Promise<T>;
        }
        declare const axios: Axios;
        export const result = axios.request(() => "hello");
      `,
    },
    // chainFirstIOK
    {
      filename: 'file.ts',
      code: dedent`
        declare const chainFirstIOK: <A, B>(
          f: (a: A) => Promise<B>
        ) => (first: Promise<A>) => Promise<A>;
      
        export const result = chainFirstIOK<string, boolean>(() =>
          Promise.resolve(true)
        );
      `,
    },
    // object literal type hidden type assertion but set to unknown
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T = any>(url: string) => { t: T };
        }
        declare const axios: Axios;
        export const result = axios.request<unknown>("hello");
      `,
    },
    // type param has default set to never
    {
      filename: 'file.ts',
      code: dedent`
        declare const right: <E = never, A = never>(a: A) => E | A;
        export const result = right("hello");
      `,
    },
    // toArray
    {
      filename: 'file.ts',
      code: dedent`
        export declare const toArray: <A>(val: readonly A[]) => A[];
        const ra = [""] as const;
        export const result = toArray(ra);
      `,
    },
    // A type parameter used only as the 101st member of a union in a value
    // parameter is found there too
    {
      filename: 'file.ts',
      code: dedent`
        declare function f<T>(x: ${Arr.seq(asUint32(100)).join(' | ')} | T): T;
        export const result = f<string>('a');
      `,
    },
    // A type parameter nested 150 levels deep in a value parameter is found
    {
      filename: 'file.ts',
      code: dedent`
        declare function f<T>(x: ${nested(150, 'T')}): T;
        declare const x: ${nested(150, 'string')};
        export const result = f<string>(x);
      `,
    },
    // A type parameter is found in a value parameter under each kind of type
    // node: parentheses, rest and optional tuple elements, the parameters of a
    // method or call signature, constructor, mapped, template literal and
    // `typeof` types
    {
      filename: 'file.ts',
      code: dedent`
        declare function f1<T>(x: (T | null)[]): T;
        export const r1 = f1<string>([]);
        declare function f2<T>(x: [...T[]]): T;
        export const r2 = f2<string>([]);
        declare function f3<T>(x: [T?]): T;
        export const r3 = f3<string>([]);
        declare function f4<T>(x: { m(a: T): void }): T;
        export const r4 = f4<string>({ m: () => {} });
        declare function f5<T>(x: { (a: T): void }): T;
        export const r5 = f5<string>(() => {});
        declare function f6<T>(x: new (a: T) => object): T;
        export const r6 = f6<string>(class { constructor(_a: string) {} });
        declare function f7<T>(x: { [K in keyof T]: string }): T;
        export const r7 = f7<{ a: number }>({ a: '' });
        declare function f8<T extends string>(x: \`a\${T}\`): T;
        export const r8 = f8<'b'>('ab');
        declare const g9: <U>(u: U) => U;
        declare function f9<T>(x: typeof g9<T>): T;
        export const r9 = f9<string>(g9);
      `,
    },
    // A type parameter of the return type that shadows the function's own is
    // not a use of the function's
    {
      filename: 'file.ts',
      code: dedent`
        declare function f<T>(): <T>(x: T) => T;
        export const result = f<string>();
      `,
    },
    // An `infer` type that shadows the function's type parameter is not a use
    // of it
    {
      filename: 'file.ts',
      code: dedent`
        declare function f<T>(): string[] extends (infer T)[] ? T : never;
        export const result = f<string>();
      `,
    },
    // A mapped type's key that shadows the function's type parameter is not a
    // use of it
    {
      filename: 'file.ts',
      code: dedent`
        declare function f<T>(): { [T in 'a']: T };
        export const result = f<string>();
      `,
    },
    // A type guard called with `unknown` or `never`, or whose type parameter
    // defaults to `unknown`, asserts nothing
    {
      filename: 'file.ts',
      code: dedent`
        declare function isT<T>(x: unknown): x is T;
        export const r1 = isT<unknown>(1);
        declare function assertT<T>(x: unknown): asserts x is T;
        assertT<never>(1);
        declare function isU<T = unknown>(x: unknown): x is T;
        export const r3 = isU(1);
      `,
    },
    // A type argument the call neither writes nor lets the checker infer
    // resolves to `unknown`, so the call asserts nothing: a type guard, an
    // assertion function, functions returning their type parameter, and one
    // whose other type parameter is inferred from an argument
    {
      filename: 'file.ts',
      code: dedent`
        declare function isT<T>(x: unknown): x is T;
        declare const v: unknown;
        export const r1 = isT(v);
        declare function assertT<T>(x: unknown): asserts x is T;
        assertT(v);
        declare function f<T>(): T;
        export const r3 = f();
        declare function g<T>(): readonly T[];
        export const r4 = g();
        declare function h<E, A>(a: A): E | A;
        export const r5 = h('a');
      `,
    },
    // A `never` default passes the call even where the checker infers the type
    // parameter from the contextual type
    {
      filename: 'file.ts',
      code: dedent`
        declare function ok<S, E = never>(s: S): { ok: S } | { err: E };
        export const r1: { ok: number } | { err: string } = ok(1);
        declare const right: <E = never, A = never>(a: A) => E | A;
        export const r2: string | number = right(1);
      `,
    },
    // A cast to a guard of `unknown` or `never`, or to an assertion of
    // truthiness alone, asserts nothing
    {
      filename: 'file.ts',
      code: dedent`
        declare function isT<T>(x: unknown): x is T;
        declare function assertT<T>(x: unknown): asserts x is T;
        declare const v: unknown;
        export const r1 = (isT as (x: unknown) => x is unknown)(v);
        export const r2 = (isT as (x: unknown) => x is never)(v);
        (assertT as (x: unknown) => asserts x is unknown)(v);
        (assertT as (x: unknown) => asserts x is never)(v);
        (assertT as (x: unknown) => asserts x)(v);
      `,
    },
    // A type parameter that only constrains, or defaults, one of the returned
    // function's own is not looked for, as before: here the returned function
    // hands back what its caller passes
    {
      filename: 'file.ts',
      code: dedent`
        declare function f<T>(): <U extends T>(u: U) => U;
        export const r1 = f<string>();
        declare function g<T>(): <U = T>(u: U) => U;
        export const r2 = g<string>();
      `,
    },
    // A type parameter an argument supplies is not judged, whatever the
    // context: the optional parameter given, an annotated callback, a rest
    // parameter given an argument or a spread
    {
      filename: 'file.ts',
      code: dedent`
        declare function g<T>(x?: T): T;
        export const r1: string = g('a');
        declare function k<T>(cb: (t: T) => void): T;
        export const r2: string = k((t: string) => {});
        declare function r<T>(...xs: readonly T[]): T;
        export const r3: string = r('a');
        declare const xs: readonly string[];
        export const r4: string = r(...xs);
        declare function m<T>(x: NoInfer<T>, y: T): T;
        export const r5: string = m('a', 'b');
      `,
    },
    // A type parameter no argument supplies and no context infers resolves to
    // \`unknown\`, so the call asserts nothing
    {
      filename: 'file.ts',
      code: dedent`
        declare function g<T>(x?: T): T;
        export const r1 = g();
        declare function parse<T = unknown>(): T;
        export const r2 = parse();
      `,
    },
    // A \`never\` default written nowhere passes where the declared return type
    // is a union with a member the type parameter is not in: the value may be
    // that member, as \`ok(1)\` is \`{ ok: number }\`
    {
      filename: 'file.ts',
      code: dedent`
        type Result<S, E> = { ok: S } | { err: E };
        declare function ok2<S, E = never>(s: S): Result<S, E>;
        export const r1: Result<number, string> = ok2(1);
        declare function maybe<T = never>(): T | undefined;
        export const r2: string | undefined = maybe();
        declare function wrap<T = never>(): { v: T | null } | undefined;
        export const r3: { v: string | null } | undefined = wrap();
        type Box<T> = { v: T };
        declare function boxed<T = never>(): Box<T> | undefined;
        export const r4: Box<string> | undefined = boxed();
      `,
    },
  ],
  invalid: [
    // A type parameter only an omitted optional parameter mentions is inferred
    // from the context alone
    {
      filename: 'file.ts',
      code: dedent`
        declare function g<T>(x?: T): T;
        export const r1: string = g();
      `,
      errors: [{ messageId: 'errorStringGeneric' }],
    },
    // \`NoInfer\` keeps the argument from supplying it
    {
      filename: 'file.ts',
      code: dedent`
        declare function h<T>(x: NoInfer<T>): T;
        export const r1: string = h('a');
      `,
      errors: [{ messageId: 'errorStringGeneric' }],
    },
    // A callback mentioning it only among its parameters, given a lambda with
    // an unannotated parameter, takes its type from the context too
    {
      filename: 'file.ts',
      code: dedent`
        declare function k<T>(cb: (t: T) => void): T;
        export const r1: string = k((t) => {});
      `,
      errors: [{ messageId: 'errorStringGeneric' }],
    },
    // A cast of a function whose only mention of the type parameter among its
    // parameters is under \`NoInfer\` is a cast of a hidden type assertion
    {
      filename: 'file.ts',
      code: dedent`
        declare function h<T>(x: NoInfer<T>): T;
        export const r1 = (h as (x: string) => string)('a');
      `,
      errors: [{ messageId: 'errorStringGeneric' }],
    },
    // A rest parameter given nothing supplies nothing
    {
      filename: 'file.ts',
      code: dedent`
        declare function r<T>(...xs: readonly T[]): T;
        export const r1: string = r();
      `,
      errors: [{ messageId: 'errorStringGeneric' }],
    },
    // An \`unknown\` default does not pass a type argument the context infers
    {
      filename: 'file.ts',
      code: dedent`
        declare function parse<T = unknown>(): T;
        export const r1: string = parse();
      `,
      errors: [{ messageId: 'errorStringGeneric' }],
    },
    // Nor does a \`never\` default where the return type is the type parameter
    // alone
    {
      filename: 'file.ts',
      code: dedent`
        declare function parse<T = never>(): T;
        export const r1: string = parse();
      `,
      errors: [{ messageId: 'errorStringGeneric' }],
    },
    // Nor where every member of the union has the type parameter in it
    {
      filename: 'file.ts',
      code: dedent`
        type Box<T> = { v: T };
        declare function both<T = never>(): Box<T> | { w: readonly T[] };
        export const r1: Box<string> | { w: readonly string[] } = both();
        declare function nullable<T = never>(): { v: T | null } | { w: T };
        export const r2: { v: string | null } | { w: string } = nullable();
      `,
      errors: Arr.create(2, { messageId: 'errorStringGeneric' } as const),
    },
    // A \`never\` default does not pass a type argument the call writes
    {
      filename: 'file.ts',
      code: dedent`
        declare function ok<S, E = never>(s: S): { ok: S } | { err: E };
        export const r1 = ok<number, string>(1);
      `,
      errors: [{ messageId: 'errorStringGeneric' }],
    },
    // Hidden type assertion set to arbitrary type
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T = any>(url: string) => Promise<T>;
        }
      
        declare const axios: Axios;
      
        export const result: Promise<boolean> = axios.request<boolean>("hello");
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    // Hidden type assertion set to parameter type coincidentally
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T = any>(url: string) => Promise<T>;
        }
      
        declare const axios: Axios;
      
        export const result: Promise<string> = axios.request<string>("hello");
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T = any>(url: string) => T;
        }
      
        declare const axios: Axios;
      
        export const result: boolean = axios.request<boolean>("hello");
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    // index into type
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T extends { a: U }, U>(url: string) => Promise<T["a"]>;
        }
      
        declare const axios: Axios;
      
        export const result = axios.request("hello");
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    // conditional type
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T>(
            url: string
          ) => T extends 42 ? 43 : 45;
        }
      
        declare const axios: Axios;
      
        export const result = axios.request<"asdf">("hello");
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    // object literal type
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T = any>(url: string) => { t: { t2: T } };
        }
        declare const axios: Axios;
        export const result = axios.request<boolean>("hello");
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    // tuple
    {
      filename: 'file.ts',
      code: dedent`
        declare class Axios {
          readonly request: <T = any>(url: string) => { t: [T] };
        }
        declare const axios: Axios;
        export const result = axios.request<boolean>("hello");
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    // A hidden type assertion made by casting the generic function to a
    // function type, which instantiates it without a type argument
    {
      filename: 'file.ts',
      code: dedent`
        declare const parse: <T>(text: string) => T;
        type Foo = Readonly<{ a: number }>;
        export const a = (parse as (text: string) => Foo)('{}');
        export const b = (<(text: string) => Foo>parse)('{}');
        export const c = (parse as unknown as (text: string) => Foo)('{}');
        export const d = (parse! as (text: string) => Foo)('{}');
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
        {
          messageId: 'errorStringGeneric',
        },
        {
          messageId: 'errorStringGeneric',
        },
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    // A type parameter used only as the 101st member of a union is found:
    // the bound is on depth, not on a node's position among its siblings
    {
      filename: 'file.ts',
      code: dedent`
        declare function f<T>(): ${Arr.seq(asUint32(100)).join(' | ')} | T;
        export const result = f<string>();
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    // A type parameter nested 150 levels deep in the return type is found
    {
      filename: 'file.ts',
      code: dedent`
        declare function f<T>(): ${nested(150, 'T')};
        export const result = f<string>();
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    // A function type's parameters are explored once, so curried callback types
    // nested many levels deep do not take exponential time
    {
      filename: 'file.ts',
      code: dedent`
        declare function f<T>(): ${curried(30, 'T')};
        export const result = f<string>();
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    // A type parameter is found in the return type under each kind of type
    // node: parentheses, a type predicate (narrowing or asserting), the
    // parameters of a method or call signature, constructor, mapped, template
    // literal and `typeof` types
    {
      filename: 'file.ts',
      code: dedent`
        declare function f1<T>(): (T | null)[];
        export const r1 = f1<string>();
        declare function f2<T>(x: unknown): x is T;
        export const r2 = f2<string>(1);
        declare function f3<T>(): { m(a: T): void };
        export const r3 = f3<string>();
        declare function f4<T>(): { (a: T): void };
        export const r4 = f4<string>();
        declare function f5<T>(): new () => T;
        export const r5 = f5<string>();
        declare function f6<T>(): { [K in keyof T]: string };
        export const r6 = f6<{ a: number }>();
        declare function f7<T extends string>(): \`a\${T}\`;
        export const r7 = f7<'b'>();
        declare const g8: <U>() => U;
        declare function f8<T>(): typeof g8<T>;
        export const r8 = f8<string>();
        declare function f9<T>(x: unknown): asserts x is T;
        f9<string>(1);
      `,
      errors: Arr.create(9, { messageId: 'errorStringGeneric' } as const),
    },
    // A type argument the checker resolves to something other than `unknown`
    // asserts it, though none is written: inferred from the contextual type,
    // the type parameter's constraint, or an `any` default
    {
      filename: 'file.ts',
      code: dedent`
        declare function f<T>(): T;
        export const r1: string = f();
        declare function k<T>(): Promise<T>;
        export const r2: Promise<string> = k();
        declare function g<T extends string>(): T;
        export const r3 = g();
        declare function h<T = any>(): T;
        export const r4 = h();
      `,
      errors: Arr.create(4, { messageId: 'errorStringGeneric' } as const),
    },
    // A cast to a type guard or an assertion function of a type other than
    // `unknown` or `never`
    {
      filename: 'file.ts',
      code: dedent`
        declare function isT<T>(x: unknown): x is T;
        declare function assertT<T>(x: unknown): asserts x is T;
        declare const v: unknown;
        (assertT as (x: unknown) => asserts x is string)(v);
        export const r2 = (isT as (x: unknown) => x is unknown[])(v);
      `,
      errors: Arr.create(2, { messageId: 'errorStringGeneric' } as const),
    },
    // A cast of a function whose type parameter only a type predicate uses
    {
      filename: 'file.ts',
      code: dedent`
        declare function isT<T>(x: unknown): x is T;
        type Foo = Readonly<{ a: number }>;
        declare const v: unknown;
        export const result = (isT as (x: unknown) => x is Foo)(v);
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    // A type parameter of a value parameter's own type that shadows the
    // function's is not a use of the function's
    {
      filename: 'file.ts',
      code: dedent`
        declare function f<T>(x: <T>(t: T) => void): T;
        export const result = f<string>(() => {});
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
  ],
} as const);

// TypeScript before 5.8 has no public `getTypeArgumentsForResolvedSignature`:
// a call is judged by its written type argument or the type parameter's
// default, and one that writes neither is reported
ruleTester.run(
  'no-hidden-type-assertions without resolved type arguments',
  withoutResolvedTypeArguments(noHiddenTypeAssertions),
  {
    valid: [
      {
        filename: 'file.ts',
        code: dedent`
          declare function isT<T>(x: unknown): x is T;
          declare const v: unknown;
          export const r1 = isT<unknown>(v);
          declare function f<T = never>(): T;
          export const r2 = f();
          declare const right: <E = never, A = never>(a: A) => E | A;
          export const r3 = right('a');
        `,
      },
    ],
    invalid: [
      {
        filename: 'file.ts',
        code: dedent`
          declare function isT<T>(x: unknown): x is T;
          declare const v: unknown;
          export const r1 = isT(v);
          export const r2 = isT<string>(v);
          declare function f<T = any>(): T;
          export const r3 = f();
        `,
        errors: Arr.create(3, { messageId: 'errorStringGeneric' } as const),
      },
    ],
  } as const,
);

/**
 * `rule` run with a type checker that lacks
 * `getTypeArgumentsForResolvedSignature`, as TypeScript before 5.8 does.
 */
function withoutResolvedTypeArguments(
  rule: typeof noHiddenTypeAssertions,
): typeof noHiddenTypeAssertions {
  return {
    ...rule,
    create: (context) => {
      const parserServices = ESLintUtils.getParserServices(context);

      const checker = overriding(
        parserServices.program.getTypeChecker(),
        'getTypeArgumentsForResolvedSignature',
        undefined,
      );

      return rule.create(
        overriding(
          context,
          'sourceCode',
          overriding(context.sourceCode, 'parserServices', {
            ...parserServices,
            program: overriding(
              parserServices.program,
              'getTypeChecker',
              () => checker,
            ),
          }),
        ),
      );
    },
  };
}

/**
 * `base` with its property `key` read as `value`, which may be `undefined` to
 * stand for an older version of `base` that lacks it. The proxy's target is a
 * copy, since a frozen `base` may not report one of its own properties
 * differently.
 */
const overriding = <
  K extends PropertyKey,
  T extends Partial<ReadonlyRecord<K, unknown>>,
>(
  base: T,
  key: K,
  value: T[K] | undefined,
): T =>
  new Proxy(
    { ...base },
    {
      get: (_target, property) =>
        property === key ? value : Reflect.get(base, property),
    },
  );

/** `inner` wrapped in `Readonly<…>` `depth` times. */
function nested(depth: number, inner: string): string {
  return depth === 0 ? inner : `Readonly<${nested(depth - 1, inner)}>`;
}

/** A function type taking a function type … `depth` levels deep, then `inner`. */
function curried(depth: number, inner: string): string {
  return depth === 0 ? inner : `(a: ${curried(depth - 1, inner)}) => void`;
}
