import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { Arr, asUint32 } from 'ts-data-forge';
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
  ],
  invalid: [
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
  ],
} as const);

/** `inner` wrapped in `Readonly<…>` `depth` times. */
function nested(depth: number, inner: string): string {
  return depth === 0 ? inner : `Readonly<${nested(depth - 1, inner)}>`;
}

/** A function type taking a function type … `depth` levels deep, then `inner`. */
function curried(depth: number, inner: string): string {
  return depth === 0 ? inner : `(a: ${curried(depth - 1, inner)}) => void`;
}
