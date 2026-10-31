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
  isOmittedExpression,
  isPropertyAccessExpression,
  isPropertyAssignment,
  isSpreadAssignment,
  isSpreadElement,
  isStringLiteralLikeNode,
  SyntaxKind,
  type ElementAccessExpression,
  type PropertyAccessExpression,
  type Node as TsNode,
} from 'typescript-native/unstable/ast';
import type { Checker } from 'typescript-native/unstable/sync';
import { ownersOf, unwrap } from '../ast/index.mjs';
import type { Rule, RuleContext } from '../engine/index.mjs';

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
 * Four things are deliberately out of scope:
 *
 * - **A write the type already refuses.** An assignment or `delete` whose
 *   target is read-only — an `as const` value, which `readonly/require-as-const`
 *   gives every non-`mut_` literal binding (D-62), a `readonly T[]`, a
 *   `Readonly<Record<…>>` — is a compiler error on that very span, and is left
 *   to it. The decision is the compiler's own diagnostic, not a reading of the
 *   type: `(frozen.a as number) = 2` has a read-only target and the compiler
 *   accepts it, so it is still reported here. A mutator call needs no such
 *   case: a read-only type does not have the method, and its owner does not
 *   resolve.
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
 * an assignment. A destructuring pattern on the left of either
 * (`[a.x, b.y] = pair`, `({ k: o.v } = obj)`) assigns to each access it holds,
 * nested patterns and rest elements included, and each is reported the same
 * way. Parentheses and type wrappers — `as`, `satisfies`, `!`, `<T>` — are
 * looked through wherever they appear: around a target
 * (`(obj.x satisfies T) = 1`), a callee (`(xs.push)(1)`) or a receiver, whose
 * method is resolved on the type of the value rather than of the cast.
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
  visit: (node, context) => {
    const { checker, report } = context;

    if (isBinaryExpression(node)) {
      if (!isAssignmentOperator(node.operatorToken.kind)) {
        return;
      }

      reportAssignedAccess(node.left, report, context.isReportedByCompiler);

      return;
    }

    if (isForOfStatement(node) || isForInStatement(node)) {
      // A declaration (`for (const x of xs)`) binds a new name each time; only
      // an expression target assigns to something that already exists.
      reportAssignedAccess(
        node.initializer,
        report,
        context.isReportedByCompiler,
      );

      return;
    }

    if (isDeleteExpression(node)) {
      const deleted = unwrap(node.expression);

      if (
        !isAccess(deleted) ||
        isMutPermitted(deleted) ||
        context.isReportedByCompiler(deleted, readonlyWriteCodes)
      ) {
        return;
      }

      report(deleted, 'deletion', { path: pathText(deleted) });

      return;
    }

    if (!isCallExpression(node)) {
      return;
    }

    // `(xs.push)(1)` and `(xs.push as F)(1)` still call `push` on `xs`.
    const callee = unwrap(node.expression);

    if (!isPropertyAccessExpression(callee)) {
      return;
    }

    const method = callee.name.text;

    // The syntactic filter that keeps the pass cheap: a name no mutator has
    // costs nothing, and the checker is asked only about what is left.
    if (!mutatorMethodNames.has(method)) {
      return;
    }

    // A mutator if any layer of the receiver says so (see `wrapperLayers`):
    // `(xs as { push: … }).push(1)` still mutates the array `xs` is.
    const owner = ownersOf(checker, callee).find(
      (candidate) =>
        candidate !== undefined &&
        mutatorsByOwner.get(candidate)?.has(method) === true,
    );

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

/**
 * The compiler's errors for a write its type refuses: TS2540 (a read-only
 * property, `as const` included), TS2542 (a read-only index signature —
 * `readonly T[]`, `Readonly<Record<…>>`) and TS2704 (`delete` of a read-only
 * property). Where one of them lands on the target, the write is already
 * reported, and a second report of the same line would say nothing new.
 */
const readonlyWriteCodes: ReadonlySet<number> = new Set<number>([
  2540, 2542, 2704,
]);

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
> = new Map<string, ReadonlyMap<string, string>>([
  [
    'Array',
    new Map<string, string>([
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
        new Map<string, string>([
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
    new Map<string, string>([
      ['clear', '`new Map()`'],
      ['delete', 'a new `Map` built without the entry'],
      ['getOrInsert', '`m.get(k) ?? v`'],
      ['getOrInsertComputed', '`m.get(k) ?? f(k)`'],
      ['set', '`new Map([...m, [k, v]])`'],
    ]),
  ],
  [
    'Set',
    new Map<string, string>([
      ['add', '`new Set([...s, x])`'],
      ['clear', '`new Set()`'],
      ['delete', 'a new `Set` built without the element'],
    ]),
  ],
  [
    'WeakMap',
    new Map<string, string>([
      ['delete', 'a new `WeakMap` built without the entry'],
      ['getOrInsert', '`m.get(k) ?? v`'],
      ['getOrInsertComputed', '`m.get(k) ?? f(k)`'],
      ['set', 'a new `WeakMap`'],
    ]),
  ],
  [
    'WeakSet',
    new Map<string, string>([
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
    new Map<string, string>([
      ['assign', '`{ ...target, ...source }`'],
      ['defineProperties', '`{ ...target, ...properties }`'],
      ['defineProperty', '`{ ...target, [key]: value }`'],
      ['setPrototypeOf', '`Object.create`'],
    ]),
  ],
  [
    'Reflect',
    new Map<string, string>([
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
const argumentMutatingOwners: ReadonlyMap<string, string> = new Map<
  string,
  string
>([
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
> = new Map<string, ReadonlySet<string>>([
  ['Array', new Set(arrayCopyingMethods)],
  ['ReadonlyArray', new Set(arrayCopyingMethods)],
  ['ArrayConstructor', new Set<string>(['from', 'of'])],
  [
    'ObjectConstructor',
    new Set<string>(['create', 'entries', 'fromEntries', 'keys', 'values']),
  ],
  ...typedArrayNames.map(
    (name) =>
      [
        name,
        new Set<string>([
          'filter',
          'map',
          'slice',
          'toReversed',
          'toSorted',
          'with',
        ]),
      ] as const,
  ),
  ['String', new Set<string>(['split'])],
  ['Set', new Set<string>(['difference', 'intersection', 'union'])],
  ['ReadonlySet', new Set<string>(['difference', 'intersection', 'union'])],
]);

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

  const callee = unwrap(unwrapped.expression);

  if (!isPropertyAccessExpression(callee)) {
    return false;
  }

  // Fresh only if every layer of the receiver says so: the exemption spares
  // a report, so no layer may contradict it (see `wrapperLayers`).
  return ownersOf(checker, callee).every(
    (owner) =>
      owner !== undefined &&
      (freshValueMembersByOwner.get(owner)?.has(callee.name.text) ?? false),
  );
};

/** A pattern element with a default value: `target = value`. */
const hasDefault = (node: TsNode): boolean =>
  isBinaryExpression(node) &&
  node.operatorToken.kind === SyntaxKind.EqualsToken;

/**
 * What an assignment target writes to, unwrapped: the target itself, or the
 * elements of a destructuring pattern, nested patterns and rest elements
 * included. A shorthand property (`({ a } = obj)`) rebinds a variable, which
 * is `functional/no-let`'s, and a target with a default (`[o.a = 1] = xs`) is
 * left out because its `o.a = 1` is an assignment node of its own, visited
 * and reported on its own.
 */
const assignedTargets = (node: TsNode): readonly TsNode[] => {
  const target = unwrap(node);

  if (isArrayLiteralExpression(target)) {
    return target.elements.flatMap((element) =>
      isOmittedExpression(element) || hasDefault(element)
        ? []
        : assignedTargets(
            isSpreadElement(element) ? element.expression : element,
          ),
    );
  }

  if (isObjectLiteralExpression(target)) {
    return target.properties.flatMap((property) =>
      isPropertyAssignment(property)
        ? hasDefault(property.initializer)
          ? []
          : assignedTargets(property.initializer)
        : isSpreadAssignment(property)
          ? assignedTargets(property.expression)
          : [],
    );
  }

  return [target];
};

/**
 * Assignment through an access path: the target of `=`, a compound operator,
 * or a `for … of` / `for … in` header, or each access a destructuring pattern
 * there assigns to.
 */
const reportAssignedAccess = (
  node: TsNode,
  report: RuleContext['report'],
  isReportedByCompiler: RuleContext['isReportedByCompiler'],
): void => {
  for (const target of assignedTargets(node)) {
    if (
      !isAccess(target) ||
      isMutPermitted(target) ||
      isReportedByCompiler(target, readonlyWriteCodes)
    ) {
      continue;
    }

    report(target, 'assignment', { path: pathText(target) });
  }
};
