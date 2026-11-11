import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import * as ts from 'typescript';
import { bindValueImportsAt, type EquivalentModule } from '../imports.mjs';
import { getArgumentText } from '../parentheses.mjs';
import {
  isIdentifierNamed,
  skipTypeWrappers,
  typeHoldsAtEveryLayer,
} from '../type-wrappers.mjs';
import { builtBy } from './rule-factory.mjs';

/**
 * Builds a rule that replaces `Object.hasOwn(obj, key)` and `key in obj` with
 * `isRecord(obj) && hasKey(obj, key)` imported from `moduleName`, or with
 * `hasKey(obj, key)` alone when `obj` is already a record.
 *
 * `key in obj` is fixed only on an object type literal or a mapped type with a
 * string index signature; anywhere else the rewrite is a suggestion, because
 * `hasKey` checks own properties where `in` walks the prototype chain
 * (`'then' in promise`, `'size' in map`, a class method) and `isRecord` rejects
 * the functions `in` accepts.
 */
export const createPreferIsRecordAndHasKey = ({
  moduleName,
  equivalentModules = [],
}: Readonly<{
  /** The module that exports `isRecord` and `hasKey`. */
  moduleName: string;
  /**
   * Modules that export some of its exports as the same declarations; an
   * import of one of them from there is reused rather than refused.
   */
  equivalentModules?: readonly EquivalentModule[];
}>): TSESLint.RuleModule<
  | 'useIsRecordAndHasKey'
  | 'useHasKey'
  | 'inReadsPrototypeChain'
  | 'suggestOwnPropertyCheck'
  | 'hasOwnAcceptsFunctions'
  | 'suggestRecordCheck',
  readonly []
> =>
  builtBy(createPreferIsRecordAndHasKey, {
    meta: {
      type: 'suggestion',
      docs: {
        description: `Replace \`Object.hasOwn(obj, key)\` or \`key in obj\` with \`isRecord(obj) && hasKey(obj, key)\` from ${moduleName}`,
      },
      fixable: 'code',
      hasSuggestions: true,
      schema: [],
      messages: {
        useIsRecordAndHasKey: `Replace \`{{original}}\` with \`{{replacement}}\` from ${moduleName}.`,
        useHasKey: `Replace \`{{original}}\` with \`{{replacement}}\` from ${moduleName}.`,
        inReadsPrototypeChain: `\`{{original}}\` also finds keys on the prototype chain (a Promise's \`then\`, a Map's \`size\`, a class method) and on functions; \`{{replacement}}\` from ${moduleName} checks own properties of a non-function object only. Replace it where that is what is meant.`,
        suggestOwnPropertyCheck: `Replace with \`{{replacement}}\` from ${moduleName}, which checks own properties only.`,
        hasOwnAcceptsFunctions: `\`{{original}}\` answers for a function's own properties too (its \`name\`, a class's static members), and nothing here says the object is not one; \`{{replacement}}\` from ${moduleName} answers \`false\` for every function. Replace it where that is what is meant.`,
        suggestRecordCheck: `Replace with \`{{replacement}}\` from ${moduleName}, which answers \`false\` for a function.`,
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
       * Whether the object, already known to be a record, is a plain object
       * type at every layer, so that it has no methods of its own on a
       * prototype for `in` to find. The members of `Object.prototype` are the
       * one difference left between `in` and `hasKey` there: the fix accepts it
       * for a key read at run time, and a literal key naming one
       * (`'constructor' in rec`) is left to a suggestion.
       */
      const isPlainObject = (
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        expression: TSESTree.Expression,
      ): boolean =>
        typeHoldsAtEveryLayer(sourceCode, expression, isPlainObjectType);

      /**
       * Whether type information shows the object is not callable at any layer
       * of type wrappers. `isRecord` rejects a function, which `Object.hasOwn`
       * accepts (`Object.hasOwn(fn, 'name')` is `true`), so the rewrite with
       * `isRecord` is fixed only then. Without type information nothing is
       * known.
       */
      const cannotBeCallable = (
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        expression: TSESTree.Expression,
      ): boolean =>
        typeHoldsAtEveryLayer(sourceCode, expression, (type, checker) =>
          isNonCallableType(checker, type),
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
        /**
         * Whether the node is `key in obj`, which reads the prototype chain
         * that `hasKey` does not.
         */
        isIn: boolean;
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
            isIn: false,
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
            isIn: true,
            objExpression,
            keyExpression,
          });
        },

        'Program:exit': () => {
          if (mut_nodesToFix.length === 0) {
            return;
          }

          // Bound once for each shape of rewrite: a file may import `hasKey`
          // but not `isRecord`, which only the rewrites that need it add.
          const withIsRecordAt = bindValueImportsAt(
            sourceCode,
            moduleName,
            ['isRecord', 'hasKey'],
            equivalentModules,
          );

          const hasKeyOnlyAt = bindValueImportsAt(
            sourceCode,
            moduleName,
            ['hasKey'],
            equivalentModules,
          );

          for (const {
            node,
            isIn,
            objExpression,
            keyExpression,
          } of mut_nodesToFix) {
            // A record-typed object makes the `isRecord(...)` conjunct always
            // true, so it is left out of the replacement entirely.
            const needsIsRecord = !isKnownRecord(objExpression);

            const binding = (needsIsRecord ? withIsRecordAt : hasKeyOnlyAt)(
              node,
            );

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
              (!needsIsRecord || isSideEffectFree(objExpression));

            const hasKeyCall =
              `${hasKeyName ?? 'hasKey'}(${objText}, ${keyText})` as const;

            const replacement = needsIsRecord
              ? (`${isRecordName ?? 'isRecord'}(${objText}) && ${hasKeyCall}` as const)
              : hasKeyCall;

            const data = {
              original: sourceCode.getText(node),
              replacement,
            } as const;

            const fix: TSESLint.ReportFixFunction | null = fixable
              ? (fixer) =>
                  [
                    ...binding.edits(fixer),
                    fixer.replaceText(
                      node,
                      needsIsRecord ? `(${replacement})` : replacement,
                    ),
                  ] as const
              : null;

            // Off a plain record the object may be a class instance, a
            // built-in or a function, and the rewrite is the author's
            // decision.
            const inSuggestOnly =
              isIn &&
              (needsIsRecord ||
                !isPlainObject(objExpression) ||
                namesObjectPrototypeMember(keyExpression));

            // `Object.hasOwn` accepts a function, and `isRecord` does not.
            const hasOwnSuggestOnly =
              !isIn && needsIsRecord && !cannotBeCallable(objExpression);

            const suggestOnly = inSuggestOnly || hasOwnSuggestOnly;

            context.report({
              node,
              messageId: inSuggestOnly
                ? 'inReadsPrototypeChain'
                : hasOwnSuggestOnly
                  ? 'hasOwnAcceptsFunctions'
                  : needsIsRecord
                    ? 'useIsRecordAndHasKey'
                    : 'useHasKey',
              data,
              fix: suggestOnly ? null : fix,
              suggest:
                suggestOnly && fix !== null
                  ? [
                      {
                        messageId: inSuggestOnly
                          ? 'suggestOwnPropertyCheck'
                          : 'suggestRecordCheck',
                        data,
                        fix,
                      },
                    ]
                  : [],
            });
          }
        },
      };
    },
  });

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

const objectPrototypeMembers: ReadonlySet<string> = new Set(
  Object.getOwnPropertyNames(Object.prototype),
);

/**
 * Whether `key` is a string literal naming a member of `Object.prototype`,
 * which `in` finds on every object and `hasKey` on none that does not own it.
 */
const namesObjectPrototypeMember = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  wrapped: TSESTree.Expression,
): boolean => {
  const key = skipTypeWrappers(wrapped);

  return (
    key.type === AST_NODE_TYPES.Literal &&
    typeof key.value === 'string' &&
    objectPrototypeMembers.has(key.value)
  );
};

/**
 * Whether every member of `type` is an object type literal, an object literal
 * or a mapped type (`Record<string, V>`) none of whose properties a class or an
 * interface declares. A class, an interface, a type parameter, or a mapped type
 * over one of them (`Readonly<Bag>`) may stand for an instance whose methods
 * live on a prototype, so it is not counted.
 */
const isPlainObjectType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean =>
  type.isUnionOrIntersection()
    ? type.types.every((member) => isPlainObjectType(member, checker))
    : (type.flags & ts.TypeFlags.Object) !== 0 &&
      ((type.getSymbol()?.flags ?? 0) &
        (ts.SymbolFlags.TypeLiteral | ts.SymbolFlags.ObjectLiteral)) !==
        0 &&
      checker
        .getPropertiesOfType(type)
        .every(
          (property) =>
            property.declarations?.every(
              (declaration) =>
                !ts.isClassLike(declaration.parent) &&
                !ts.isInterfaceDeclaration(declaration.parent),
            ) ?? true,
        );

/**
 * Whether no value of `type` can be a function: no member of a union or an
 * intersection has a call or construct signature, or is `Function`, `object`,
 * `unknown` or `any`, which a function satisfies; and the constraint of a
 * deferred type is such a type (an unconstrained one is `unknown`).
 */
const isNonCallableType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
): boolean => {
  if (type.isUnionOrIntersection()) {
    return type.types.every((member) => isNonCallableType(checker, member));
  }

  if (
    (type.flags &
      (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.NonPrimitive)) !==
    0
  ) {
    return false;
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

    return constraint !== undefined && isNonCallableType(checker, constraint);
  }

  return (
    checker.getSignaturesOfType(type, ts.SignatureKind.Call).length === 0 &&
    checker.getSignaturesOfType(type, ts.SignatureKind.Construct).length ===
      0 &&
    !FUNCTION_TYPE_NAMES.has(type.getSymbol()?.getName() ?? '')
  );
};

/** The global interfaces every function satisfies. */
const FUNCTION_TYPE_NAMES: ReadonlySet<string> = new Set<string>([
  'Function',
  'CallableFunction',
  'NewableFunction',
]);

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
