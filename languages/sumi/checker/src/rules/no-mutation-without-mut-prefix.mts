import {
  isArrayLiteralExpression,
  isAssignmentOperator,
  isBinaryExpression,
  isCallExpression,
  isDeleteExpression,
  isElementAccessExpression,
  isForInStatement,
  isForOfStatement,
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
import { type Rule, type RuleContext } from '../engine/index.mjs';

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
 * resolved to the interface that declares it, so only the mutators of the
 * built-ins listed in `mutatorsByOwner` count: `Array` and the typed arrays,
 * `Map` / `Set` and the weak collections, `Date`, and `Object` / `Reflect`.
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
 * A `for … of` / `for … in` whose target is a member access
 * (`for (obj.current of xs)`) assigns on every iteration and is reported like
 * an assignment. Parentheses and `as` around a target (`(obj.x as T) = 1`)
 * are looked through.
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
      if (!isAssignmentOperator(node.operatorToken.kind)) {
        return;
      }

      reportAssignedAccess(node.left, report);

      return;
    }

    if (isForOfStatement(node) || isForInStatement(node)) {
      // A declaration (`for (const x of xs)`) binds a new name each time; only
      // an expression target assigns to something that already exists.
      reportAssignedAccess(node.initializer, report);

      return;
    }

    if (isDeleteExpression(node)) {
      const deleted = unwrap(node.expression);

      if (!isAccess(deleted) || isMutPermitted(deleted)) {
        return;
      }

      report(deleted, 'deletion', { path: pathText(deleted) });

      return;
    }

    if (!isCallExpression(node)) {
      return;
    }

    const callee = node.expression;

    if (!isPropertyAccessExpression(callee)) {
      return;
    }

    const method = callee.name.text;

    // The syntactic filter that keeps the pass cheap: a name no mutator has
    // costs nothing, and the checker is asked only about what is left.
    if (!mutatorMethodNames.has(method)) {
      return;
    }

    const owner = ownerOf(checker, callee);

    const alternative =
      owner === undefined ? undefined : mutatorsByOwner.get(owner)?.get(method);

    if (owner === undefined || alternative === undefined) {
      return;
    }

    const staticOwner = argumentMutatingOwners.get(owner);

    // `Object.assign(target, …)` and `Reflect.set(target, …)` mutate their
    // first argument; every other mutator mutates its receiver.
    const target =
      staticOwner === undefined ? callee.expression : node.arguments.at(0);

    if (
      target === undefined ||
      isMutPermitted(target) ||
      isFreshValue(checker, target)
    ) {
      return;
    }

    report(target, 'mutatingCall', {
      method: staticOwner === undefined ? method : `${staticOwner}.${method}`,
      path: pathText(target),
      alternative,
    });
  },
} as const;

/** An access path: `a.b`, `a[0]`, and the chains built from them. */
const isAccess = (
  node: TsNode,
): node is ElementAccessExpression | PropertyAccessExpression =>
  isPropertyAccessExpression(node) || isElementAccessExpression(node);

/**
 * The typed-array interfaces. `subarray` is deliberately absent from their
 * fresh-value members below: it returns a view onto the same buffer.
 */
const typedArrayNames: readonly string[] = [
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float16Array',
  'Float32Array',
  'Float64Array',
  'BigInt64Array',
  'BigUint64Array',
] as const;

/** `Date`'s setters, local and UTC. */
const dateSetterNames: readonly string[] = [
  'setDate',
  'setFullYear',
  'setHours',
  'setMilliseconds',
  'setMinutes',
  'setMonth',
  'setSeconds',
  'setTime',
  'setUTCDate',
  'setUTCFullYear',
  'setUTCHours',
  'setUTCMilliseconds',
  'setUTCMinutes',
  'setUTCMonth',
  'setUTCSeconds',
] as const;

/**
 * The mutators, by the interface that declares them, each with the copying
 * form to suggest. Grouping by owner is what separates `xs.sort()` from a
 * `sort` of one's own: the name alone selects a candidate, and the declaring
 * interface decides — which is also why the suggestion is looked up by owner,
 * since `set` means one thing on a `Map` and another on a `Uint8Array`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
 */
const mutatorsByOwner: ReadonlyMap<
  string,
  ReadonlyMap<string, string>
> = new Map([
  [
    'Array',
    new Map([
      ['copyWithin', '`with`'],
      ['fill', '`Array.from`'],
      ['pop', '`xs.slice(0, -1)`'],
      ['push', '`[...xs, x]`'],
      ['reverse', '`toReversed`'],
      ['shift', '`xs.slice(1)`'],
      ['sort', '`toSorted`'],
      ['splice', '`toSpliced`'],
      ['unshift', '`[x, ...xs]`'],
    ]),
  ],
  ...typedArrayNames.map(
    (name) =>
      [
        name,
        new Map([
          ['copyWithin', '`with`'],
          ['fill', '`xs.map(() => value)`'],
          ['reverse', '`toReversed`'],
          ['set', '`with`, or a new typed array'],
          ['sort', '`toSorted`'],
        ]),
      ] as const,
  ),
  [
    'Map',
    new Map([
      ['clear', '`new Map()`'],
      ['delete', 'a new `Map` built without the entry'],
      ['getOrInsert', '`m.get(k) ?? v`'],
      ['getOrInsertComputed', '`m.get(k) ?? f(k)`'],
      ['set', '`new Map([...m, [k, v]])`'],
    ]),
  ],
  [
    'Set',
    new Map([
      ['add', '`new Set([...s, x])`'],
      ['clear', '`new Set()`'],
      ['delete', 'a new `Set` built without the element'],
    ]),
  ],
  [
    'WeakMap',
    new Map([
      ['delete', 'a new `WeakMap` built without the entry'],
      ['getOrInsert', '`m.get(k) ?? v`'],
      ['getOrInsertComputed', '`m.get(k) ?? f(k)`'],
      ['set', 'a new `WeakMap`'],
    ]),
  ],
  [
    'WeakSet',
    new Map([
      ['add', 'a new `WeakSet`'],
      ['delete', 'a new `WeakSet` built without the element'],
    ]),
  ],
  [
    'Date',
    new Map(dateSetterNames.map((name) => [name, 'a new `Date`'] as const)),
  ],
  [
    'ObjectConstructor',
    new Map([
      ['assign', '`{ ...target, ...source }`'],
      ['defineProperties', '`{ ...target, ...properties }`'],
      ['defineProperty', '`{ ...target, [key]: value }`'],
      ['setPrototypeOf', '`Object.create`'],
    ]),
  ],
  [
    'Reflect',
    new Map([
      ['defineProperty', '`{ ...target, [key]: value }`'],
      ['deleteProperty', 'a new object built without the key'],
      ['set', '`{ ...target, [key]: value }`'],
      ['setPrototypeOf', '`Object.create`'],
    ]),
  ],
]);

/**
 * The owners whose mutators are static functions taking the target as their
 * first argument, with the name to print them under.
 */
const argumentMutatingOwners: ReadonlyMap<string, string> = new Map([
  ['ObjectConstructor', 'Object'],
  ['Reflect', 'Reflect'],
]);

/** Every mutator name, for the syntactic filter. */
const mutatorMethodNames: ReadonlySet<string> = new Set(
  mutatorsByOwner.values().flatMap((methods) => methods.keys()),
);

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
  ...typedArrayNames.map(
    (name) =>
      [
        name,
        new Set(['filter', 'map', 'slice', 'toReversed', 'toSorted', 'with']),
      ] as const,
  ),
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

  if (isIdentifier(unwrapped)) {
    return [unwrapped.text];
  }

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

  if (!isCallExpression(unwrapped)) {
    return false;
  }

  const callee = unwrapped.expression;

  if (!isPropertyAccessExpression(callee)) {
    return false;
  }

  const owner = ownerOf(checker, callee);

  return (
    owner !== undefined &&
    (freshValueMembersByOwner.get(owner)?.has(callee.name.text) ?? false)
  );
};

/**
 * Assignment through an access path: the target of `=`, a compound operator,
 * or a `for … of` / `for … in` header.
 */
const reportAssignedAccess = (
  node: TsNode,
  report: RuleContext['report'],
): void => {
  const target = unwrap(node);

  if (!isAccess(target) || isMutPermitted(target)) {
    return;
  }

  report(target, 'assignment', { path: pathText(target) });
};
