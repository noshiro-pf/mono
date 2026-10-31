import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { getArgumentText, skipTypeWrappers } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import { tsDataForgeValueAt } from './import-binding.mjs';

type Options = readonly [];

type MessageIds = 'useRangeForLoop';

export const preferRangeForLoop: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `for (let i = begin; i < end; ++i)` with `for (const i of range(begin, end))` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useRangeForLoop:
        'Replace with `for (const {{varName}} of range({{begin}}, {{end}}))` from ts-data-forge.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    /**
     * Whether `node` is the same value on every iteration: a literal, or a
     * variable that is never reassigned anywhere (not only in the loop, since a
     * function the loop calls could reassign it). The loop reads its end and
     * its step on every iteration, and `range` reads them once.
     */
    const isStableBound = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      wrapped: TSESTree.Node,
    ): boolean => {
      const node = skipTypeWrappers(wrapped);

      if (node.type === AST_NODE_TYPES.Literal) {
        return true;
      }

      if (node.type !== AST_NODE_TYPES.Identifier) {
        return false;
      }

      const variable = ASTUtils.findVariable(
        sourceCode.getScope(node),
        node.name,
      );

      return (
        variable !== null &&
        variable.defs.length > 0 &&
        variable.references.every(
          (reference) => !reference.isWrite() || reference.init === true,
        )
      );
    };

    const mut_nodesToFix: {
      node: TSESTree.ForStatement;
      varName: string;
      begin: string;
      end: string;
      step?: string;
      fixable: boolean;
    }[] = [];

    return {
      ForStatement: (node) => {
        // Check init: let i = begin
        if (
          node.init?.type !== AST_NODE_TYPES.VariableDeclaration ||
          node.init.kind !== 'let' ||
          !Arr.isFixedLengthTuple(1, node.init.declarations)
        ) {
          return;
        }

        const declaration = node.init.declarations[0];

        if (
          declaration.id.type !== AST_NODE_TYPES.Identifier ||
          declaration.init === null
        ) {
          return;
        }

        const varName = declaration.id.name;

        const beginExpr = declaration.init;

        // `range` takes safe integers only.
        if (isNonIntegerNumberLiteral(beginExpr)) {
          return;
        }

        // Check test: i < end. The loop variable and the step are read through
        // type wrappers: `(i satisfies number) < n` tests `i`, and
        // `i += 0 as number` still steps by 0.
        if (
          node.test?.type !== AST_NODE_TYPES.BinaryExpression ||
          node.test.operator !== '<'
        ) {
          return;
        }

        const testedVariable = skipTypeWrappers(node.test.left);

        if (
          testedVariable.type !== AST_NODE_TYPES.Identifier ||
          testedVariable.name !== varName
        ) {
          return;
        }

        const endExpr = node.test.right;

        // Check update: ++i, i++, i += 1, or i += step
        if (node.update === null) {
          return;
        }

        let mut_step: string | undefined;

        if (node.update.type === AST_NODE_TYPES.UpdateExpression) {
          // ++i or i++
          if (
            node.update.operator === '++' &&
            node.update.argument.type === AST_NODE_TYPES.Identifier &&
            node.update.argument.name === varName
          ) {
            mut_step = undefined; // step defaults to 1
          } else {
            return;
          }
        } else if (
          node.update.type === AST_NODE_TYPES.AssignmentExpression &&
          node.update.operator === '+=' &&
          node.update.left.type === AST_NODE_TYPES.Identifier &&
          node.update.left.name === varName
        ) {
          // i += step
          const stepValue = skipTypeWrappers(node.update.right);

          if (stepValue.type === AST_NODE_TYPES.Literal) {
            const stepNum = stepValue.value;

            // Only support positive integer steps
            if (
              typeof stepNum === 'number' &&
              Number.isSafeInteger(stepNum) &&
              stepNum > 0
            ) {
              mut_step = stepNum === 1 ? undefined : stepNum.toString();
            } else {
              return;
            }
          } else if (isNegatedLiteral(stepValue)) {
            // `i += -1` under `i < end` never gets there, and `range` with a
            // negative step yields nothing: no fix that type-checks would keep
            // that.
            return;
          } else {
            // Variable step like i += step. Its type is left to the type
            // checker: a step that is not a non-zero safe integer makes the
            // fixed `range(...)` call fail to type-check.
            mut_step = getArgumentText(sourceCode, node.update.right);
          }
        } else {
          return;
        }

        // `const i` would not take an assignment anywhere but the update.
        if (isAssignedOutsideUpdate(sourceCode, declaration, node.update)) {
          return;
        }

        const beginText = getArgumentText(sourceCode, beginExpr);

        const endText = getArgumentText(sourceCode, endExpr);

        mut_nodesToFix.push({
          node,
          varName,
          begin: beginText,
          end: endText,
          step: mut_step,
          fixable:
            isStableBound(endExpr) &&
            (node.update.type !== AST_NODE_TYPES.AssignmentExpression ||
              isStableBound(node.update.right)),
        });
      },
      'Program:exit': () => {
        const rangeAt = tsDataForgeValueAt(sourceCode, 'range');

        for (const entry of mut_nodesToFix) {
          const { node, varName, begin, end, step } = entry;

          const range = entry.fixable ? rangeAt(node) : undefined;

          context.report({
            node: node.init ?? node,
            messageId: 'useRangeForLoop',
            data: {
              varName,
              begin,
              end,
            },
            fix:
              range === undefined
                ? undefined
                : (fixer) => {
                    const bodyText = sourceCode.getText(node.body);

                    const rangeArgs =
                      step === undefined
                        ? `${begin}, ${end}`
                        : `${begin}, ${end}, ${step}`;

                    const replacement = `for (const ${varName} of ${range.localName}(${rangeArgs})) ${bodyText}`;

                    return [
                      ...range.edits(fixer),
                      fixer.replaceText(node, replacement),
                    ];
                  },
          });
        }
      },
    };
  },
} as const;

const isNegatedLiteral = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean =>
  node.type === AST_NODE_TYPES.UnaryExpression &&
  node.operator === '-' &&
  skipTypeWrappers(node.argument).type === AST_NODE_TYPES.Literal;

const isNonIntegerNumberLiteral = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  wrapped: TSESTree.Node,
): boolean => {
  const node = skipTypeWrappers(wrapped);

  return (
    node.type === AST_NODE_TYPES.Literal &&
    typeof node.value === 'number' &&
    !Number.isSafeInteger(node.value)
  );
};

const isWithin = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  container: TSESTree.Node,
): boolean =>
  container.range[0] <= node.range[0] && node.range[1] <= container.range[1];

/**
 * Whether the loop variable declared by `declaration` is written anywhere but
 * its initializer and the loop's `update`.
 */
const isAssignedOutsideUpdate = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  declaration: TSESTree.VariableDeclarator,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  update: TSESTree.Expression,
): boolean =>
  sourceCode
    .getDeclaredVariables(declaration)
    .flatMap((variable) => variable.references)
    .some(
      (reference) =>
        reference.isWrite() &&
        reference.init !== true &&
        !isWithin(reference.identifier, update),
    );
