import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferCanonicalLengthConstrainedTuple } from './prefer-canonical-length-constrained-tuple.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  },
});

describe('prefer-canonical-length-constrained-tuple', () => {
  tester.run(
    'prefer-canonical-length-constrained-tuple',
    preferCanonicalLengthConstrainedTuple,
    {
      valid: [
        {
          name: 'ignores heterogeneous tuples',
          code: 'type T = readonly [string, number];',
        },
        {
          name: 'ignores single-element tuples',
          code: 'type T = readonly [string];',
        },
        {
          name: 'ignores tuples longer than maxLength',
          options: [{ maxLength: 2 }],
          code: 'type T = readonly [string, string, string];',
        },
        {
          name: 'ignores labelled members (the labels would be lost)',
          code: 'type T = readonly [a: string, b: string];',
        },
        {
          name: 'ignores optional members',
          code: 'type T = readonly [string, string?];',
        },
        {
          name: 'ignores rest-only tuples',
          code: 'type T = readonly [...string[]];',
        },
        {
          name: 'ignores a tuple that defines a directly recursive alias',
          code: 'type T = readonly [T, T];',
        },
        {
          name: 'ignores a tuple whose alias recurses through another alias',
          code: dedent`
            type LambdaTerm = string | LambdaApplication;
            type LambdaApplication = readonly [LambdaTerm, LambdaTerm];
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a chain of aliases',
          code: dedent`
            type A = readonly [B, B];
            type B = C;
            type C = A | string;
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through an intersection',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Pair & { readonly tag: string };
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a type argument',
          code: dedent`
            type Pair = readonly [Box<Pair>, Box<Pair>];
            type Box<T> = { readonly v: T };
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through an indexed access',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Wrapper[number];
            type Wrapper = readonly Pair[];
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through an interface',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Wrapper['x'];
            interface Wrapper {
              x: Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through an interface heritage clause',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Wrapper['x'];
            interface Wrapper extends Base<Pair> {}
            interface Base<T> {
              x: T;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through the interface an interface extends',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Wrapper['x'];
            interface Wrapper extends Base {}
            interface Base {
              x: Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through an interface declared twice',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Wrapper['x'];
            interface Wrapper {
              y: string;
            }
            interface Wrapper {
              x: Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a class',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Wrapper['x'];
            declare class Wrapper {
              x: Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through the class a class extends',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Wrapper['x'];
            declare class Wrapper extends Base {}
            declare class Base {
              x: Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a class reached with typeof',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = InstanceType<typeof Wrapper>['x'];
            declare class Wrapper {
              x: Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a class expression bound to a const',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = InstanceType<typeof Wrapper>['x'];
            const Wrapper = class {
              x!: Pair;
            };
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a class that extends a call',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Wrapper['x'];
            declare function mix<T>(base: T): T;
            declare class Base {
              x: Pair;
            }
            declare class Wrapper extends mix(Base) {}
          `,
        },
        {
          name: 'ignores a tuple whose cycle runs through a name redeclared in a namespace',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Wrapper['x'];
            interface Wrapper {
              x: Pair;
            }
            namespace N {
              export type Wrapper = string;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a function reached with typeof',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = ReturnType<typeof f>;
            declare function f(): Pair;
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a variable reached with typeof',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = (typeof v)[0];
            declare const v: Pair;
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a wrapped class expression',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = InstanceType<typeof Wrapper>['x'];
            const Wrapper = (class {
              x!: Pair;
            }) satisfies unknown;
          `,
        },
        {
          name: 'ignores a tuple in an interface member that leads back to the interface',
          code: dedent`
            interface Wrapper {
              x: readonly [Foo, Foo];
            }
            type Foo = Wrapper['x'];
          `,
        },
        {
          name: 'ignores a tuple in a class member that leads back to the class',
          code: dedent`
            declare class Wrapper {
              x: readonly [Foo, Foo];
            }
            type Foo = Wrapper['x'];
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a property reached with typeof',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = typeof v.x;
            declare const v: { x: Pair };
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a destructured variable',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = typeof a;
            declare const [a]: [Pair];
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through an object pattern with a default and a rest',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = typeof b | typeof r;
            const { x: b = 0, ...r } = source as { x: Pair; y: Pair };
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through an interface extending a namespace member',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Wrapper['x'];
            interface Wrapper extends N.Base {}
            namespace N {
              export interface Base {
                x: Pair;
              }
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a namespace member type',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = N.Wrapper['x'];
            namespace N {
              export type Wrapper = { x: Pair };
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a dotted namespace',
          code: dedent`
            type Pair = readonly [A.B.Foo, A.B.Foo];
            namespace A.B {
              export type Foo = Pair | string;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through an import-equals alias',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            import Foo = N.Foo2;
            namespace N {
              export type Foo2 = Pair | string;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through the inner part of a dotted namespace',
          code: dedent`
            namespace A {
              export type Pair = readonly [B.Foo, B.Foo];
            }
            namespace A.B {
              export type Foo = Pair | string;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a namespace reached with typeof',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = (typeof N)['v'];
            namespace N {
              export declare const v: Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple in a namespace that a typeof of the namespace leads back to',
          code: dedent`
            namespace N {
              export declare const v: readonly [Foo, Foo];
            }
            type Foo = (typeof N)['v'];
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a variable initialized from another',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = typeof b;
            declare const a: Pair;
            const b = a;
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a variable initialized from a call',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = typeof v;
            declare function f(): Pair;
            const v = f();
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a class field initializer',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = InstanceType<typeof Wrapper>['x'];
            declare const p: Pair;
            class Wrapper {
              x = p;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a computed key of a destructuring',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = ReturnType<typeof make>;
            declare const key: Pair extends unknown ? 'a' : 'b';
            function make({ [key]: v }: { a: 1; b: 2 }) {
              return v;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a default of a destructuring',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = ReturnType<typeof make>;
            declare const fallback: Pair;
            function make({ a = fallback }: { a?: unknown }) {
              return a;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through an enum member initializer',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = ReturnType<typeof make>;
            declare const k: Pair extends unknown ? 1 : 2;
            function make() {
              enum E {
                A = k,
              }
              return E.A;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a top-level enum member initializer',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = ReturnType<typeof make>;
            declare const k: Pair extends unknown ? 1 : 2;
            enum E {
              A = k,
            }
            function make() {
              return E.A;
            }
          `,
        },
        {
          name: 'ignores a tuple whose cycle runs through a variable a namespace member key would hide',
          code: dedent`
            namespace A.B {
              export const X = foo;
            }
            declare const foo: number;
            const B = { X: make() };
            type Pair = readonly [T, T];
            type T = typeof B.X;
            declare function make(): Pair;
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through an import type of a module this file declares',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = import('m').X;
            declare module 'm' {
              export type X = Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple in a class member that typeof this leads back to',
          code: dedent`
            declare function make<T>(value: T): T;
            class C {
              p!: readonly [typeof this.q, typeof this.q];
              q = make(this.p);
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through globalThis',
          code: dedent`
            declare global {
              type Pair = readonly [Foo, Foo];
              type Foo = globalThis.Bar;
              type Bar = Pair;
            }
            export {};
          `,
        },
        {
          name: 'ignores a tuple in a named class expression that typeof this leads back to',
          code: dedent`
            declare function make<T>(value: T): T;
            const D = class C {
              p!: readonly [typeof this.q, typeof this.q];
              q = make(this.p);
            };
          `,
        },
        {
          name: 'ignores a tuple in an anonymous class that typeof this leads back to',
          code: dedent`
            declare function make<T>(value: T): T;
            export default class {
              p!: readonly [typeof this.q, typeof this.q];
              q = make(this.p);
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a global function read off globalThis',
          code: dedent`
            declare global {
              function make(): Pair;
            }
            type Pair = readonly [T, T];
            const v = globalThis.make();
            type T = typeof v;
            export {};
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through typeof of a module this file declares',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = (typeof import('m'))['x'];
            declare module 'm' {
              export const x: Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a wildcard module this file declares',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = import('x.css').X;
            declare module '*.css' {
              export type X = Pair;
            }
          `,
        },
        {
          // `typeof this.q` leads to the class itself, which the tuple sits in:
          // suppressed whatever `q` is, as any cycle back counts.
          name: 'conservatively ignores a tuple in an anonymous class expression that names typeof this',
          code: dedent`
            const D = class {
              p!: readonly [typeof this.q, typeof this.q];
              q = 1;
            };
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a namespace in a module this file declares',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = (typeof import('m'))['N']['x'];
            declare module 'm' {
              export namespace N {
                export const x: Pair;
              }
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through the default export of a module this file declares',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = (typeof import('m'))['default'];
            declare module 'm' {
              export default function f(): Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through an exact module declared beside a wildcard one',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = (typeof import('x.css'))['y'];
            declare module '*.css' {
              export const z: number;
            }
            declare module 'x.css' {
              export const y: Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through the default export of a declared module by qualifier',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = ReturnType<typeof import('m').default>;
            declare module 'm' {
              export default function f(): Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through an anonymous default export of a declared module',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = ReturnType<(typeof import('m'))['default']>;
            declare module 'm' {
              export default function (): Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a renamed export of a declared module',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = typeof import('m').y;
            declare module 'm' {
              const x: Pair;
              export { x as y };
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a re-export between declared modules',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = typeof import('m').y;
            declare module 'm' {
              export { y } from 'n';
            }
            declare module 'n' {
              export const y: Pair;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through an import-equals require of a declared module',
          code: dedent`
            import Foo = require('m');
            declare module 'm' {
              const x: Pair;
              export = x;
            }
            type Pair = readonly [Foo, Foo];
          `,
        },
        {
          // `import('m').X` leads to the whole of `declare module 'm'`, as its
          // members are not keyed by their exported names; `Y` names `Pair`, so
          // the rewrite is withheld though `X` is a string.
          name: 'conservatively ignores a tuple of a member of a declared module another member of which names the alias',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = import('m').X;
            declare module 'm' {
              export type X = string;
              export type Y = Pair;
            }
          `,
        },
        {
          name: 'conservatively ignores a tuple in a declared module that names a sibling through the module',
          code: dedent`
            declare module 'm' {
              export type Pair = readonly [Foo, Foo];
              type Foo = import('m').Other;
              export type Other = string;
            }
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a named import of a declared module',
          code: dedent`
            import { X as Foo } from 'm';
            declare module 'm' {
              export type X = Pair;
            }
            type Pair = readonly [Foo, Foo];
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a default import of a declared module',
          code: dedent`
            import foo from 'm';
            declare module 'm' {
              const x: Pair;
              export default x;
            }
            type Pair = readonly [typeof foo, typeof foo];
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a namespace import of a declared module',
          code: dedent`
            import * as M from 'm';
            declare module 'm' {
              export type X = Pair;
            }
            type Pair = readonly [M.X, M.X];
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a dynamic import of a declared module',
          code: dedent`
            declare module 'm' {
              export const p: Pair;
            }
            const load = () => import('m');
            type Pair = readonly [Foo, Foo];
            type Foo = Awaited<ReturnType<typeof load>>['p'];
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a dynamic import written as a template literal',
          code: dedent`
            declare module 'm' {
              export const p: Pair;
            }
            const load = () => import(\`m\`);
            type Pair = readonly [Foo, Foo];
            type Foo = Awaited<ReturnType<typeof load>>['p'];
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a type parameter default',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo<T = Pair> = T;
          `,
        },
        {
          // A member's type is deferred, so this rewrite would compile; the
          // rule cannot tell this cycle from one that breaks, and leaves it.
          name: 'conservatively ignores a tuple in a class method that names the class',
          code: dedent`
            declare class Vec {
              split(): readonly [Vec, Vec];
            }
          `,
        },
        {
          name: 'ignores a cycle through a class expression wrapped in as',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = InstanceType<typeof Wrapper>['x'];
            const Wrapper = class {
              x!: Pair;
            } as unknown as new () => { x: Pair };
          `,
        },
        {
          name: 'ignores a cycle through a class expression wrapped in <T>',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = InstanceType<typeof Wrapper>['x'];
            const Wrapper = <typeof Base>class {
              x!: Pair;
            };
            declare const Base: new () => object;
          `,
        },
        {
          name: 'ignores a cycle through a superclass wrapped in ! and as',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Wrapper['x'];
            declare const maybeBase: typeof Base | undefined;
            declare class Base {
              x: Pair;
            }
            declare class Wrapper extends (maybeBase! as typeof Base) {}
          `,
        },
        {
          // Both of these compile either way: TypeScript resolves an object
          // type without resolving its members, so the rewritten form is fine
          // here. The rule suppresses them all the same — see the note on
          // `closesDeclarationCycle` for why the exception cannot be made
          // safely.
          name: 'conservatively ignores a cycle closed through an object type',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = { readonly p: Pair };
          `,
        },
        {
          name: 'conservatively ignores a cycle closed through an array',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = readonly Pair[];
          `,
        },
        {
          name: 'conservatively ignores a tuple nested in its own alias',
          code: 'type Tree = { readonly kids: readonly [Tree, Tree] };',
        },
        {
          name: 'still ignores nothing when the cycle does not reach the tuple',
          code: dedent`
            type Loop = readonly Loop[];
            type Unrelated = string;
          `,
        },
        {
          name: 'ignores plain arrays',
          code: 'type T = readonly string[];',
        },
        {
          name: 'ignores tuple patterns in a conditional type `extends` clause',
          code: dedent`
            type And<A extends boolean, B extends boolean> = [A, B] extends [
              true,
              true,
            ]
              ? true
              : false;
          `,
        },
        {
          name: 'ignores tuple patterns nested in an `extends` clause',
          code: 'type T<A> = A extends readonly (readonly [string, string])[] ? 1 : 2;',
        },
        {
          name: 'stays silent when the target name is bound locally',
          code: dedent`
            type FixedLengthTuple<N, V> = readonly [N, V];
            type T = readonly [string, string];
          `,
        },
      ],
      invalid: [
        {
          // `import 'm'` binds nothing, so `n` takes nothing from `m`.
          name: 'still rewrites a tuple whose only route back is a side-effect import in a declared module',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = typeof import('n');
            declare module 'n' {
              import 'm';
            }
            declare module 'm' {
              export const p: Pair;
            }
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type Pair = FixedLengthTuple<2, Foo>;
            type Foo = typeof import('n');
            declare module 'n' {
              import 'm';
            }
            declare module 'm' {
              export const p: Pair;
            }
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple of a named import of a declared module with no cycle',
          code: dedent`
            import { X as Foo } from 'm';
            declare module 'm' {
              export type X = string;
            }
            type Pair = readonly [Foo, Foo];
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            import { X as Foo } from 'm';
            declare module 'm' {
              export type X = string;
            }
            type Pair = FixedLengthTuple<2, Foo>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple in a class expression that closes no cycle',
          code: dedent`
            const D = class {
              p!: readonly [string, string];
            };
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            const D = class {
              p!: FixedLengthTuple<2, string>;
            };
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple of typeof a module this file does not declare',
          code: "type Pair = readonly [typeof import('m'), typeof import('m')];",
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type Pair = FixedLengthTuple<2, typeof import('m')>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: "still rewrites a tuple whose alias shares its name with a type predicate's parameter",
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = ReturnType<typeof isPair>;
            function isPair(Pair: unknown): Pair is string {
              return true;
            }
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type Pair = FixedLengthTuple<2, Foo>;
            type Foo = ReturnType<typeof isPair>;
            function isPair(Pair: unknown): Pair is string {
              return true;
            }
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: "still rewrites a tuple of an import type whose qualifier shares the alias's name",
          code: dedent`
            type Pair = readonly [import('./other').Pair, import('./other').Pair];
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type Pair = FixedLengthTuple<2, import('./other').Pair>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple whose alias shares its name with a destructured shorthand property',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = ReturnType<typeof make>;
            function make({ Pair }: { Pair: number }) {
              return 1;
            }
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type Pair = FixedLengthTuple<2, Foo>;
            type Foo = ReturnType<typeof make>;
            function make({ Pair }: { Pair: number }) {
              return 1;
            }
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple whose alias shares its name with an index signature parameter',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Bag;
            interface Bag {
              [Pair: string]: number;
            }
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type Pair = FixedLengthTuple<2, Foo>;
            type Foo = Bag;
            interface Bag {
              [Pair: string]: number;
            }
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: "still rewrites a tuple whose alias shares its name with a mapped type's key",
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = { [Pair in 'a']: 1 };
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type Pair = FixedLengthTuple<2, Foo>;
            type Foo = { [Pair in 'a']: 1 };
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple whose alias shares its name with a local binding or a property',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = ReturnType<typeof g>;
            function g(x: number) {
              const Pair = 1;
              return { Pair: x };
            }
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type Pair = FixedLengthTuple<2, Foo>;
            type Foo = ReturnType<typeof g>;
            function g(x: number) {
              const Pair = 1;
              return { Pair: x };
            }
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple that names a sibling through its own namespace',
          code: dedent`
            namespace N {
              export type Foo = string;
              export type Pair = readonly [N.Foo, N.Foo];
            }
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            namespace N {
              export type Foo = string;
              export type Pair = FixedLengthTuple<2, N.Foo>;
            }
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple whose alias shares its name with a member of a local namespace',
          code: dedent`
            namespace Utils {
              export type Range = number;
            }
            type Range = readonly [Utils.Range, Utils.Range];
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            namespace Utils {
              export type Range = number;
            }
            type Range = FixedLengthTuple<2, Utils.Range>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple whose alias shares its name with a local in a namespace function',
          code: dedent`
            namespace Utils {
              export type X = number;
              export function f() {
                const Pair = 1;
                return Pair;
              }
            }
            type Pair = readonly [Utils.X, Utils.X];
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            namespace Utils {
              export type X = number;
              export function f() {
                const Pair = 1;
                return Pair;
              }
            }
            type Pair = FixedLengthTuple<2, Utils.X>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple of a dotted namespace member when another member of the outer namespace mentions it',
          code: dedent`
            namespace A {
              export type Other = Pair;
            }
            namespace A.B {
              export type Foo = string;
            }
            type Pair = readonly [A.B.Foo, A.B.Foo];
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            namespace A {
              export type Other = Pair;
            }
            namespace A.B {
              export type Foo = string;
            }
            type Pair = FixedLengthTuple<2, A.B.Foo>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple whose alias shares its name with a member of an outside namespace',
          code: dedent`
            import * as vscode from 'vscode';
            type Range = readonly [vscode.Range, vscode.Range];
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            import * as vscode from 'vscode';
            type Range = FixedLengthTuple<2, vscode.Range>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple of an import-equals require of a declared module with no cycle',
          code: dedent`
            import Foo = require('m');
            declare module 'm' {
              export type Bar = string;
            }
            type Pair = readonly [Foo, Foo];
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            import Foo = require('m');
            declare module 'm' {
              export type Bar = string;
            }
            type Pair = FixedLengthTuple<2, Foo>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple in a namespace that closes no cycle',
          code: dedent`
            namespace N {
              export type Pair = readonly [Foo, Foo];
            }
            type Foo = string;
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            namespace N {
              export type Pair = FixedLengthTuple<2, Foo>;
            }
            type Foo = string;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple in a function signature that closes no cycle',
          code: 'declare function f(): readonly [string, string];',
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            declare function f(): FixedLengthTuple<2, string>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites a tuple in a destructured variable that closes no cycle',
          code: 'const [a]: readonly [readonly [string, string]] = source;',
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            const [a]: readonly [FixedLengthTuple<2, string>] = source;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          // A class's instance type does not take its members from the
          // interfaces it implements, so `Iface` closes no cycle here.
          name: 'still rewrites a tuple whose only route back is an implemented interface',
          code: dedent`
            type Pair = readonly [Foo, Foo];
            type Foo = Wrapper['y'];
            declare class Wrapper implements Iface {
              y: string;
            }
            interface Iface {
              x: Pair;
            }
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type Pair = FixedLengthTuple<2, Foo>;
            type Foo = Wrapper['y'];
            declare class Wrapper implements Iface {
              y: string;
            }
            interface Iface {
              x: Pair;
            }
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'still rewrites the branches of a conditional type',
          code: 'type T<A> = A extends 1 ? [true, true] : 2;',
          output: dedent`
            import { type MutableFixedLengthTuple } from 'ts-type-forge';
            type T<A> = A extends 1 ? MutableFixedLengthTuple<2, true> : 2;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'readonly non-empty tuple',
          code: 'type T = readonly [string, ...string[]];',
          output: dedent`
            import { type NonEmptyTuple } from 'ts-type-forge';
            type T = NonEmptyTuple<string>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'mutable non-empty tuple',
          code: 'type T = [string, ...string[]];',
          output: dedent`
            import { type MutableNonEmptyTuple } from 'ts-type-forge';
            type T = MutableNonEmptyTuple<string>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'readonly non-empty tuple with a readonly rest spelling',
          code: 'type T = readonly [string, ...(readonly string[])];',
          output: dedent`
            import { type NonEmptyTuple } from 'ts-type-forge';
            type T = NonEmptyTuple<string>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'readonly fixed-length tuple',
          code: 'type T = readonly [string, string, string];',
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type T = FixedLengthTuple<3, string>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'mutable fixed-length tuple',
          code: 'type T = [string, string, string];',
          output: dedent`
            import { type MutableFixedLengthTuple } from 'ts-type-forge';
            type T = MutableFixedLengthTuple<3, string>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'readonly min-length tuple',
          code: 'type T = readonly [number, number, ...number[]];',
          output: dedent`
            import { type MinLengthTuple } from 'ts-type-forge';
            type T = MinLengthTuple<2, number>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'mutable min-length tuple',
          code: 'type T = [number, number, ...number[]];',
          output: dedent`
            import { type MutableMinLengthTuple } from 'ts-type-forge';
            type T = MutableMinLengthTuple<2, number>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'readonly rest spelling inside a readonly tuple',
          code: 'type T = readonly [number, number, ...(readonly number[])];',
          output: dedent`
            import { type MinLengthTuple } from 'ts-type-forge';
            type T = MinLengthTuple<2, number>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'handles the default maximum length of 10',
          code: 'type T = readonly [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];',
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type T = FixedLengthTuple<10, 1>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'keeps a composite element type intact',
          code: 'type T = readonly [string | number, string | number];',
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type T = FixedLengthTuple<2, string | number>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'handles generic element types',
          code: 'type T<V> = [V, V, ...V[]];',
          output: dedent`
            import { type MutableMinLengthTuple } from 'ts-type-forge';
            type T<V> = MutableMinLengthTuple<2, V>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'adds named imports once per target type',
          code: dedent`
            type A = readonly [string, string];
            type B = readonly [number, number, number];
            type C = [number, number, ...number[]];
          `,
          output: [
            dedent`
              import { type FixedLengthTuple, type MutableMinLengthTuple } from 'ts-type-forge';
              type A = FixedLengthTuple<2, string>;
              type B = readonly [number, number, number];
              type C = [number, number, ...number[]];
            `,
            dedent`
              import { type FixedLengthTuple, type MutableMinLengthTuple } from 'ts-type-forge';
              type A = FixedLengthTuple<2, string>;
              type B = FixedLengthTuple<3, number>;
              type C = MutableMinLengthTuple<2, number>;
            `,
          ],
          errors: [
            { messageId: 'useCanonicalTuple' },
            { messageId: 'useCanonicalTuple' },
            { messageId: 'useCanonicalTuple' },
          ],
        },
        {
          name: 'adds no import under importStyle: global',
          options: [{ importStyle: 'global' }],
          code: 'type T = readonly [string, string];',
          output: 'type T = FixedLengthTuple<2, string>;',
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'reuses an aliased import',
          code: dedent`
            import { type FixedLengthTuple as FLT } from 'ts-type-forge';

            type T = readonly [string, string];
          `,
          output: dedent`
            import { type FixedLengthTuple as FLT } from 'ts-type-forge';

            type T = FLT<2, string>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'gives a report that needs no import no import edit',
          code: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type A = readonly [number, number];
            type C = [number, number, ...number[]];
          `,
          // C's import edit spans A, so A follows in the next pass.
          output: [
            dedent`
              import { type FixedLengthTuple, type MutableMinLengthTuple } from 'ts-type-forge';
              type A = readonly [number, number];
              type C = MutableMinLengthTuple<2, number>;
            `,
            dedent`
              import { type FixedLengthTuple, type MutableMinLengthTuple } from 'ts-type-forge';
              type A = FixedLengthTuple<2, number>;
              type C = MutableMinLengthTuple<2, number>;
            `,
          ],
          errors: [
            { messageId: 'useCanonicalTuple' },
            { messageId: 'useCanonicalTuple' },
          ],
        },
        {
          name: 'rewrites parameter and return type positions',
          code: 'declare const f: (xs: readonly [number, number]) => [string, string];',
          output: [
            dedent`
              import { type FixedLengthTuple, type MutableFixedLengthTuple } from 'ts-type-forge';
              declare const f: (xs: FixedLengthTuple<2, number>) => [string, string];
            `,
            dedent`
              import { type FixedLengthTuple, type MutableFixedLengthTuple } from 'ts-type-forge';
              declare const f: (xs: FixedLengthTuple<2, number>) => MutableFixedLengthTuple<2, string>;
            `,
          ],
          errors: [
            { messageId: 'useCanonicalTuple' },
            { messageId: 'useCanonicalTuple' },
          ],
        },
        {
          name: 'respects a raised maxLength',
          options: [{ maxLength: 12 }],
          code: 'type T = readonly [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];',
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type T = FixedLengthTuple<12, 0>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
      ],
    },
  );
});
