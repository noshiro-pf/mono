import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { typeHoldsAtEveryLayer } from 'eslint-rule-forge';
import { unionTypeParts } from 'tsutils';
import * as ts from 'typescript';

/**
 * Whether `operand` is a boolean at every layer of its type wrappers (every
 * member of a union boolean-like): the rename of a truthiness assertion
 * (`assert.ok(X)`, `assert.isNotOk(X)`, a negation under `assert.isTrue`) to a
 * strict-boolean one is written only then. `assert.ok(X)` passes for any truthy
 * `X` and `assert.isTrue(X)` for `true` alone, so on any other operand the
 * rename makes a passing test fail, or one that does not compile. A widening
 * `as` is the author saying the value may not be one, and a narrowing one
 * (`u as boolean` on an `unknown`) does not make it one. Without type
 * information (another parser, or no project) no operand is one, which costs a
 * fix (for the negation rules, the report), never a wrong one; so does a type parameter bounded by `boolean` or a
 * branded boolean, which is not recognized.
 */
export const isBooleanOperand = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- typescript-eslint's source code cannot be deeply readonly
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- the parser services map takes a mutable node
  operand: TSESTree.CallExpressionArgument,
): boolean =>
  operand.type !== AST_NODE_TYPES.SpreadElement &&
  typeHoldsAtEveryLayer(sourceCode, operand, (type) =>
    unionTypeParts(type).every(
      (part) => (part.flags & ts.TypeFlags.BooleanLike) !== 0,
    ),
  );
