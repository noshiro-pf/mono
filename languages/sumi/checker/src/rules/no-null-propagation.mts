import {
  isBindingElement,
  isVariableDeclaration,
  type Node as TsNode,
} from 'typescript-native/unstable/ast';
import { TypeFlags, type Type } from 'typescript-native/unstable/sync';
import { type Rule } from '../engine/index.mjs';

/**
 * `null/no-null-propagation` — a declaration's type does not include `null`
 * (Sumi spec/null-undefined.md, D-27).
 *
 * This is the half of the ban that needs the checker. `null/no-null-in-type`
 * already refuses a `null` anyone *wrote*, so what is left is the `null` that
 * arrives by inference — the return of an external API stored without an
 * annotation:
 *
 * ```ts
 * const el = document.querySelector('.foo'); // Element | null propagates
 * ```
 *
 * Reporting it is what forces the boundary normalization the spec asks for:
 * with the declaration refused, the only place left to put the `?? undefined`
 * is the expression itself.
 *
 * Only declarations **without** a type annotation are examined. An annotation
 * that says `null` is the other rule's business, and one that does not cannot
 * introduce a `null` the checker would see.
 */
export const noNullPropagation: Rule = {
  ruleId: 'null/no-null-propagation',
  description:
    'Disallow a declaration whose inferred type includes `null`; normalize at the boundary with `?? undefined` (Sumi D-27).',
  messages: {
    inferredNull:
      'This declaration takes a `null` from its initializer. "No value" is `undefined` in Sumi: normalize where the `null` enters (`?? undefined`) rather than letting the type propagate.',
  },
  visit: (node, { checker, report }) => {
    const name = annotationFreeDeclarationName(node);

    if (name === undefined) return;

    const type = checker.getTypeAtLocation(name);

    if (type === undefined || !includesNull(type)) return;

    report(name, 'inferredNull');
  },
} as const;

/**
 * The name of a variable declaration that carries no type annotation, or
 * `undefined` for anything else.
 *
 * Restricting the checker query to these is what keeps the pass cheap: the
 * walk visits every node, and asking about each one would cost a round trip
 * per node.
 *
 * Variable declarations and the bindings a destructuring pattern introduces,
 * for now. A binding element can carry no annotation at all, so every one is
 * examined; a variable declaration whose name is a pattern resolves to the
 * pattern's own type, which is the tuple or object rather than a member, so
 * the two do not report the same fault twice.
 *
 * A parameter or a property that this codebase writes always carries an
 * annotation, which the syntactic rule covers; the ones that do not are
 * contextually typed callback parameters, where the `null` comes from the
 * collection being iterated. Return positions are next
 * (spec/null-undefined.md).
 */
const annotationFreeDeclarationName = (node: TsNode): TsNode | undefined => {
  if (isBindingElement(node)) return node.name;

  return isVariableDeclaration(node) && node.type === undefined
    ? node.name
    : undefined;
};

/** Whether `null` is the type itself or one of its union members. */
const includesNull = (type: Type): boolean =>
  type.isUnionType() ? type.getTypes().some(isNullType) : isNullType(type);

const isNullType = (type: Type): boolean => (type.flags & TypeFlags.Null) !== 0;
