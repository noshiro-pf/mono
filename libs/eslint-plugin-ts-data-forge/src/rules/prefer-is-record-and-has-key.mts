import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildNamedImportFix,
  getArgumentText,
  getImportDeclarations,
  getNamedImports,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import * as ts from 'typescript';
import { isIdentifierNamed, typeHoldsAtEveryLayer } from './ast-utils.mjs';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

type Options = readonly [];

type MessageIds = 'useIsRecordAndHasKey' | 'useHasKey';

export const preferIsRecordAndHasKey: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'suggestion',
      docs: {
        description:
          'Replace `Object.hasOwn(obj, key)` or `key in obj` with `isRecord(obj) && hasKey(obj, key)` from ts-data-forge',
      },
      fixable: 'code',
      schema: [],
      messages: {
        useIsRecordAndHasKey:
          'Replace `{{original}}` with `isRecord({{objName}}) && hasKey({{objName}}, {{keyName}})` from ts-data-forge.',
        useHasKey:
          'Replace `{{original}}` with `hasKey({{objName}}, {{keyName}})` from ts-data-forge.',
      },
    },

    create: (context) => {
      const sourceCode = context.sourceCode;

      const program = sourceCode.ast;

      const tsDataForgeImports = getImportDeclarations(
        program,
        TS_DATA_FORGE_MODULE,
      );

      /**
       * Whether the `isRecord(...)` half of the rewrite would be dead code
       * because the object already satisfies `hasKey`'s
       * `R extends UnknownRecord` constraint, at every layer of type
       * wrappers: an array cast to a record is still rejected by `isRecord`,
       * and a record widened to one that may be an array is the author saying
       * it may need the guard. Without type information nothing is known, so
       * the guard is kept.
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
          const namedImports = getNamedImports(tsDataForgeImports);

          const rewrites = mut_nodesToFix.map((entry) => {
            // A record-typed object makes the `isRecord(...)` conjunct always
            // true, so it is left out of the replacement entirely.
            const needsIsRecord = !isKnownRecord(entry.objExpression);

            return {
              ...entry,
              needsIsRecord,
              // `isRecord(obj) && hasKey(obj, key)` evaluates `obj` twice.
              fixable: !needsIsRecord || isSideEffectFree(entry.objExpression),
            };
          });

          const fixableRewrites = rewrites.filter(({ fixable }) => fixable);

          const importsToAdd: readonly string[] = Arr.isEmpty(fixableRewrites)
            ? []
            : [
                ...(fixableRewrites.some(
                  ({ needsIsRecord }) => needsIsRecord,
                ) && !namedImports.includes('isRecord')
                  ? ['isRecord']
                  : []),
                ...(namedImports.includes('hasKey') ? [] : ['hasKey']),
              ];

          const importCarrier = fixableRewrites[0];

          for (const rewrite of rewrites) {
            const { node, objExpression, keyExpression, needsIsRecord } =
              rewrite;

            const objText = getArgumentText(sourceCode, objExpression);

            const keyText = getArgumentText(sourceCode, keyExpression);

            const originalText = sourceCode.getText(node);

            context.report({
              node,
              messageId: needsIsRecord ? 'useIsRecordAndHasKey' : 'useHasKey',
              data: {
                original: originalText,
                objName: objText,
                keyName: keyText,
              },
              fix: !rewrite.fixable
                ? undefined
                : (fixer) => {
                    const replacement = needsIsRecord
                      ? `(isRecord(${objText}) && hasKey(${objText}, ${keyText}))`
                      : `hasKey(${objText}, ${keyText})`;

                    // All import fixes have to live on the first fixable
                    // report: `insertTextBefore(program, …)` produces
                    // overlapping ranges otherwise and only one of them would
                    // survive a pass.
                    const importFixes =
                      rewrite === importCarrier && importsToAdd.length > 0
                        ? buildNamedImportFix(
                            fixer,
                            program,
                            TS_DATA_FORGE_MODULE,
                            importsToAdd,
                          )
                        : [];

                    return [
                      ...importFixes,
                      fixer.replaceText(node, replacement),
                    ];
                  },
            });
          }
        },
      };
    },
    defaultOptions: [],
  } as const;

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
      Arr.isEmpty(checker.getSignaturesOfType(type, ts.SignatureKind.Call)) &&
      Arr.isEmpty(
        checker.getSignaturesOfType(type, ts.SignatureKind.Construct),
      ) &&
      !checker.isArrayType(type) &&
      !checker.isTupleType(type);
