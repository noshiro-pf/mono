import {
  AST_NODE_TYPES,
  TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  getArgumentText,
  isTypeWrapper,
  typeHoldsAtEveryLayer,
  typeWrapperLayers,
} from 'eslint-rule-forge';
import type { DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import { brandedNumberTypeNameToFunctionName } from './branded-number-types.mjs';
import {
  TS_DATA_FORGE_MODULE,
  TS_TYPE_FORGE_BRAND_MARKER,
  TS_TYPE_FORGE_MODULE,
} from './constants.mjs';
import { tsDataForgeValueAtByName } from './import-binding.mjs';

type Options = readonly [];

type MessageIds = 'useBrandedNumberCastFunction' | 'castNonNumberOperand';

export const preferAsInt: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace branded number type assertions (e.g., `as Int`) with corresponding functions (e.g., `asInt()`) from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useBrandedNumberCastFunction:
        'Replace the assertion to `{{typeName}}` with `{{functionName}}()` from ts-data-forge.',
      castNonNumberOperand:
        'Replace the assertion to `{{typeName}}` with `{{functionName}}()` from ts-data-forge once the operand is a number: `{{functionName}}()` takes a `number`, and the operand is not typed as one at every layer of its type wrappers.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const mut_nodesToFix: {
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion;
      typeName: string;
      functionName: string;
      isGlobal: boolean;
    }[] = [];

    // `x as Int` and `<Int>x` are the same assertion.
    const collect = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): void => {
      const typeInfo = getBrandedNumberTypeInfo(
        sourceCode,
        node.typeAnnotation,
      );

      if (typeInfo === undefined) {
        return;
      }

      mut_nodesToFix.push({
        node,
        typeName: typeInfo.typeName,
        functionName: typeInfo.functionName,
        isGlobal: typeInfo.isGlobal,
      });
    };

    return {
      TSAsExpression: collect,
      TSTypeAssertion: collect,
      'Program:exit': () => {
        // One binding per cast function, however many casts use it.
        const castAt = tsDataForgeValueAtByName(sourceCode);

        // `asInt` takes a `number`: `asInt(u)` with `u: unknown` does not
        // compile, so a cast of anything else is reported and left to the
        // author. Without type information only a number literal is known to be
        // a number, and nothing is known not to be one; nor is a global name
        // known to be ts-type-forge's, so only a cast to an imported name is
        // fixed there. A cast to a global name is still reported, as advice the
        // author can check: the plugin is type-aware, and without types it
        // reads the name as `ts-type-forge/global`'s.
        const hasTypes = sourceCode.parserServices?.program != null;

        for (const {
          node,
          typeName,
          functionName,
          isGlobal,
        } of mut_nodesToFix) {
          const cast = castAt(functionName)(node);

          // Every layer, not only the outermost: `asInt(xs[0]!)` would compile,
          // but a narrowing wrapper is a claim the checker cannot verify, and
          // the fix keeps the wrapper as written; the author decides there.
          // Asked even when no fix can be written, since the message says
          // whether the operand is the reason.
          const isNumber = hasTypes
            ? typeHoldsAtEveryLayer(sourceCode, node.expression, isNumberType)
            : !isGlobal && isNumberWithoutTypes(node.expression);

          context.report({
            node,
            messageId:
              hasTypes && !isNumber
                ? 'castNonNumberOperand'
                : 'useBrandedNumberCastFunction',
            data: {
              typeName,
              // The name the fix writes: an aliased import's local name.
              functionName: cast?.localName ?? functionName,
            },
            // Not handled yet: the call can be typed narrower than the `Int`
            // the cast gave (`asInt(0)` is `Int & 0`), and where that type is
            // inferred into something that later takes another `Int` (a `let`
            // reassigned later), the fixed code does not compile. Whether the
            // call is narrower depends on the cast function's signature and the
            // operand, and whether that breaks anything depends on the cast's
            // use.
            fix:
              cast === undefined || !isNumber
                ? null
                : (fixer) => [
                    ...cast.edits(fixer),
                    fixer.replaceText(
                      node,
                      `${cast.localName}(${getArgumentText(sourceCode, node.expression)})`,
                    ),
                  ],
          });
        }
      },
    };
  },
} as const;

const FORGE_MODULES: ReadonlySet<unknown> = new Set<string>([
  TS_DATA_FORGE_MODULE,
  TS_TYPE_FORGE_MODULE,
]);

/**
 * The definitions that give a name no type meaning: a value, or a namespace,
 * which a type reference of the same name passes by.
 */
const NON_TYPE_DEFINITIONS: ReadonlySet<TSESLint.Scope.Definition['type']> =
  new Set<TSESLint.Scope.Definition['type']>([
    TSESLint.Scope.DefinitionType.CatchClause,
    TSESLint.Scope.DefinitionType.FunctionName,
    TSESLint.Scope.DefinitionType.Parameter,
    TSESLint.Scope.DefinitionType.TSModuleName,
    TSESLint.Scope.DefinitionType.Variable,
  ]);

// An import counts as a type whatever it binds (`import { Int } from
// './values.mjs'` may bind a value alone): the scope cannot tell without
// resolving the module, and a cast left unreported is never a fix that does not
// compile.
const hasTypeMeaning = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  def: TSESLint.Scope.Definition,
): boolean => !NON_TYPE_DEFINITIONS.has(def.type);

// eslint-rule-forge's binding helpers answer for a name in a value position;
// this one is in a type position, where a value-only binding does not count.
/**
 * The innermost variable named `name` from `scope` outwards that a type
 * reference of that name meets: one with a definition that has a type meaning.
 * A `const Int = 5` does not hide the type `Int`, and an implicit variable the
 * scope manager makes for an unresolved name has no definition at all.
 */
const findTypeVariable = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  scope: TSESLint.Scope.Scope,
  name: string,
): TSESLint.Scope.Variable | undefined => {
  const variable = scope.set.get(name);

  return variable?.defs.some(hasTypeMeaning) === true
    ? variable
    : scope.upper === null
      ? undefined
      : findTypeVariable(scope.upper, name);
};

// Asked at every cast rather than once per name: a name with no binding in the
// file need not mean one type everywhere in it (a namespace merged from another
// file can declare its own), and the checker's lookup is cheap.
//
// A project's own global of a branded number's name that is itself built from
// ts-type-forge's brands (`type Int = Uint32`, or ts-type-forge's `Int` with
// more in it) carries the marker too, and is taken to be ts-type-forge's.
// Telling it apart needs the package its declaration is in, which neither the
// scope nor the checker gives without resolving modules from the linted file,
// and such a global would shadow the one `ts-type-forge/global` declares.
/**
 * Whether a type name with no binding in the file is the global type
 * `ts-type-forge/global` declares: its type carries ts-type-forge's brand
 * marker. A project's own ambient `type Int` with a brand of its own, an enum,
 * or a type that is `any` is not. Without type information, or when the name
 * does not resolve, it is taken to be: the cast is then reported, and fixed only
 * with type information and a number operand.
 */
const isTsTypeForgeGlobal = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  typeName: TSESTree.Identifier,
): boolean => {
  const services = sourceCode.parserServices;

  const checker = services?.program?.getTypeChecker();

  const tsNode = services?.esTreeNodeToTSNodeMap?.get(typeName);

  if (
    checker === undefined ||
    tsNode === undefined ||
    // An unresolved name gets the checker's unknown symbol, which has none.
    checker.getSymbolAtLocation(tsNode)?.declarations === undefined
  ) {
    return true;
  }

  return (
    checker.getPropertyOfType(
      checker.getTypeAtLocation(tsNode),
      TS_TYPE_FORGE_BRAND_MARKER,
    ) !== undefined
  );
};

/**
 * Where the type `typeName` names comes from when it is ts-data-forge's
 * (re-exported from ts-type-forge): `'import'` when every binding of the name is
 * an import of that same name from either package, `'global'` when the name has
 * no binding in the file and is the global type `ts-type-forge/global`
 * declares, and `undefined` otherwise.
 */
const forgeTypeSource = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  typeName: TSESTree.Identifier,
): 'import' | 'global' | undefined => {
  const variable = findTypeVariable(
    sourceCode.getScope(typeName),
    typeName.name,
  );

  // The import is read by its module name, so ts-data-forge's `Int` re-exported
  // through a module of the project (`import { type Int } from './types.mjs'`)
  // is not reported: the scope cannot follow the re-export, and a cast left
  // alone is never a fix that does not compile. Asking the checker instead
  // would not tell `Int` from another brand an alias renames to it.
  if (variable === undefined) {
    return isTsTypeForgeGlobal(sourceCode, typeName) ? 'global' : undefined;
  }

  return variable.defs
    .filter(hasTypeMeaning)
    .every(
      (def) =>
        def.type === TSESLint.Scope.DefinitionType.ImportBinding &&
        def.parent.type === AST_NODE_TYPES.ImportDeclaration &&
        FORGE_MODULES.has(def.parent.source.value) &&
        def.node.type === AST_NODE_TYPES.ImportSpecifier &&
        def.node.imported.type === AST_NODE_TYPES.Identifier &&
        def.node.imported.name === typeName.name,
    )
    ? 'import'
    : undefined;
};

/**
 * The branded number type `typeAnnotation` names, when it is ts-data-forge's
 * (see {@link forgeTypeSource}). A local `type Int`, a type parameter, or an `Int`
 * from another package is someone else's type, which `asInt` does not return.
 */
const getBrandedNumberTypeInfo = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // Mutable, not `DeepReadonly`: its name goes to `sourceCode.getScope`, which
  // takes a mutable node, and a `DeepReadonly` one would need a cast back.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  typeAnnotation: TSESTree.TypeNode,
):
  | Readonly<{ typeName: string; functionName: string; isGlobal: boolean }>
  | undefined => {
  if (typeAnnotation.type !== AST_NODE_TYPES.TSTypeReference) {
    return undefined;
  }

  if (typeAnnotation.typeName.type !== AST_NODE_TYPES.Identifier) {
    return undefined;
  }

  const typeName = typeAnnotation.typeName.name;

  const functionName = brandedNumberTypeNameToFunctionName.get(typeName);

  if (functionName === undefined) {
    return undefined;
  }

  const source = forgeTypeSource(sourceCode, typeAnnotation.typeName);

  return source === undefined
    ? undefined
    : { typeName, functionName, isGlobal: source === 'global' };
};

/**
 * Whether a value of `type` is taken by `asInt<N extends number>`: `type` is
 * assignable to `number` — a number, a number literal, a brand, a type
 * parameter constrained to one, or a union or intersection of those. `any` is
 * not taken: it says nothing of the value, which the cast is the author's claim
 * about.
 */
const isNumberType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean =>
  (type.flags & ts.TypeFlags.Any) === 0 &&
  checker.isTypeAssignableTo(type, checker.getNumberType());

// A literal the brand rejects (`1.5 as Int`) is fixed too, as it is with type
// information: the fix's run-time check is what the rule is for. Narrower than
// what the checker would accept (`1 as const` is a number too): an operand left
// unfixed is never a fix that does not compile, and the syntax alone is read.
/**
 * Whether `node` is known to be a number without type information: a number
 * literal, or one negated (`-1`), at every layer of its type wrappers. A
 * `satisfies` or a `!` keeps the type of what it wraps, and an `as` or a `<T>`
 * has to name `number`.
 */
const isNumberWithoutTypes = (
  node: DeepReadonly<TSESTree.Expression>,
): boolean =>
  typeWrapperLayers(node).every((layer) =>
    layer.type === AST_NODE_TYPES.TSAsExpression ||
    layer.type === AST_NODE_TYPES.TSTypeAssertion
      ? layer.typeAnnotation.type === AST_NODE_TYPES.TSNumberKeyword
      : isTypeWrapper(layer) ||
        (layer.type === AST_NODE_TYPES.UnaryExpression && layer.operator === '-'
          ? isNumberWithoutTypes(layer.argument)
          : layer.type === AST_NODE_TYPES.Literal &&
            typeof layer.value === 'number'),
  );
