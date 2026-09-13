import {
  isCallExpression,
  isPropertyAccessExpression,
} from 'typescript-native/unstable/ast';
import { type Type } from 'typescript-native/unstable/sync';
import { ownerOf } from '../ast/index.mjs';
import { type Rule } from '../engine/index.mjs';

/**
 * `mutation/no-tuple-mutating-method` — the `Array` mutators are not called on
 * a tuple (Sumi spec/variables-and-mutation.md).
 *
 * A tuple type states a length and a type per position, and TypeScript keeps
 * neither once one of these methods runs. A mutable tuple inherits from
 * `Array`, so all nine are callable on one, and the type goes on describing
 * the value as it was:
 *
 * ```ts
 * const mut_pair: [number, string] = [1, 'a'];
 *
 * mut_pair.push(3); // length: the type still says 2, the value is 3 long
 * mut_pair.reverse(); // positions: slot 1 is typed string and now holds 1
 * mut_pair.fill(0); // both slots become 0; slot 1 is still typed string
 *
 * const stillString: string = mut_pair[1]; // checks, and is a number
 * ```
 *
 * Every one of those is accepted by TypeScript today (measured). Assigning to
 * `length` is the only part it refuses, because a tuple's `length` is a
 * literal type.
 *
 * Assigning to an element (`mut_pair[0] = 9`) stays legal: that is checked
 * against the type of *that slot*, so it cannot put a value where it does not
 * belong. The methods are banned because none of them are.
 *
 * This is the one mutation rule the `mut_` prefix does not excuse.
 * `mutation/no-mutation-without-mut-prefix` asks *who may* mutate; this one
 * says what a tuple is, and a name cannot make a two-element tuple hold three
 * or put a string in the number slot.
 *
 * **On a homogeneous tuple some of these are sound**, and they are reported
 * anyway. `[number, number].reverse()` cannot put a value in the wrong slot,
 * but making the rule depend on whether the element types happen to coincide
 * would make it a question to work out per call site rather than a property
 * of tuples. The copying forms — `toSorted`, `toReversed`, `with` — return an
 * array and are untouched, which is the shape to reach for when the order is
 * what varies.
 */
export const noTupleMutatingMethod: Rule = {
  ruleId: 'mutation/no-tuple-mutating-method',
  description:
    'Disallow the `Array` mutators on a tuple, whose type states a length and a type per position that they do not preserve.',
  messages: {
    lengthChanged:
      '`{{method}}` changes the length of a tuple, and its type goes on stating the original one. Build a new tuple, or use an array type if the length varies.',
    positionsRewritten:
      '`{{method}}` moves or overwrites a tuple’s elements by position, and its type states a type per position — so a value can land in a slot typed for something else. Use the copying form (`toSorted`, `toReversed`, `with`), which returns an array.',
  },
  visit: (node, { checker, report }) => {
    if (!isCallExpression(node)) return;

    const callee = node.expression;

    if (!isPropertyAccessExpression(callee)) return;

    const method = callee.name.text;

    const messageId = mutatorMessages[method];

    // The syntactic filter that keeps the pass cheap: everything else costs
    // nothing, and the checker is asked only about these nine names.
    if (messageId === undefined) return;

    // `Array` rather than `ReadonlyArray`: a readonly tuple does not have
    // these members at all, so tsc has already refused the call.
    if (ownerOf(checker, callee) !== 'Array') return;

    const receiverType = checker.getTypeAtLocation(callee.expression);

    if (receiverType === undefined || !isTupleTyped(receiverType)) return;

    report(callee.name, messageId, { method });
  },
} as const;

/**
 * Every `Array` mutator, and which way it breaks a tuple. The two groups are
 * reported differently because the fix differs: a length change wants a
 * different type, a position rewrite wants the copying form.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/prototype
 */
const mutatorMessages: Readonly<Record<string, string | undefined>> = {
  pop: 'lengthChanged',
  push: 'lengthChanged',
  shift: 'lengthChanged',
  splice: 'lengthChanged',
  unshift: 'lengthChanged',

  copyWithin: 'positionsRewritten',
  fill: 'positionsRewritten',
  reverse: 'positionsRewritten',
  sort: 'positionsRewritten',
};

/**
 * Whether the receiver is a tuple — or a union in which any member is, since
 * a call on `[number, number] | number[]` can land on the tuple.
 *
 * A tuple arrives as a *type reference* whose target is the tuple, so
 * `isTupleType()` on the type itself answers `false` and the target has to be
 * asked (measured against the API).
 */
const isTupleTyped = (type: Type): boolean => {
  if (type.isUnionType()) return type.getTypes().some(isTupleTyped);

  if (type.isTupleType()) return true;

  return type.isTypeReference() && type.getTarget().isTupleType();
};
