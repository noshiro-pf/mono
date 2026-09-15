import { createRule } from './create-rule.mjs';

/**
 * `functions/no-call-signature-member` — a type does not declare call or
 * construct signatures as members (Sumi spec/functions.md, D-58).
 *
 * Every shape such a member writes has a spelling without one, and that
 * spelling is the one Sumi keeps:
 *
 * ```ts
 * type Parse = { (value: string): number }; // → (value: string) => number
 * type Show = { (a: string): string; (a: number): number };
 * //          → ((a: string) => string) & ((a: number) => number)
 * type Labelled = { (value: number): string; readonly label: string };
 * //          → ((value: number) => string) & Readonly<{ label: string }>
 * type Make = { new (value: string): Date }; // → new (value: string) => Date
 * ```
 *
 * The intersection is not merely the other spelling of an overload set; it is
 * the stricter one. A function checked against a type with two or more call
 * signatures is compared with its type parameters erased to `any`, so
 * `{ <A>(a: A): A; <A>(a: A, b: A): A }` accepts an implementation returning
 * `number`. The intersection is checked member by member, one signature each,
 * and rejects it (measured on TypeScript 7.0.2 and 6.0.3).
 *
 * The type literal is also what a readonly pass reaches for: `Readonly<>` maps
 * properties only, so wrapping a literal that holds signatures leaves a type
 * nothing can call (noshiro-pf/mono#1881). With no signature members, a type
 * literal is only ever a record.
 *
 * Nothing needs the member form. D-58 kept it for overloaded members under
 * `method-signature-style: "property"`, as the only way to write one — but an
 * intersection is a property type like any other
 * (`encode: ((v: string) => string) & ((v: number) => number)`).
 *
 * This subsumes `typescript/prefer-function-type`, which reports the lone
 * signature only.
 */
export const noCallSignatureMember = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow call and construct signature members; write a function type, and an overload set as an intersection of function types (Sumi D-58).',
    },
    messages: {
      callSignature:
        'A call signature is not a type member in Sumi (D-58): write a function type `(…) => R`. Several of them are an intersection `((…) => R1) & ((…) => R2)`, and a callable value with properties is `((…) => R) & Readonly<{ … }>`.',
      constructSignature:
        'A construct signature is not a type member in Sumi (D-58): write a constructor type `new (…) => R`.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    TSCallSignatureDeclaration: (node) => {
      context.report({ node, messageId: 'callSignature' });
    },
    TSConstructSignatureDeclaration: (node) => {
      context.report({ node, messageId: 'constructSignature' });
    },
  }),
});
