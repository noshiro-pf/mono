import {
  isCallExpression,
  isPropertyAccessExpression,
} from 'typescript-native/unstable/ast';
import { type Type } from 'typescript-native/unstable/sync';
import { ownerOf } from '../ast/index.mjs';
import { type Rule } from '../engine/index.mjs';

/**
 * `mutation/no-tuple-length-change` — a tuple's length does not change
 * (Sumi spec/variables-and-mutation.md).
 *
 * A tuple type states a length, and TypeScript does not keep it. A mutable
 * tuple inherits from `Array`, so `push`, `pop`, `shift`, `unshift` and
 * `splice` are all callable on one, and the type goes on claiming the
 * original length afterwards:
 *
 * ```ts
 * const mut_pair: [number, number] = [1, 2];
 *
 * mut_pair.push(3);
 *
 * const claimed: 2 = mut_pair.length; // still 2 to the checker; 3 at runtime
 * mut_pair[2]; // a type error, and the value is there
 * ```
 *
 * Assigning to `length` is already refused, because a tuple's `length` is a
 * literal type. The methods are the hole, and this rule closes it.
 *
 * It is the one mutation rule the `mut_` prefix does not excuse.
 * `mutation/no-mutation-without-mut-prefix` asks *who may* mutate; this one
 * says what a tuple is, and a name cannot make a two-element tuple hold
 * three. Rewriting an element (`mut_pair[0] = 9`) stays legal, as do the
 * mutators that keep the length — `sort`, `reverse`, `fill`, `copyWithin`.
 */
export const noTupleLengthChange: Rule = {
  ruleId: 'mutation/no-tuple-length-change',
  description:
    "Disallow the Array methods that change a tuple's length, which its type claims is fixed.",
  messages: {
    lengthChanged:
      '`{{method}}` changes the length of a tuple. Its type states the length and TypeScript keeps claiming it afterwards, so the type and the value stop agreeing. Build a new tuple, or use an array type if the length varies.',
  },
  visit: (node, { checker, report }) => {
    if (!isCallExpression(node)) return;

    const callee = node.expression;

    if (!isPropertyAccessExpression(callee)) return;

    const method = callee.name.text;

    // The syntactic filter that keeps the pass cheap: everything else costs
    // nothing, and the checker is asked only about these five names.
    if (!lengthChangingMethods.has(method)) return;

    // `Array` rather than `ReadonlyArray`: a readonly tuple does not have
    // these members at all, so tsc has already refused the call.
    if (ownerOf(checker, callee) !== 'Array') return;

    const receiverType = checker.getTypeAtLocation(callee.expression);

    if (receiverType === undefined || !isTupleTyped(receiverType)) return;

    report(callee.name, 'lengthChanged', { method });
  },
} as const;

/**
 * The `Array` mutators that change the length. The ones that reorder or
 * overwrite in place — `sort`, `reverse`, `fill`, `copyWithin` — are not
 * here: they leave a tuple's length, and therefore its type, intact.
 */
const lengthChangingMethods: ReadonlySet<string> = new Set([
  'pop',
  'push',
  'shift',
  'splice',
  'unshift',
]);

/**
 * Whether the receiver is a tuple — or a union in which any member is, since
 * a call on `[number, number] | number[]` can land on the tuple.
 *
 * A tuple arrives as a *type reference* whose target is the tuple, so
 * `isTupleType()` on the type itself answers `false` and the target has to be
 * asked (measured against the API: `[number, number]` is a reference with
 * `isTupleType: false` and `getTarget().isTupleType: true`).
 */
const isTupleTyped = (type: Type): boolean => {
  if (type.isUnionType()) return type.getTypes().some(isTupleTyped);

  if (type.isTupleType()) return true;

  return type.isTypeReference() && type.getTarget().isTupleType();
};
