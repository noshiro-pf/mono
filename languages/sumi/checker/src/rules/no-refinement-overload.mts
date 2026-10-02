import {
  isBlock,
  isFunctionDeclaration,
  isIdentifier,
  isModuleBlock,
  isSourceFile,
  type FunctionDeclaration,
  type Node as TsNode,
} from 'typescript-native/unstable/ast';
import {
  SignatureKind,
  TypeFlags,
  type Checker,
  type Signature,
  type Type,
} from 'typescript-native/unstable/sync';
import { type Rule } from '../engine/index.mjs';

/**
 * `functions/no-refinement-overload` — an overload set's signatures can be
 * told apart at run time (Sumi spec/functions.md, D-58 judgement 1, #1952).
 *
 * An overload set is one body behind several signatures, and the body can only
 * choose what to do by looking at its arguments. Overloads are therefore
 * written only when the clauses are distinguishable at run time and so
 * disjoint. A set whose clauses cannot be told apart is a refinement of the
 * return type — one body, whatever the call — and is written as a single
 * signature (a conditional return type, a conditional rest tuple):
 *
 * ```ts
 * // reported: at run time both predicates are just functions
 * function filter<A, B extends A>(pred: (a: A) => a is B): Op<A, B>;
 * function filter<A>(pred: (a: A) => boolean): Op<A, A>;
 * ```
 *
 * Every pair of signatures in the set is compared, and a pair is legal when
 * one of three means separates it:
 *
 * 1. **Arity** — the ranges of argument counts they accept (required count to
 *    total count, unbounded with a rest parameter) do not overlap. Read from
 *    the syntax: `?`, an initializer and `...`.
 * 2. **`typeof`** — at some position, the `typeof` classes the two parameter
 *    types map to do not intersect. A union is the union of its members'; an
 *    intersection is its primitive members' (a branded `number & { brand }`
 *    is `number`); an object type with a call or construct signature is
 *    `function` and any other is `object`; a type parameter is judged by its
 *    constraint, and one without is every class. A position one signature
 *    may leave out counts as `undefined` for it.
 * 3. **A tag** — at some position, both types have a property whose types are
 *    unions of literals with no value in common (a discriminated union).
 *
 * "Distinguishable" and "disjoint" are the same condition here: a means that
 * separates them lets the body branch, and without one the same value fits
 * both.
 *
 * `functions/unified-signatures` reports the part of this that syntax decides
 * (same return type, one parameter differing); this rule is the part that
 * needs types. Each later signature is reported once, against the first
 * earlier one it cannot be told apart from.
 *
 * The object classification follows the issue's definition and is not
 * exhaustive: a type such as `{ length: number }` also accepts a string or a
 * function structurally. Overload sets are written as `function` declarations
 * in Sumi (D-13), which is the only form this rule reads.
 */
export const noRefinementOverload: Rule = {
  ruleId: 'functions/no-refinement-overload',
  description:
    'Disallow an overload set whose signatures cannot be told apart at run time by arity, `typeof` or a tag; write a single signature (Sumi D-58).',
  messages: {
    indistinguishable:
      'This signature cannot be told apart at run time from the one on line {{line}}: their argument counts overlap, and no position separates them by `typeof` or by a literal tag. One body serves both, so the set only refines the return type (D-58) — write a single signature with a conditional return type or a conditional rest tuple.',
  },
  visit: (node, { checker, sourceFile, report }) => {
    if (!isFunctionDeclaration(node) || node.name === undefined) {
      return;
    }

    const set = overloadSetStartingAt(node, node.name.text);

    if (set === undefined || set.length < 2) {
      return;
    }

    const clauses = set.map((declaration) => clauseOf(checker, declaration));

    for (const [index, later] of clauses.entries()) {
      const earlier = clauses
        .slice(0, index)
        .find((clause) => !isDistinguishable(checker, clause, later));

      if (earlier === undefined) {
        continue;
      }

      const { line } = sourceFile.getLineAndCharacterOfPosition(
        earlier.declaration.getStart(sourceFile),
      );

      report(later.declaration, 'indistinguishable', {
        line: String(line + 1),
      });
    }
  },
} as const;

/**
 * The overload signatures of the set whose first declaration is `node`, or
 * `undefined` when `node` is not the first — so each set is read once. The
 * declarations are adjacent (`functions/adjacent-overload-signatures`), so the
 * set is the run of same-named `function` declarations starting here, minus
 * the implementation. An ambient set (`declare function`) has no
 * implementation and is all signatures.
 */
const overloadSetStartingAt = (
  // `FunctionDeclaration` is TypeScript's own interface, declared mutable.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: FunctionDeclaration,
  name: string,
): readonly FunctionDeclaration[] | undefined => {
  const container = node.parent;

  if (
    !isSourceFile(container) &&
    !isBlock(container) &&
    !isModuleBlock(container)
  ) {
    return undefined;
  }

  const statements: readonly TsNode[] = container.statements;

  const start = statements.indexOf(node);

  if (start === -1) {
    return undefined;
  }

  const sameName = (statement: TsNode | undefined): boolean =>
    statement !== undefined &&
    isFunctionDeclaration(statement) &&
    statement.name?.text === name;

  if (start > 0 && sameName(statements[start - 1])) {
    return undefined;
  }

  const end = statements.findIndex((s, i) => i > start && !sameName(s));

  return statements
    .slice(start, end === -1 ? undefined : end)
    .filter(isFunctionDeclaration)
    .filter((declaration) => declaration.body === undefined);
};

type Clause = Readonly<{
  declaration: FunctionDeclaration;
  signature: Signature | undefined;

  /** Positional parameters, `this` excluded. */
  count: number;

  /** Arguments that must be passed. */
  minArgs: number;
  hasRest: boolean;
}>;

const clauseOf = (
  // `Checker` is TypeScript's own interface, declared mutable; this package
  // does not get to restate it.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  declaration: FunctionDeclaration,
): Clause => {
  const parameters = declaration.parameters.filter(
    (p) => !(isIdentifier(p.name) && p.name.text === 'this'),
  );

  const hasRest = parameters.some((p) => p.dotDotDotToken !== undefined);

  const minArgs = parameters.filter(
    (p) =>
      p.dotDotDotToken === undefined &&
      p.questionToken === undefined &&
      p.initializer === undefined,
  ).length;

  return {
    declaration,
    signature: checker.getSignatureFromDeclaration(declaration),
    count: parameters.length,
    minArgs,
    hasRest,
  } as const;
};

const isDistinguishable = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,
  // A `Clause` holds TypeScript's own declaration and signature, which
  // this package does not get to restate as readonly.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  a: Clause,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  b: Clause,
): boolean => {
  const maxA = a.hasRest ? Number.POSITIVE_INFINITY : a.count;

  const maxB = b.hasRest ? Number.POSITIVE_INFINITY : b.count;

  // 1. Arity.
  if (maxA < b.minArgs || maxB < a.minArgs) {
    return true;
  }

  // A signature whose types cannot be read is not judged.
  if (a.signature === undefined || b.signature === undefined) {
    return true;
  }

  const positions = Math.max(a.count, b.count);

  for (let mut_i = 0; mut_i < positions; mut_i += 1) {
    const typeA = parameterTypeAt(checker, a, mut_i);

    const typeB = parameterTypeAt(checker, b, mut_i);

    const classesA = positionClasses(checker, a, mut_i, typeA);

    const classesB = positionClasses(checker, b, mut_i, typeB);

    // 2. `typeof`.
    if (classesA.isDisjointFrom(classesB)) {
      return true;
    }

    // 3. A tag. Only an object on both sides can carry one, and a side that
    //    may also be absent or a primitive is not separated by it.
    if (
      typeA !== undefined &&
      typeB !== undefined &&
      isObjectOnly(classesA) &&
      isObjectOnly(classesB) &&
      hasDisjointTag(checker, typeA, typeB)
    ) {
      return true;
    }
  }

  return false;
};

/** The parameter type at an argument position, `undefined` if there is none. */
const parameterTypeAt = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  clause: Clause,
  index: number,
): Type | undefined =>
  clause.signature === undefined || (!clause.hasRest && index >= clause.count)
    ? undefined
    : checker.getParameterType(clause.signature, index);

/**
 * The `typeof` classes an argument at `index` may have: those of the
 * parameter type, plus `undefined` where the argument may be left out.
 */
const positionClasses = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  clause: Clause,
  index: number,
  type: Type | undefined,
): ReadonlySet<TypeofClass> => {
  const mayBeAbsent = index >= clause.minArgs;

  if (type === undefined) {
    return mayBeAbsent ? new Set(['undefined']) : allClasses;
  }

  const classes = typeofClasses(checker, type);

  return mayBeAbsent ? classes.union(new Set(['undefined'])) : classes;
};

type TypeofClass =
  | 'bigint'
  | 'boolean'
  | 'function'
  | 'number'
  | 'object'
  | 'string'
  | 'symbol'
  | 'undefined';

const allClasses: ReadonlySet<TypeofClass> = new Set([
  'bigint',
  'boolean',
  'function',
  'number',
  'object',
  'string',
  'symbol',
  'undefined',
]);

const isObjectOnly = (classes: ReadonlySet<TypeofClass>): boolean =>
  classes.size === 1 && classes.has('object');

/** The flags that fix a type's `typeof` class by themselves. */
const primitiveClasses: readonly (readonly [TypeFlags, TypeofClass])[] = [
  [TypeFlags.StringLike, 'string'],
  [TypeFlags.NumberLike, 'number'],
  [TypeFlags.BigIntLike, 'bigint'],
  [TypeFlags.BooleanLike, 'boolean'],
  [TypeFlags.ESSymbolLike, 'symbol'],
  [TypeFlags.VoidLike, 'undefined'],
  // `typeof null` is `'object'`.
  [TypeFlags.Null, 'object'],
] as const;

/**
 * What `typeof` may answer for a value of `type`. Checked in this order
 * because `boolean` and an enum are unions to the checker, and their flags
 * already say everything.
 */
const typeofClasses = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,
  type: Type,
): ReadonlySet<TypeofClass> => {
  if ((type.flags & TypeFlags.AnyOrUnknown) !== 0) {
    return allClasses;
  }

  if ((type.flags & TypeFlags.Never) !== 0) {
    return new Set();
  }

  const primitive = primitiveClasses.find(
    ([flags]) => (type.flags & flags) !== 0,
  );

  if (primitive !== undefined) {
    return new Set([primitive[1]]);
  }

  if (type.isUnionType()) {
    return type
      .getTypes()
      .reduce<ReadonlySet<TypeofClass>>(
        (acc, member) => acc.union(typeofClasses(checker, member)),
        new Set(),
      );
  }

  if (type.isIntersectionType()) {
    // A member with no call signature does not rule out a function, so
    // members are intersected as "object or function" and the whole decides
    // between the two.
    const classes = type
      .getTypes()
      .map((member) => widenObject(typeofClasses(checker, member)))
      .reduce((acc, member) => acc.intersection(member), allClasses);

    return classes.has('function') && classes.has('object')
      ? objectClasses(checker, type)
      : classes;
  }

  if ((type.flags & TypeFlags.NonPrimitive) !== 0) {
    return new Set(['function', 'object']);
  }

  if ((type.flags & TypeFlags.Object) !== 0) {
    return objectClasses(checker, type);
  }

  // A type parameter, an indexed access, a conditional type: what it may be is
  // what its constraint may be.
  const constraint = checker.getBaseConstraintOfType(type);

  return constraint === undefined || constraint.id === type.id
    ? allClasses
    : typeofClasses(checker, constraint);
};

const widenObject = (
  classes: ReadonlySet<TypeofClass>,
): ReadonlySet<TypeofClass> =>
  classes.has('object') ? classes.union(new Set(['function'])) : classes;

const objectClasses = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,
  type: Type,
): ReadonlySet<TypeofClass> =>
  checker.getSignaturesOfType(type, SignatureKind.Call).length > 0 ||
  checker.getSignaturesOfType(type, SignatureKind.Construct).length > 0
    ? new Set(['function'])
    : new Set(['object']);

/**
 * Whether some property both types have is, on each side, a union of literals
 * with no value in common. The names come from `a`: on a union the checker
 * lists only the properties every member has, which is what a discriminant
 * needs.
 */
const hasDisjointTag = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,
  a: Type,
  b: Type,
): boolean =>
  checker.getPropertiesOfType(a).some((property) => {
    const valuesA = tagValues(checker, a, property.name);

    if (valuesA === undefined) {
      return false;
    }

    const valuesB = tagValues(checker, b, property.name);

    return valuesB !== undefined && valuesA.isDisjointFrom(valuesB);
  });

/**
 * The literal values property `name` can hold on `type`, or `undefined` when
 * some member lacks it or it is not a union of literals.
 */
const tagValues = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,
  type: Type,
  name: string,
): ReadonlySet<string> | undefined => {
  const members = type.isUnionType() ? type.getTypes() : ([type] as const);

  const mut_values = new Set<string>();

  for (const member of members) {
    const property = checker.getPropertyOfType(member, name);

    const propertyType =
      property === undefined ? undefined : checker.getTypeOfSymbol(property);

    const literals =
      propertyType === undefined ? ([] as const) : literalKeys(propertyType);

    if (literals === undefined || literals.length === 0) {
      return undefined;
    }

    for (const literal of literals) {
      mut_values.add(literal);
    }
  }

  return mut_values;
};

/** Each literal in `type` as a comparable key, or `undefined` if one is not. */
const literalKeys = (type: Type): readonly string[] | undefined => {
  const members = type.isUnionType() ? type.getTypes() : ([type] as const);

  const keys = members.map((member): string | undefined =>
    member.isLiteralType()
      ? `${typeof member.value}:${String(member.value)}`
      : undefined,
  );

  return keys.every((key) => key !== undefined) ? keys : undefined;
};
