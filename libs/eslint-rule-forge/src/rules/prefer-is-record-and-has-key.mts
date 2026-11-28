import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import * as ts from 'typescript';
import { isRuntimeBound } from '../bindings.mjs';
import {
  bindValueImportsAt,
  type EquivalentModule,
  type NamespaceSubpath,
} from '../imports.mjs';
import { getArgumentText } from '../parentheses.mjs';
import {
  isIdentifierNamed,
  skipTypeWrappers,
  typeHoldsAtEveryLayer,
  typeHoldsAtSomeLayer,
} from '../type-wrappers.mjs';
import { builtBy } from './rule-factory.mjs';

/**
 * Builds a rule that replaces `Object.hasOwn(obj, key)` and `key in obj` with
 * `isRecord(obj) && hasKey(obj, key)` imported from `moduleName`, or with
 * `hasKey(obj, key)` alone when `obj` is already a record, and
 * `Reflect.has(obj, key)` on a plain record with `hasKey(obj, key)`.
 *
 * `key in obj` is fixed only on an object type literal or a mapped type with a
 * string index signature; anywhere else the rewrite is a suggestion, because
 * `hasKey` checks own properties where `in` walks the prototype chain
 * (`'then' in promise`, `'size' in map`, a class method) and `isRecord` rejects
 * the functions `in` accepts.
 *
 * `Reflect.has(obj, key)`, which answers as `key in obj` does, is reported only
 * on a plain record, and fixed or suggested there as `key in obj` is; anywhere
 * else reading the prototype chain is what it is for.
 */
export const createPreferIsRecordAndHasKey = ({
  moduleName,
  equivalentModules = [],
  namespaceSubpaths = [],
}: Readonly<{
  /** The module that exports `isRecord` and `hasKey`. */
  moduleName: string;
  /**
   * Modules that export some of its exports as the same declarations; an
   * import of one of them from there is reused rather than refused.
   */
  equivalentModules?: readonly EquivalentModule[];
  /**
   * Exports of the module that are also the namespace of a module of their own
   * (`import * as Arr from 'ts-data-forge/array'`), which bind what the
   * module's own import does.
   */
  namespaceSubpaths?: readonly NamespaceSubpath[];
}>): TSESLint.RuleModule<
  | 'useIsRecordAndHasKey'
  | 'useHasKey'
  | 'inReadsPrototypeChain'
  | 'suggestOwnPropertyCheck'
  | 'hasOwnAcceptsFunctions'
  | 'suggestRecordCheck'
  | 'wideKeyNarrowsToNever'
  | 'suggestHasKeyForWideKey',
  readonly []
> =>
  builtBy(createPreferIsRecordAndHasKey, {
    meta: {
      type: 'suggestion',
      docs: {
        description: `Replace \`Object.hasOwn(obj, key)\` or \`key in obj\` with \`isRecord(obj) && hasKey(obj, key)\`, and \`Reflect.has(obj, key)\` on a plain record with \`hasKey(obj, key)\`, from ${moduleName}`,
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
        wideKeyNarrowsToNever: `\`{{original}}\` narrows nothing; \`{{replacement}}\` from ${moduleName} narrows the record to \`never\` where it answers \`false\`, since the key is not one literal or a union of them, so code there that reads or writes the record may stop compiling. Replace it where that is what is meant.`,
        suggestHasKeyForWideKey: `Replace with \`{{replacement}}\` from ${moduleName}, which narrows the record to \`never\` where it answers \`false\`.`,
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
       * Whether the key is a literal or a union of literals — strings, numbers
       * or unique symbols — by its type at every layer of type wrappers, or,
       * without type information, written as a string or a template literal
       * with no substitution. `hasKey` checks each literal on its own, while a
       * key typed `string` or `number` covers the record's index signature.
       */
      const isLiteralKey = (
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        expression: TSESTree.Expression,
      ): boolean =>
        sourceCode.parserServices?.program == null
          ? stringLiteralValueOf(skipTypeWrappers(expression)) !== undefined
          : typeHoldsAtEveryLayer(sourceCode, expression, (type) =>
              (type.isUnion() ? type.types : [type]).every(
                (member) =>
                  member.isStringLiteral() ||
                  member.isNumberLiteral() ||
                  (member.flags & ts.TypeFlags.UniqueESSymbol) !== 0,
              ),
            );

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
         * Whether the node is `key in obj` or `Reflect.has(obj, key)`, which
         * read the prototype chain that `hasKey` does not.
         */
        readsPrototypeChain: boolean;
        objExpression: TSESTree.Expression;
        keyExpression: TSESTree.Expression;
      }[] = [];

      return {
        // Handle Object.hasOwn(obj, key) and Reflect.has(obj, key)
        CallExpression: (node) => {
          const callee = skipTypeWrappers(node.callee);

          if (
            callee.type !== AST_NODE_TYPES.MemberExpression ||
            callee.computed ||
            callee.property.type !== AST_NODE_TYPES.Identifier
          ) {
            return;
          }

          const isReflectHas =
            isIdentifierNamed(callee.object, 'Reflect') &&
            callee.property.name === 'has';

          const isObjectHasOwn =
            isIdentifierNamed(callee.object, 'Object') &&
            callee.property.name === 'hasOwn';

          const globalName = isReflectHas
            ? 'Reflect'
            : isObjectHasOwn
              ? 'Object'
              : undefined;

          // A `Reflect` or `Object` value the file binds is not the global; a
          // type of that name does not hide it.
          if (
            globalName === undefined ||
            isRuntimeBound(sourceCode, node, globalName)
          ) {
            return;
          }

          // Check arguments: Object.hasOwn(obj, key), Reflect.has(obj, key)
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
            mayBeArray(objArg) ||
            // Off a plain record, `Reflect.has` reads the prototype chain on
            // purpose. On one, it is taken at its type, as `in` is: an object
            // typed as a record that has a prototype of its own
            // (`Object.create(proto)`, a Proxy) is not told apart. Both
            // predicates run again in `Program:exit`, a second walk only for
            // the `Reflect.has` calls that reach it.
            (isReflectHas && !(isKnownRecord(objArg) && isPlainObject(objArg)))
          ) {
            return;
          }

          mut_nodesToFix.push({
            node,
            readsPrototypeChain: isReflectHas,
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
            readsPrototypeChain: true,
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
            namespaceSubpaths,
          );

          const hasKeyOnlyAt = bindValueImportsAt(
            sourceCode,
            moduleName,
            ['hasKey'],
            equivalentModules,
            namespaceSubpaths,
          );

          for (const {
            node,
            readsPrototypeChain,
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
            // decision. `Reflect.has` shares `in`'s message, since it reads the
            // same prototype chain.
            const prototypeSuggestOnly =
              readsPrototypeChain &&
              (needsIsRecord ||
                !isPlainObject(objExpression) ||
                namesObjectPrototypeMember(sourceCode, keyExpression));

            // `Object.hasOwn` accepts a function, and `isRecord` does not.
            const hasOwnSuggestOnly =
              !readsPrototypeChain &&
              needsIsRecord &&
              !cannotBeCallable(objExpression);

            // `hasKey` alone narrows the record to `never` where it answers
            // `false` for a key wider than a union of literals, which `in`,
            // `Object.hasOwn` and `Reflect.has` do not: code there that reads
            // or writes the record would stop compiling.
            const wideKeySuggestOnly =
              !needsIsRecord && !isLiteralKey(keyExpression);

            const suggestOnly =
              prototypeSuggestOnly || hasOwnSuggestOnly || wideKeySuggestOnly;

            context.report({
              node,
              messageId: prototypeSuggestOnly
                ? 'inReadsPrototypeChain'
                : hasOwnSuggestOnly
                  ? 'hasOwnAcceptsFunctions'
                  : wideKeySuggestOnly
                    ? 'wideKeyNarrowsToNever'
                    : needsIsRecord
                      ? 'useIsRecordAndHasKey'
                      : 'useHasKey',
              data,
              fix: suggestOnly ? null : fix,
              suggest:
                suggestOnly && fix !== null
                  ? [
                      {
                        messageId: prototypeSuggestOnly
                          ? 'suggestOwnPropertyCheck'
                          : hasOwnSuggestOnly
                            ? 'suggestRecordCheck'
                            : 'suggestHasKeyForWideKey',
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

/** The value of a string literal or of a template literal with no substitution. */
const stringLiteralValueOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): string | undefined =>
  node.type === AST_NODE_TYPES.Literal && typeof node.value === 'string'
    ? node.value
    : node.type === AST_NODE_TYPES.TemplateLiteral &&
        node.expressions.length === 0
      ? (node.quasis[0]?.value.cooked ?? undefined)
      : undefined;

/**
 * Whether `key` names a member of `Object.prototype`, which `in` finds on every
 * object and `hasKey` on none that does not own it: written as a string or a
 * template literal with no substitution, or typed as such a string literal, or
 * a union with one, at some layer of type wrappers (`const k = 'toString'`).
 */
const namesObjectPrototypeMember = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  wrapped: TSESTree.Expression,
): boolean => {
  const written = stringLiteralValueOf(skipTypeWrappers(wrapped));

  return (
    (written !== undefined && objectPrototypeMembers.has(written)) ||
    typeHoldsAtSomeLayer(sourceCode, wrapped, (type) =>
      (type.isUnion() ? type.types : [type]).some(
        (member) =>
          member.isStringLiteral() && objectPrototypeMembers.has(member.value),
      ),
    )
  );
};

/**
 * Whether every member of `type` is an object type literal, an object literal
 * or a mapped type (`Record<string, V>`) none of whose properties a class or an
 * interface declares, nor is declared as a method signature, a getter or a
 * setter. A class, an interface, a type parameter, or a mapped type over one of
 * them (`Readonly<Bag>`) may stand for an instance whose methods live on a
 * prototype, and so may a type literal with a method signature, which a class
 * implements as well, so neither is counted.
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
                !ts.isInterfaceDeclaration(declaration.parent) &&
                !ts.isMethodSignature(declaration) &&
                !ts.isGetAccessorDeclaration(declaration) &&
                !ts.isSetAccessorDeclaration(declaration),
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
