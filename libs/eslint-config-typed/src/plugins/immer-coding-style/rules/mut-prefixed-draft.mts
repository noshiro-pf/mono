import {
  AST_NODE_TYPES,
  TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isTypeWrapper, skipTypeWrappers } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { mutablePrefix } from '../../../constants/index.mjs';

type MessageIds = 'requireMutPrefix';

/**
 * Reports the draft parameter of an immer recipe whose name lacks the `mut_`
 * prefix. `functional/immutable-data` lets only `mut_`-prefixed bindings be
 * mutated, so an unprefixed draft is otherwise reported on every line that
 * writes to it, with a message that does not say the fix is a rename.
 *
 * The recipe is the second argument of `produce` / `produceWithPatches` when
 * it is a function literal, and otherwise the first when that one is (the
 * curried form). A destructured draft and one that is never referenced are
 * left alone; a draft with a default value is reported.
 *
 * The fix renames the parameter and its references. It is withheld when it
 * could change the code's meaning or add shadowing; `canRename` lists the
 * cases.
 */
export const mutPrefixedDraftRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: `Require the \`${mutablePrefix}\` prefix on the draft parameter of an immer recipe.`,
    },
    fixable: 'code',
    schema: [],
    messages: {
      requireMutPrefix: `Name the draft \`{{suggested}}\` instead of \`{{name}}\`: \`functional/immutable-data\` allows mutation only through \`${mutablePrefix}\`-prefixed bindings.`,
    },
    defaultOptions: [],
  },
  create: (context) => ({
    CallExpression: (node: DeepReadonly<TSESTree.CallExpression>) => {
      const recipe = findRecipe(node);

      if (recipe === undefined) {
        return;
      }

      const param = draftParameterOf(recipe);

      if (param === undefined || param.name.startsWith(mutablePrefix)) {
        return;
      }

      const scope = context.sourceCode.scopeManager?.scopes.find(
        (s) =>
          s.type === TSESLint.Scope.ScopeType.function &&
          s.block.range[0] === recipe.range[0] &&
          s.block.range[1] === recipe.range[1],
      );

      if (scope === undefined) {
        return;
      }

      const variable = scope.set.get(param.name);

      // The scope manager's own node, which `report` and the fixer take as it
      // is.
      const declared = variable?.identifiers[0];

      if (variable === undefined || declared === undefined) {
        return;
      }

      // The parameter's node includes its type annotation, and its name may be
      // spelt with escapes (`\u0064raft`), so the name's token is renamed.
      const nameToken = context.sourceCode.getFirstToken(declared);

      const references = usesOf(variable);

      if (nameToken === null || Arr.isEmpty(references)) {
        return;
      }

      const suggested = `${mutablePrefix}${param.name}` as const;

      context.report({
        loc: nameToken.loc,
        messageId: 'requireMutPrefix',
        data: { name: param.name, suggested },
        fix: canRename(scope, variable, suggested)
          ? (fixer) =>
              Arr.toUnshifted(
                references.map(({ identifier }) =>
                  identifier.parent.type === AST_NODE_TYPES.Property &&
                  identifier.parent.shorthand &&
                  identifier.parent.value === identifier
                    ? fixer.insertTextAfter(identifier, `: ${suggested}`)
                    : fixer.replaceText(identifier, suggested),
                ),
                fixer.replaceText(nameToken, suggested),
              )
          : null,
      });
    },
  }),
} as const;

type FunctionNode =
  TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;

const produceNames: ReadonlySet<string> = new Set<string>([
  'produce',
  'produceWithPatches',
]);

const isFunctionNode = (
  node: DeepReadonly<TSESTree.Node>,
): node is DeepReadonly<FunctionNode> =>
  node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
  node.type === AST_NODE_TYPES.FunctionExpression;

const findRecipe = (
  node: DeepReadonly<TSESTree.CallExpression>,
): DeepReadonly<FunctionNode> | undefined => {
  const callee = skipTypeWrappers(node.callee);

  if (
    callee.type !== AST_NODE_TYPES.Identifier ||
    !produceNames.has(callee.name)
  ) {
    return undefined;
  }

  // A spread may hold any of the arguments, so no position is known.
  if (node.arguments.some((a) => a.type === AST_NODE_TYPES.SpreadElement)) {
    return undefined;
  }

  const [first, second] = [node.arguments[0], node.arguments[1]].map(
    (argument) =>
      argument === undefined || argument.type === AST_NODE_TYPES.SpreadElement
        ? undefined
        : skipTypeWrappers(argument),
  );

  // immer curries when the base is a function and the recipe is not, and the
  // curried form takes at most an initial state after it. A recipe passed by
  // name cannot be told from an initial state, so a function literal second
  // is the recipe, and otherwise a function literal first.
  return second !== undefined && isFunctionNode(second)
    ? second
    : first !== undefined &&
        isFunctionNode(first) &&
        Arr.isMaxLengthArray(2, node.arguments)
      ? first
      : undefined;
};

/**
 * The draft parameter of `recipe` when it is a plain identifier, with or
 * without a default value. A function expression's `this` annotation is not a
 * parameter at run time.
 */
const draftParameterOf = (
  recipe: DeepReadonly<FunctionNode>,
): DeepReadonly<TSESTree.Identifier> | undefined => {
  const first = recipe.params.find(
    (p) => p.type !== AST_NODE_TYPES.Identifier || p.name !== 'this',
  );

  const param =
    first?.type === AST_NODE_TYPES.AssignmentPattern ? first.left : first;

  return param?.type === AST_NODE_TYPES.Identifier ? param : undefined;
};

/**
 * The references of `variable` other than its declaration, which a default
 * value's write is.
 */
const usesOf = <V extends DeepReadonly<TSESLint.Scope.Variable>>(
  variable: V,
): V['references'] =>
  variable.references.filter(
    ({ identifier }) => identifier !== variable.identifiers[0],
  );

const outsideTypeWrappers = (
  node: DeepReadonly<TSESTree.Node> | undefined,
): DeepReadonly<TSESTree.Node> | undefined =>
  node !== undefined && isTypeWrapper(node)
    ? outsideTypeWrappers(node.parent)
    : node;

const isRecipe = (
  node: DeepReadonly<TSESTree.Node>,
): node is DeepReadonly<FunctionNode> => {
  const call = outsideTypeWrappers(node.parent);

  return (
    call?.type === AST_NODE_TYPES.CallExpression && findRecipe(call) === node
  );
};

/**
 * `true` when a recipe around `scope` has a draft named `name` that this rule
 * reports, and so renames in the same pass as this one.
 */
const isDraftNameOfRecipeAround = (
  scope: DeepReadonly<TSESLint.Scope.Scope>,
  name: string,
): boolean => {
  const { upper } = scope;

  if (upper === null) {
    return false;
  }

  const { block } = upper;

  const outer = upper.set.get(name);

  return (
    // Only a function's parent is known not to be `null` (the `Program`'s).
    (isFunctionNode(block) &&
      isRecipe(block) &&
      draftParameterOf(block)?.name === name &&
      outer !== undefined &&
      Arr.isNonEmpty(usesOf(outer))) ||
    isDraftNameOfRecipeAround(upper, name)
  );
};

/** A type of the same name does not collide with a parameter. */
const isValueIn = (
  scope: DeepReadonly<TSESLint.Scope.Scope>,
  name: string,
): boolean => scope.set.get(name)?.isValueVariable ?? false;

/** `true` when a value named `name` is declared in `scope` or inside it. */
const isDeclaredWithin = (
  scope: DeepReadonly<TSESLint.Scope.Scope>,
  name: string,
): boolean =>
  isValueIn(scope, name) ||
  scope.childScopes.some((child) => isDeclaredWithin(child, name));

/** `true` when a value named `name` is declared in a scope around `scope`. */
const isDeclaredAround = (
  scope: DeepReadonly<TSESLint.Scope.Scope>,
  name: string,
): boolean =>
  scope.upper !== null &&
  (isValueIn(scope.upper, name) || isDeclaredAround(scope.upper, name));

/**
 * `true` when renaming the draft `variable` of the recipe whose scope is
 * `scope` to `newName` keeps the recipe's meaning and adds no shadowing:
 *
 * - no value named `newName` is declared in or around the recipe nor read in
 *   it (`through` holds every reference that leaves the scope, nested ones
 *   included);
 * - no direct `eval` in it could read the draft by name;
 * - no enclosing recipe has a reported draft of the same name, which is
 *   renamed in the same pass and would then be shadowed by this one;
 * - the draft has no second declaration (`function draft() {}`, which would
 *   keep the old name while its references move);
 * - nothing writes the binding, which may sit in a pattern
 *   (`({ draft = x } = y)`) whose key a rename would change too.
 */
const canRename = (
  scope: DeepReadonly<TSESLint.Scope.Scope>,
  variable: DeepReadonly<TSESLint.Scope.Variable>,
  newName: string,
): boolean =>
  !isDeclaredWithin(scope, newName) &&
  !isDeclaredAround(scope, newName) &&
  scope.through.every(
    // A type reference cannot be captured by a value parameter.
    (reference) =>
      !reference.isValueReference ||
      (reference.identifier.name !== newName &&
        reference.identifier.name !== 'eval'),
  ) &&
  !isDraftNameOfRecipeAround(scope, variable.name) &&
  Arr.isFixedLengthArray(1, variable.defs) &&
  variable.references.every(
    // A default value is an initializing write of the parameter.
    (reference) => !reference.isWrite() || reference.init === true,
  );
