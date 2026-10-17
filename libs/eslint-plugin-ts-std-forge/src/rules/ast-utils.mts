import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { skipTypeWrappers, typeWrapperLayers } from 'eslint-rule-forge';
import type * as ts from 'typescript';

/**
 * Whether `node`, read through its type wrappers, is the identifier `name`:
 * `Number`, `(Number as NumberConstructor)` and `Number!` are the same object.
 */
export const isIdentifierNamed = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  name: string,
): boolean => {
  const unwrapped = skipTypeWrappers(node);

  return (
    unwrapped.type === AST_NODE_TYPES.Identifier && unwrapped.name === name
  );
};

/**
 * Whether `holds` is true of the type of every layer of type wrappers around
 * `node` (see {@link typeWrapperLayers}), outermost to innermost; `false`
 * without type information. A widening cast (`s as string | number`) is the
 * author saying the value may be more than it is, and is respected; a
 * narrowing one (`s!`, `v as unknown as string`) cannot vouch for what the
 * value's own type does not, and the fix, which keeps the wrapper, has to
 * type-check at every layer too.
 */
export const typeHoldsAtEveryLayer = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  holds: (type: ts.Type, typeChecker: ts.TypeChecker) => boolean,
): boolean => {
  const services = sourceCode.parserServices;

  const checker = services?.program?.getTypeChecker();

  if (checker === undefined) {
    return false;
  }

  return typeWrapperLayers(node).every((layer) => {
    const tsNode = services?.esTreeNodeToTSNodeMap?.get(layer);

    return (
      tsNode !== undefined && holds(checker.getTypeAtLocation(tsNode), checker)
    );
  });
};
