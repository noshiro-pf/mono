import {
  isArrowFunction,
  isFunctionExpression,
} from 'typescript-native/unstable/ast';
import { SignatureKind } from 'typescript-native/unstable/sync';
import { type Rule } from '../engine/index.mjs';

/**
 * `functions/no-overloaded-function-expression` — a function expression is
 * not checked against more than one call signature (Sumi spec/functions.md,
 * D-58).
 *
 * An overload set in Sumi is written one way: a `function` declaration with
 * its signatures listed (D-13). The other way TypeScript accepts is a function
 * expression whose contextual type carries several call signatures —
 * annotating a `const`, or filling a property typed that way:
 *
 * ```ts
 * type Show = ((a: string) => string) & ((a: string[]) => string);
 *
 * const show: Show = (a: string | string[]): string => …; // reported
 * ```
 *
 * The form has nothing to offer. An expression is accepted only when its own
 * signature is assignable to every one of the set's — so its own signature
 * already takes every call the set takes, and returns no less precisely. The
 * set is then a refinement a single signature states just as well (D-58). The
 * one thing overloads are wanted for, a return type that follows the argument,
 * is exactly what the form cannot express without an assertion: an
 * implementation `(a: string | number) => string | number` is assignable to
 * neither `(a: string) => string` nor `(a: number) => number`.
 *
 * It is also where TypeScript checks least. Against a type literal with two or
 * more call signatures the implementation is compared with its type parameters
 * erased to `any`, so a generic implementation may return anything.
 *
 * The rule asks about the contextual type, not the syntax of an annotation, so
 * an alias, a `typeof`, an intersection and a property of an annotated object
 * are all seen. A reference to a `function` declaration is not a function
 * expression and is not reported (`const f: Show = showDeclaration`).
 */
export const noOverloadedFunctionExpression: Rule = {
  ruleId: 'functions/no-overloaded-function-expression',
  description:
    'Disallow a function expression whose contextual type has more than one call signature; write a single signature, or a `function` declaration with overloads (Sumi D-58).',
  messages: {
    overloaded:
      'This function is checked against {{count}} call signatures. A function expression cannot implement an overload set in Sumi (D-58): if it is accepted, its own signature already says everything the set does — give the binding that single signature. If the return type has to follow the argument, write a `function` declaration with overloads.',
  },
  visit: (node, { checker, report }) => {
    if (!isArrowFunction(node) && !isFunctionExpression(node)) {
      return;
    }

    const contextualType = checker.getContextualType(node);

    if (contextualType === undefined) {
      return;
    }

    // `F | undefined` contributes no signature of its own, but a union's
    // signatures are only resolved when every member has some.
    const callable = checker.getNonNullableType(contextualType);

    if (callable === undefined) {
      return;
    }

    const count = checker.getSignaturesOfType(
      callable,
      SignatureKind.Call,
    ).length;

    if (count < 2) {
      return;
    }

    report(node, 'overloaded', { count: String(count) });
  },
} as const;
