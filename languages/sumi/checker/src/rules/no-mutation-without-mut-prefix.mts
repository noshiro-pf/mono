import { type ReadonlyRecord } from 'ts-type-forge';
import {
  isArrayLiteralExpression,
  isAssignmentOperator,
  isBinaryExpression,
  isCallExpression,
  isDeleteExpression,
  isElementAccessExpression,
  isIdentifier,
  isNewExpression,
  isObjectLiteralExpression,
  isPropertyAccessExpression,
  isStringLiteralLikeNode,
  type ElementAccessExpression,
  type PropertyAccessExpression,
  type Node as TsNode,
} from 'typescript-native/unstable/ast';
import { type Checker } from 'typescript-native/unstable/sync';
import { ownerOf, unwrap } from '../ast/index.mjs';
import { type Rule } from '../engine/index.mjs';

/**
 * `mutation/no-mutation-without-mut-prefix` — a destructive operation is
 * allowed only on a path some segment of which carries the `mut_` prefix
 * (Sumi spec/variables-and-mutation.md, D-14 / D-27).
 *
 * This is the other half of the `mut_` discipline. `functional/no-let` covers
 * rebinding a variable, which syntax settles; what is left is mutating what a
 * binding *points at* — and that needs the checker, because `xs.sort()` is a
 * mutation and `xs.toSorted()` is not, while `report.sort()` on an object of
 * one's own that happens to have a `sort` method is neither. The method is
 * resolved to the interface that declares it, so only `Array`, `Map`, `Set`,
 * the weak collections and `Object`'s own mutators count.
 *
 * ```ts
 * const mut_xs: number[] = [];
 * mut_xs.push(1); // fine — the name says so
 *
 * const xs: number[] = [];
 * xs.push(1); // reported
 * ```
 *
 * Three things are deliberately out of scope:
 *
 * - **Rebinding a variable** (`x = 1`). Only a `let` can be rebound and only
 *   a `mut_` name may be a `let`, so `functional/no-let` has already refused
 *   it; a second report would say the same thing twice.
 * - **`++` / `--`**, which `banned-syntax/no-increment-decrement` refuses
 *   outright, whatever it is applied to.
 * - **A value that has just been made** (`[3, 1, 2].sort()`), which nothing
 *   else holds a reference to. This is `ignoreImmediateMutation` in the
 *   ESLint bridge, kept for the same reason: a mutation nobody can observe.
 *
 * One known gap: a destructuring assignment whose targets are member accesses
 * (`[a.x, b.y] = pair`) is not reported, because the left of the assignment is
 * the pattern rather than an access. The form does not occur in this
 * repository and the ESLint bridge covers it; add it here when it does.
 */
export const noMutationWithoutMutPrefix: Rule = {
  ruleId: 'mutation/no-mutation-without-mut-prefix',
  description:
    'Disallow a destructive operation on a path that carries no `mut_` prefix (Sumi D-14).',
  messages: {
    assignment:
      'Assigning to `{{path}}` mutates an existing object. Sumi allows that only through a name marked mutable: rename the binding to `mut_…`, or build a new value (`{ ...obj }`) instead (D-14).',
    deletion:
      'Deleting from `{{path}}` mutates an existing object. Sumi allows that only through a name marked mutable: rename the binding to `mut_…`, or build a new value without the key instead (D-14).',
    mutatingCall:
      '`{{method}}` mutates `{{path}}` in place. Sumi allows that only through a name marked mutable: rename the binding to `mut_…`, or use the copying form ({{alternative}}) instead (D-14).',
  },
  visit: (node, { checker, report }) => {
    if (isBinaryExpression(node)) {
      if (
        !isAssignmentOperator(node.operatorToken.kind) ||
        !isAccess(node.left) ||
        isMutPermitted(node.left)
      ) {
        return;
      }

      report(node.left, 'assignment', { path: pathText(node.left) });

      return;
    }

    if (isDeleteExpression(node)) {
      if (!isAccess(node.expression) || isMutPermitted(node.expression)) return;

      report(node.expression, 'deletion', { path: pathText(node.expression) });

      return;
    }

    if (!isCallExpression(node)) return;

    const callee = node.expression;

    if (!isPropertyAccessExpression(callee)) return;

    const method = callee.name.text;

    // The syntactic filter that keeps the pass cheap: a name no mutator has
    // costs nothing, and the checker is asked only about what is left.
    if (!mutatorMethodNames.has(method)) return;

    const owner = ownerOf(checker, callee);

    if (
      owner === undefined ||
      !(mutatorsByOwner.get(owner)?.has(method) ?? false)
    ) {
      return;
    }

    // `Object.assign(target, …)` mutates its first argument; every other
    // mutator mutates its receiver.
    const target =
      owner === 'ObjectConstructor' ? node.arguments.at(0) : callee.expression;

    if (
      target === undefined ||
      isMutPermitted(target) ||
      isFreshValue(checker, target)
    ) {
      return;
    }

    report(target, 'mutatingCall', {
      method: owner === 'ObjectConstructor' ? `Object.${method}` : method,
      path: pathText(target),
      alternative: alternatives[method] ?? 'a copy',
    });
  },
} as const;

/** An access path: `a.b`, `a[0]`, and the chains built from them. */
const isAccess = (
  node: TsNode,
): node is ElementAccessExpression | PropertyAccessExpression =>
  isPropertyAccessExpression(node) || isElementAccessExpression(node);

/**
 * The mutators, by the interface that declares them. Grouping by owner is
 * what separates `xs.sort()` from a `sort` of one's own: the name alone
 * selects a candidate, and the declaring interface decides.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/prototype
 */
const mutatorsByOwner: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  [
    'Array',
    new Set([
      'copyWithin',
      'fill',
      'pop',
      'push',
      'reverse',
      'shift',
      'sort',
      'splice',
      'unshift',
    ]),
  ],
  ['Map', new Set(['clear', 'delete', 'set'])],
  ['Set', new Set(['add', 'clear', 'delete'])],
  ['WeakMap', new Set(['delete', 'set'])],
  ['WeakSet', new Set(['add', 'delete'])],
  [
    'ObjectConstructor',
    new Set(['assign', 'defineProperties', 'defineProperty', 'setPrototypeOf']),
  ],
]);

/** Every mutator name, for the syntactic filter. */
const mutatorMethodNames: ReadonlySet<string> = new Set(
  mutatorsByOwner.values().flatMap((methods) => methods.values()),
);

/** The copying form to suggest, one per mutator. */
const alternatives: ReadonlyRecord<string, string> = {
  add: '`new Set([...s, x])`',
  assign: '`{ ...target, ...source }`',
  clear: '`new Map()` / `new Set()`',
  copyWithin: '`with`',
  defineProperties: '`{ ...target, ...properties }`',
  defineProperty: '`{ ...target, [key]: value }`',
  delete: 'a new collection built without the entry',
  fill: '`Array.from`',
  pop: '`xs.slice(0, -1)`',
  push: '`[...xs, x]`',
  reverse: '`toReversed`',
  set: '`new Map([...m, [k, v]])`',
  setPrototypeOf: '`Object.create`',
  shift: '`xs.slice(1)`',
  sort: '`toSorted`',
  splice: '`toSpliced`',
  unshift: '`[x, ...xs]`',
} as const;

/** The `Array` members that return a new array rather than mutating one. */
const arrayCopyingMethods = [
  'concat',
  'filter',
  'flat',
  'flatMap',
  'map',
  'slice',
  'toReversed',
  'toSorted',
  'toSpliced',
  'with',
] as const;

/**
 * Members that hand back a value nothing else holds, by declaring interface.
 * Mutating one of these results is `[3, 1, 2].sort()` a step removed, and is
 * allowed for the same reason.
 */
const freshValueMembersByOwner: ReadonlyMap<
  string,
  ReadonlySet<string>
> = new Map([
  ['Array', new Set(arrayCopyingMethods)],
  ['ReadonlyArray', new Set(arrayCopyingMethods)],
  ['ArrayConstructor', new Set(['from', 'of'])],
  [
    'ObjectConstructor',
    new Set(['create', 'entries', 'fromEntries', 'keys', 'values']),
  ],
  ['String', new Set(['split'])],
  ['Set', new Set(['difference', 'intersection', 'union'])],
  ['ReadonlySet', new Set(['difference', 'intersection', 'union'])],
]);

/**
 * Whether some segment of the path is marked mutable.
 *
 * The root binding is the usual case (`mut_xs[0] = 1`), and a property is the
 * other one the monorepo already relies on (`state.mut_cache.x = 1`) — the
 * ESLint bridge spells the pair `ignoreIdentifierPattern: ['^mut_']` and
 * `ignoreAccessorPattern: ['**.mut_**']`. How far the prefix reaches into
 * property and parameter names is an open point in
 * spec/variables-and-mutation.md; this follows what the bridge does today.
 */
const isMutPermitted = (node: TsNode): boolean =>
  pathSegments(node).some((segment) => segment.startsWith('mut_'));

/**
 * The names along an access path, root first. A segment that is not a name —
 * a computed index, a call in the middle of the chain — contributes nothing,
 * which is what keeps `xs[mut_i] = 1` from reading as permitted.
 */
const pathSegments = (node: TsNode): readonly string[] => {
  const unwrapped = unwrap(node);

  if (isIdentifier(unwrapped)) return [unwrapped.text];

  if (isPropertyAccessExpression(unwrapped)) {
    return [...pathSegments(unwrapped.expression), unwrapped.name.text];
  }

  if (isElementAccessExpression(unwrapped)) {
    const { argumentExpression } = unwrapped;

    return [
      ...pathSegments(unwrapped.expression),
      ...(isStringLiteralLikeNode(argumentExpression)
        ? [argumentExpression.text]
        : []),
    ];
  }

  return [];
};

/** The path as written, for the message. */
const pathText = (node: TsNode): string => {
  const segments = pathSegments(node);

  return segments.length === 0 ? 'this value' : segments.join('.');
};

/**
 * Whether the value being mutated was made on the spot: a literal, a `new`,
 * or a call to a member that returns a new collection.
 */
const isFreshValue = (
  // `Checker` and `Node` are TypeScript's own interfaces, declared mutable;
  // this package does not get to restate them.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,

  node: TsNode,
): boolean => {
  const unwrapped = unwrap(node);

  if (
    isArrayLiteralExpression(unwrapped) ||
    isObjectLiteralExpression(unwrapped) ||
    isNewExpression(unwrapped)
  ) {
    return true;
  }

  if (!isCallExpression(unwrapped)) return false;

  const callee = unwrapped.expression;

  if (!isPropertyAccessExpression(callee)) return false;

  const owner = ownerOf(checker, callee);

  return (
    owner !== undefined &&
    (freshValueMembersByOwner.get(owner)?.has(callee.name.text) ?? false)
  );
};
