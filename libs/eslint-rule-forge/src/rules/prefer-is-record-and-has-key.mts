import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import * as ts from 'typescript';
import { hasForeignBinding } from '../bindings.mjs';
import { bindValueImports } from '../imports.mjs';
import { getArgumentText } from '../parentheses.mjs';
import {
  isIdentifierNamed,
  skipTypeWrappers,
  typeHoldsAtEveryLayer,
} from '../type-wrappers.mjs';

/**
 * Builds a rule that replaces `Object.hasOwn(obj, key)` and `key in obj` with
 * `isRecord(obj) && hasKey(obj, key)` imported from `moduleName`, or with
 * `hasKey(obj, key)` alone when `obj` is already a record.
 */
export const createPreferIsRecordAndHasKey = ({
  moduleName,
}: Readonly<{
  /** The module that exports `isRecord` and `hasKey`. */
  moduleName: string;
}>): TSESLint.RuleModule<'useIsRecordAndHasKey' | 'useHasKey', readonly []> =>
  ({
    meta: {
      type: 'suggestion',
      docs: {
        description: `Replace \`Object.hasOwn(obj, key)\` or \`key in obj\` with \`isRecord(obj) && hasKey(obj, key)\` from ${moduleName}`,
      },
      fixable: 'code',
      schema: [],
      messages: {
        useIsRecordAndHasKey: `Replace \`{{original}}\` with \`isRecord({{objName}}) && hasKey({{objName}}, {{keyName}})\` from ${moduleName}.`,
        useHasKey: `Replace \`{{original}}\` with \`hasKey({{objName}}, {{keyName}})\` from ${moduleName}.`,
      },
      defaultOptions: [],
    },

    create: (context) => {
      const sourceCode = context.sourceCode;

      /**
       * Whether the `isRecord(...)` half of the rewrite would be dead code
       * because the object already satisfies `hasKey`'s
       * `R extends UnknownRecord` constraint, at every layer of type wrappers:
       * an array cast to a record is still rejected by `isRecord`, and a record
       * widened to one that may be an array is the author saying it may need
       * the guard. Without type information nothing is known, so the guard is
       * kept.
       */
      const isKnownRecord = (
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        expression: TSESTree.Expression,
      ): boolean =>
        typeHoldsAtEveryLayer(sourceCode, expression, (type, checker) =>
          isAlreadyRecordType(checker, type),
        );

      /**
       * Whether the object may be an array at some layer of type wrappers.
       * `isRecord` rejects an array, so `'0' in xs` would turn from `true` to
       * `false`; a widening cast to a type that may be an array is the author
       * saying it may be one. Without type information nothing is known, and
       * the rule reports as it always has.
       */
      const mayBeArray = (
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        expression: TSESTree.Expression,
      ): boolean =>
        sourceCode.parserServices?.program != null &&
        !typeHoldsAtEveryLayer(
          sourceCode,
          expression,
          (type, checker) => !mayBeArrayType(checker, type),
        );

      const mut_nodesToFix: {
        node: TSESTree.CallExpression | TSESTree.BinaryExpression;
        objExpression: TSESTree.Expression;
        keyExpression: TSESTree.Expression;
      }[] = [];

      return {
        // Handle Object.hasOwn(obj, key)
        CallExpression: (node) => {
          const callee = skipTypeWrappers(node.callee);

          if (
            callee.type !== AST_NODE_TYPES.MemberExpression ||
            !isIdentifierNamed(callee.object, 'Object') ||
            callee.property.type !== AST_NODE_TYPES.Identifier ||
            callee.property.name !== 'hasOwn'
          ) {
            return;
          }

          // Check arguments: Object.hasOwn(obj, key)
          if (node.arguments.length !== 2) {
            return;
          }

          const objArg = node.arguments[0];

          const keyArg = node.arguments[1];

          if (objArg === undefined || keyArg === undefined) {
            return;
          }

          // Type guard: ensure arguments are Expressions (not SpreadElement)
          if (
            objArg.type === AST_NODE_TYPES.SpreadElement ||
            keyArg.type === AST_NODE_TYPES.SpreadElement ||
            mayBeArray(objArg)
          ) {
            return;
          }

          mut_nodesToFix.push({
            node,
            objExpression: objArg,
            keyExpression: keyArg,
          });
        },

        // Handle key in obj
        BinaryExpression: (node) => {
          if (node.operator !== 'in') {
            return;
          }

          const keyExpression = node.left;

          const objExpression = node.right;

          // Type guard: ensure keyExpression is Expression (not PrivateIdentifier)
          if (
            keyExpression.type === AST_NODE_TYPES.PrivateIdentifier ||
            mayBeArray(objExpression)
          ) {
            return;
          }

          mut_nodesToFix.push({
            node,
            objExpression,
            keyExpression,
          });
        },

        'Program:exit': () => {
          // Bound once for each shape of rewrite: a file may import `hasKey`
          // but not `isRecord`, which only the rewrites that need it add.
          const withIsRecord = bindValueImports(sourceCode, moduleName, [
            'isRecord',
            'hasKey',
          ]);

          const hasKeyOnly = bindValueImports(sourceCode, moduleName, [
            'hasKey',
          ]);

          for (const { node, objExpression, keyExpression } of mut_nodesToFix) {
            // A record-typed object makes the `isRecord(...)` conjunct always
            // true, so it is left out of the replacement entirely.
            const needsIsRecord = !isKnownRecord(objExpression);

            const binding = needsIsRecord ? withIsRecord : hasKeyOnly;

            const hasKeyName = binding?.localNames.at(-1);

            const isRecordName = needsIsRecord
              ? binding?.localNames[0]
              : undefined;

            const objText = getArgumentText(sourceCode, objExpression);

            const keyText = getArgumentText(sourceCode, keyExpression);

            const fixable =
              binding !== undefined &&
              hasKeyName !== undefined &&
              (!needsIsRecord || isRecordName !== undefined) &&
              // `isRecord(obj) && hasKey(obj, key)` evaluates `obj` twice.
              (!needsIsRecord || isSideEffectFree(objExpression)) &&
              binding.localNames.every(
                (name) =>
                  !hasForeignBinding(sourceCode, node, name, moduleName),
              );

            context.report({
              node,
              messageId: needsIsRecord ? 'useIsRecordAndHasKey' : 'useHasKey',
              data: {
                original: sourceCode.getText(node),
                objName: objText,
                keyName: keyText,
              },
              fix: fixable
                ? (fixer) => [
                    ...binding.edits(fixer),
                    fixer.replaceText(
                      node,
                      needsIsRecord
                        ? `(${isRecordName}(${objText}) && ${hasKeyName}(${objText}, ${keyText}))`
                        : `${hasKeyName}(${objText}, ${keyText})`,
                    ),
                  ]
                : null,
            });
          }
        },
      };
    },
  }) as const;

/**
 * Whether reading `node` again has no side effects: a variable, `this`, or a
 * non-computed property chain on one, type wrappers aside.
 */
const isSideEffectFree = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  wrapped: TSESTree.Node,
): boolean => {
  const node = skipTypeWrappers(wrapped);

  return (
    node.type === AST_NODE_TYPES.Identifier ||
    node.type === AST_NODE_TYPES.ThisExpression ||
    (node.type === AST_NODE_TYPES.MemberExpression &&
      !node.computed &&
      isSideEffectFree(node.object))
  );
};

/**
 * Whether a value of `type` may be an array or a tuple: some member of a union
 * or an intersection is one, or the constraint of a deferred type is.
 * `object` and `unknown` say nothing either way and are not counted.
 */
const mayBeArrayType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
): boolean => {
  if (type.isUnionOrIntersection()) {
    return type.types.some((member) => mayBeArrayType(checker, member));
  }

  if (
    (type.flags &
      (ts.TypeFlags.TypeParameter |
        ts.TypeFlags.IndexedAccess |
        ts.TypeFlags.Conditional |
        ts.TypeFlags.Substitution)) !==
    0
  ) {
    const constraint = checker.getBaseConstraintOfType(type);

    return constraint !== undefined && mayBeArrayType(checker, constraint);
  }

  return checker.isArrayType(type) || checker.isTupleType(type);
};

/**
 * Whether `type` already satisfies `hasKey`'s `R extends UnknownRecord`
 * constraint, so that guarding the call with `isRecord` adds nothing.
 *
 * `UnknownRecord` is `ReadonlyRecord<string, unknown>`, so a string index
 * signature is exactly what it asks for and its value type is `unknown`, which
 * anything satisfies. Callables and arrays are excluded because `isRecord`
 * rejects them at runtime (`typeof fn === 'object'` is false, `Array.isArray`
 * is true), so dropping the guard there would change behavior.
 *
 * Deliberately conservative: a type TypeScript would accept through an
 * *implicit* index signature (an object type alias without one of its own)
 * keeps the guard, because the checker does not report such a signature here.
 */
const isAlreadyRecordType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
): boolean =>
  type.isUnion()
    ? type.types.every((member) => isAlreadyRecordType(checker, member))
    : checker.getIndexInfoOfType(type, ts.IndexKind.String) !== undefined &&
      checker.getSignaturesOfType(type, ts.SignatureKind.Call).length === 0 &&
      checker.getSignaturesOfType(type, ts.SignatureKind.Construct).length ===
        0 &&
      !checker.isArrayType(type) &&
      !checker.isTupleType(type);
