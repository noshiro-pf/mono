import * as tsm from 'ts-morph';

/**
 * Determines whether a type node is an operand (check or extends type) of a
 * conditional type whose check type is wrapped to suppress union distribution,
 * i.e. the `X` and `Y` in `X extends Y ? ... : ...` where `X` is itself a tuple
 * or array.
 *
 * Wrapping a naked type parameter so that it is no longer naked is a well-known
 * type-implementation idiom used to suppress union distribution. Both
 * `[A] extends [B] ? ...` (tuple wrapping) and `A[] extends B[] ? ...` (array
 * wrapping) rely on this. Adding a `readonly` modifier to those operands neither
 * makes the type more immutable in any meaningful way nor preserves the idiom's
 * intent, so such operands must be left untouched.
 *
 * A naked check type such as `T extends string[] ? ...` still distributes, so it
 * is not a guard; arrays/tuples in its extends position are converted as usual.
 *
 * @param node - The type node to check
 * @returns true if the node is the check or extends type of a distribution-guarded
 *   conditional type
 */
export const isConditionalTypeDistributionGuard = (node: tsm.Node): boolean => {
  const parent = node.getParent();

  if (parent?.isKind(tsm.SyntaxKind.ConditionalType) !== true) {
    return false;
  }

  const checkType = parent.getCheckType();

  // The guard is only in effect when the check type itself is wrapped in a tuple
  // or array; otherwise (e.g. a naked `T`) the conditional still distributes.
  if (
    !checkType.isKind(tsm.SyntaxKind.TupleType) &&
    !checkType.isKind(tsm.SyntaxKind.ArrayType)
  ) {
    return false;
  }

  return (
    checkType.compilerNode === node.compilerNode ||
    parent.getExtendsType().compilerNode === node.compilerNode
  );
};
