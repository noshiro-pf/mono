import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import * as ts from 'typescript';
import {
  buildImportFixes,
  getNamedImports,
  getTsDataForgeImport,
} from './import-utils.mjs';

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

      const tsDataForgeImport = getTsDataForgeImport(program);

      const services = sourceCode.parserServices;

      const checker = services?.program?.getTypeChecker();

      /**
       * Whether the `isRecord(...)` half of the rewrite would be dead code
       * because the object already satisfies `hasKey`'s
       * `R extends UnknownRecord` constraint. Without type information nothing
       * is known, so the guard is kept.
       */
      const isKnownRecord = (
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        expression: TSESTree.Expression,
      ): boolean => {
        if (checker === undefined) return false;

        const tsNode = services?.esTreeNodeToTSNodeMap?.get(expression);

        return (
          tsNode !== undefined &&
          isAlreadyRecordType(checker, checker.getTypeAtLocation(tsNode))
        );
      };

      const mut_nodesToFix: {
        node: TSESTree.CallExpression | TSESTree.BinaryExpression;
        objExpression: TSESTree.Expression;
        keyExpression: TSESTree.Expression;
      }[] = [];

      return {
        // Handle Object.hasOwn(obj, key)
        CallExpression: (node) => {
          if (
            node.callee.type !== AST_NODE_TYPES.MemberExpression ||
            node.callee.object.type !== AST_NODE_TYPES.Identifier ||
            node.callee.object.name !== 'Object' ||
            node.callee.property.type !== AST_NODE_TYPES.Identifier ||
            node.callee.property.name !== 'hasOwn'
          ) {
            return;
          }

          // Check arguments: Object.hasOwn(obj, key)
          if (node.arguments.length !== 2) return;

          const objArg = node.arguments[0];

          const keyArg = node.arguments[1];

          if (objArg === undefined || keyArg === undefined) return;

          // Type guard: ensure arguments are Expressions (not SpreadElement)
          if (
            objArg.type === AST_NODE_TYPES.SpreadElement ||
            keyArg.type === AST_NODE_TYPES.SpreadElement
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
          if (node.operator !== 'in') return;

          const keyExpression = node.left;

          const objExpression = node.right;

          // Type guard: ensure keyExpression is Expression (not PrivateIdentifier)
          if (keyExpression.type === AST_NODE_TYPES.PrivateIdentifier) return;

          mut_nodesToFix.push({
            node,
            objExpression,
            keyExpression,
          });
        },

        'Program:exit': () => {
          const namedImports = getNamedImports(tsDataForgeImport);

          const rewrites = mut_nodesToFix.map((entry) => ({
            ...entry,
            // A record-typed object makes the `isRecord(...)` conjunct always
            // true, so it is left out of the replacement entirely.
            needsIsRecord: !isKnownRecord(entry.objExpression),
          }));

          const importsToAdd: readonly string[] = [
            ...(rewrites.some(({ needsIsRecord }) => needsIsRecord) &&
            !namedImports.includes('isRecord')
              ? ['isRecord']
              : []),
            ...(namedImports.includes('hasKey') ? [] : ['hasKey']),
          ];

          for (const [
            index,
            { node, objExpression, keyExpression, needsIsRecord },
          ] of rewrites.entries()) {
            const objText = sourceCode.getText(objExpression);

            const keyText = sourceCode.getText(keyExpression);

            const originalText = sourceCode.getText(node);

            context.report({
              node,
              messageId: needsIsRecord ? 'useIsRecordAndHasKey' : 'useHasKey',
              data: {
                original: originalText,
                objName: objText,
                keyName: keyText,
              },
              fix: (fixer) => {
                const replacement = needsIsRecord
                  ? `(isRecord(${objText}) && hasKey(${objText}, ${keyText}))`
                  : `hasKey(${objText}, ${keyText})`;

                // All import fixes have to live on the first report:
                // `insertTextBefore(program, …)` produces overlapping ranges
                // otherwise and only one of them would survive a pass.
                const importFixes =
                  index === 0 && importsToAdd.length > 0
                    ? buildImportFixes(
                        fixer,
                        program,
                        tsDataForgeImport,
                        importsToAdd,
                      )
                    : [];

                return [...importFixes, fixer.replaceText(node, replacement)];
              },
            });
          }
        },
      };
    },
    defaultOptions: [],
  } as const;

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
