import { Arr } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import { type DeepReadonly } from 'ts-type-forge';
import { hasDisableNextLineComment } from '../functions/index.mjs';
import { type TsMorphTransformer } from './types.mjs';

const TRANSFORMER_NAME = 'enable-no-unchecked-indexed-access';

/**
 * Appends `!` to the index accesses that turning on the
 * [`noUncheckedIndexedAccess`](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess)
 * compiler option would turn into type errors, as a stopgap while the option
 * is being enabled.
 *
 * The rewrite is driven by the type checker rather than by syntax: the file is
 * checked twice, once with `noUncheckedIndexedAccess` off and once with it on,
 * and `!` is appended only where the option is what added `undefined` to the
 * expression's type. Consequently an index whose presence the type already
 * guarantees keeps its access untouched — `[T, T][1]`, `[T, T, ...T[]][0]`,
 * and `({ a: T })['a']` are all left as they are, as is an element type that
 * contained `undefined` to begin with.
 *
 * Both spellings of an index read are covered, because the option widens both:
 * `rec['a']` and the dotted `rec.a` of a type carrying an index signature.
 *
 * `strictNullChecks` is turned on for both checks, because
 * `noUncheckedIndexedAccess` does nothing without it and the project the
 * transformer is handed may not have it on.
 *
 * The result is a stopgap, not a fix, and wants reviewing. A file transformed
 * on its own — which is how {@link transformSourceCode} drives every
 * transformer here — resolves neither a type from another module nor a
 * narrowing that depends on an imported type guard, and the latter produces
 * assertions a whole-program check does not need. Most of those are reported
 * by `@typescript-eslint/no-unnecessary-type-assertion`, whose fixer removes
 * them; what no rule can see is an assertion that makes a later check dead,
 * as the `if` of `const v = xs[0]!; if (v === undefined) …` now is.
 *
 * @example
 * ```ts
 * declare const xs: readonly number[];
 * declare const pair: readonly [number, number];
 * declare const rec: Record<string, number>;
 * declare const known: { a: number };
 *
 * xs[0].toFixed(); // -> xs[0]!.toFixed();
 * rec['a'].toFixed(); // -> rec['a']!.toFixed();
 * rec.a.toFixed(); // -> rec.a!.toFixed();
 * pair[1].toFixed(); // -> pair[1].toFixed(); (guaranteed to exist)
 * known.a.toFixed(); // -> known.a.toFixed(); (guaranteed to exist)
 * ```
 */
export const enableNoUncheckedIndexedAccessTransformer = (
  options?: EnableNoUncheckedIndexedAccessTransformerOptions,
): TsMorphTransformer => {
  const optionsInternal: EnableNoUncheckedIndexedAccessTransformerOptionsInternal =
    {
      applyLevel: options?.applyLevel ?? 'all',
      debugPrint: options?.debug === true ? console.debug : () => {},
    } as const;

  return {
    name: TRANSFORMER_NAME,
    transform: (sourceAst) => {
      const positions = collectAssertionPositions(sourceAst, optionsInternal);

      if (Arr.isEmpty(positions)) {
        return;
      }

      // One text edit for the whole file: `insertText` forgets every
      // descendant node, so inserting one `!` at a time would reparse the
      // file once per assertion.
      sourceAst.replaceText(
        [0, sourceAst.getEnd()],
        insertNonNullAssertions(sourceAst.getFullText(), positions),
      );
    },
  };
};

export type EnableNoUncheckedIndexedAccessTransformerOptions = DeepReadonly<{
  /**
   * How eagerly `!` is appended.
   *
   * - `"all"`: append it to every read whose type `noUncheckedIndexedAccess`
   *   widens with `undefined`, so that as few type errors as possible remain.
   * - `"avoidWhereUndefinedIsAllowed"`: additionally leave the access alone
   *   where its contextual type already accepts `undefined` (e.g.
   *   `const x: number | undefined = xs[0];` or an argument of a
   *   `(x: number | undefined) => void` parameter), which produces fewer but
   *   only load-bearing assertions.
   *
   * @default "all"
   */
  applyLevel?: 'all' | 'avoidWhereUndefinedIsAllowed';

  debug?: boolean;
}>;

type EnableNoUncheckedIndexedAccessTransformerOptionsInternal = DeepReadonly<{
  applyLevel: 'all' | 'avoidWhereUndefinedIsAllowed';
  debugPrint: (...args: readonly unknown[]) => void;
}>;

/**
 * An index read that `noUncheckedIndexedAccess` can widen: an element access,
 * and the dotted spelling of the same thing on a type with an index signature
 * (`rec.a`, which the option widens exactly as it widens `rec['a']`).
 */
type IndexReadExpression =
  tsm.ElementAccessExpression | tsm.PropertyAccessExpression;

/**
 * Returns the positions at which a `!` has to be inserted, i.e. the end
 * offsets of the reads whose type `noUncheckedIndexedAccess` widens with
 * `undefined`.
 */
const collectAssertionPositions = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceAst: tsm.SourceFile,
  options: EnableNoUncheckedIndexedAccessTransformerOptionsInternal,
): readonly number[] => {
  const candidates: readonly IndexReadExpression[] = [
    ...sourceAst.getDescendantsOfKind(tsm.SyntaxKind.ElementAccessExpression),
    ...sourceAst.getDescendantsOfKind(tsm.SyntaxKind.PropertyAccessExpression),
  ].filter(
    (node) => isAssertableReadPosition(node) && !isIgnoredByComment(node),
  );

  if (Arr.isEmpty(candidates)) {
    return [];
  }

  const project = sourceAst.getProject();

  const originalOptions = project.getCompilerOptions();

  try {
    // With the option on first, because that narrows the candidates down to
    // the few reads worth checking a second time. `strictNullChecks` comes
    // with it: `noUncheckedIndexedAccess` does nothing without it, and the
    // project handed to the transformer may not have it on.
    project.compilerOptions.set({
      strictNullChecks: true,
      noUncheckedIndexedAccess: true,
    });

    const widened = candidates.filter(
      (node) =>
        typeIncludesUndefined(node.getType()) &&
        !(
          options.applyLevel === 'avoidWhereUndefinedIsAllowed' &&
          contextAcceptsUndefined(node)
        ),
    );

    if (Arr.isEmpty(widened)) {
      return [];
    }

    project.compilerOptions.set({ noUncheckedIndexedAccess: false });

    // What is possibly `undefined` without the option too is not the option's
    // doing — the element type says so, or the expression is erroneous (an
    // unresolved import resolves to `any`, which is never widened).
    return widened
      .filter((node) => !typeIncludesUndefined(node.getType()))
      .map((node) => {
        options.debugPrint(`${node.getText()} -> ${node.getText()}!`);

        return node.getEnd();
      });
  } finally {
    // `set` merges, so the two options overridden above have to be named
    // explicitly: they are absent from `originalOptions` when the project did
    // not carry them, and would otherwise stay overridden for whichever
    // transformer runs next.
    project.compilerOptions.set({
      ...originalOptions,
      strictNullChecks: originalOptions.strictNullChecks,
      noUncheckedIndexedAccess: originalOptions.noUncheckedIndexedAccess,
    });
  }
};

const insertNonNullAssertions = (
  fullText: string,
  positions: readonly number[],
): string => {
  const mut_parts: string[] = [];

  let mut_restStart: number = 0;

  for (const position of positions.toSorted((a, b) => a - b)) {
    mut_parts.push(fullText.slice(mut_restStart, position), '!');

    mut_restStart = position;
  }

  mut_parts.push(fullText.slice(mut_restStart));

  return mut_parts.join('');
};

const typeIncludesUndefined = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: tsm.Type,
): boolean =>
  type.isUndefined() ||
  (type.isUnion() && type.getUnionTypes().some((t) => t.isUndefined()));

/**
 * Whether the position the access sits in already accepts `undefined`, in
 * which case `noUncheckedIndexedAccess` reports nothing there and the
 * assertion would only be noise.
 */
const contextAcceptsUndefined = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: IndexReadExpression,
): boolean => {
  const contextualType = node.getContextualType();

  return (
    contextualType !== undefined &&
    (contextualType.isAny() ||
      contextualType.isUnknown() ||
      typeIncludesUndefined(contextualType))
  );
};

const isIgnoredByComment = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: IndexReadExpression,
): boolean => {
  if (hasDisableNextLineComment(node, TRANSFORMER_NAME)) {
    return true;
  }

  // An index access is rarely the first thing on its own line, so the comment
  // that covers it is the one above the statement it appears in.
  const statement = node.getFirstAncestor((ancestor) =>
    tsm.Node.isStatement(ancestor),
  );

  return (
    statement !== undefined &&
    hasDisableNextLineComment(statement, TRANSFORMER_NAME)
  );
};

/**
 * Whether a `!` appended to this access would be both syntactically valid and
 * meaningful.
 *
 * Note that most write positions need no rule of their own: TypeScript gives
 * the target of an assignment the element type without `undefined`, so the
 * type comparison in {@link collectAssertionPositions} already passes them
 * over. The exceptions handled here are the ones it does widen.
 */
const isAssertableReadPosition = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: IndexReadExpression,
): boolean => {
  const parent = node.getParent();

  if (parent === undefined) {
    return false;
  }

  return (
    !isAlreadyAssertedOrGuarded(node, parent) &&
    !isWriteTarget(node, parent) &&
    !isTestedForAbsence(node, parent)
  );
};

/** `xs[0]!`, `xs[0] as T`, `<T>xs[0]`, `xs[0]?.foo`, `xs[0]?.()`, `xs[0]?.[1]`. */
const isAlreadyAssertedOrGuarded = (
  node: tsm.Node,
  parent: tsm.Node,
): boolean => {
  if (
    parent.isKind(tsm.SyntaxKind.NonNullExpression) ||
    parent.isKind(tsm.SyntaxKind.AsExpression) ||
    parent.isKind(tsm.SyntaxKind.TypeAssertionExpression)
  ) {
    return true;
  }

  if (isInOptionalChain(node)) {
    return true;
  }

  // Only the object of the optional chain is guarded; an index argument such
  // as the `xs[0]` of `m?.[xs[0]]` is not.
  return (
    (parent.isKind(tsm.SyntaxKind.PropertyAccessExpression) ||
      parent.isKind(tsm.SyntaxKind.ElementAccessExpression) ||
      parent.isKind(tsm.SyntaxKind.CallExpression)) &&
    parent.hasQuestionDotToken() &&
    parent.getExpression() === node
  );
};

/**
 * Whether the read sits in an optional chain that can short-circuit before it,
 * as the `xs[0]?.toFixed` of `xs[0]?.toFixed()` does. `undefined` in such a
 * type comes from the chain rather than from the index, and the chain already
 * accounts for it; asserting there would assert away the author's own `?.`.
 *
 * Parentheses end a chain (`(a?.b).c` is not one), which is why the walk stops
 * at anything that is not a chain link.
 */
const isInOptionalChain = (node: tsm.Node): boolean => {
  if (
    node.isKind(tsm.SyntaxKind.PropertyAccessExpression) ||
    node.isKind(tsm.SyntaxKind.ElementAccessExpression) ||
    node.isKind(tsm.SyntaxKind.CallExpression)
  ) {
    return (
      node.hasQuestionDotToken() || isInOptionalChain(node.getExpression())
    );
  }

  return (
    node.isKind(tsm.SyntaxKind.NonNullExpression) &&
    isInOptionalChain(node.getExpression())
  );
};

/**
 * Positions that write the value rather than read it, where `!` cannot be
 * appended at all: an assignment target is not an expression (`xs[0]! = 1`
 * does not parse as an assignment), and `delete xs[0]!` and `xs[0]!++` are
 * equally invalid.
 *
 * `xs[0] += 1` is the one case this leaves a type error behind: its left-hand
 * side is read as well as written, so `noUncheckedIndexedAccess` reports it,
 * but no assertion can be spelled there.
 */
const isWriteTarget = (node: tsm.Node, parent: tsm.Node): boolean => {
  if (
    parent.isKind(tsm.SyntaxKind.DeleteExpression) ||
    parent.isKind(tsm.SyntaxKind.PostfixUnaryExpression)
  ) {
    return true;
  }

  if (parent.isKind(tsm.SyntaxKind.PrefixUnaryExpression)) {
    const operator = parent.getOperatorToken();

    return (
      operator === tsm.SyntaxKind.PlusPlusToken ||
      operator === tsm.SyntaxKind.MinusMinusToken
    );
  }

  if (
    parent.isKind(tsm.SyntaxKind.ForOfStatement) ||
    parent.isKind(tsm.SyntaxKind.ForInStatement)
  ) {
    return parent.getInitializer() === node;
  }

  return (
    parent.isKind(tsm.SyntaxKind.BinaryExpression) &&
    parent.getLeft() === node &&
    isAssignmentOperatorKind(parent.getOperatorToken().getKind())
  );
};

/**
 * Positions that read the access precisely to find out whether the value is
 * there — a truthiness check, an equality comparison, `??`, `typeof`. None of
 * them is an error under `noUncheckedIndexedAccess`, and asserting inside one
 * would defeat the check it performs (`case undefined:` would stop compiling
 * against an asserted `switch` subject).
 */
const isTestedForAbsence = (node: tsm.Node, parent: tsm.Node): boolean => {
  if (parent.isKind(tsm.SyntaxKind.TypeOfExpression)) {
    return true;
  }

  if (parent.isKind(tsm.SyntaxKind.PrefixUnaryExpression)) {
    return parent.getOperatorToken() === tsm.SyntaxKind.ExclamationToken;
  }

  if (parent.isKind(tsm.SyntaxKind.BinaryExpression)) {
    const operator = parent.getOperatorToken().getKind();

    return (
      equalityOperatorKinds.includes(operator) ||
      (parent.getLeft() === node &&
        shortCircuitOperatorKinds.includes(operator))
    );
  }

  if (
    parent.isKind(tsm.SyntaxKind.IfStatement) ||
    parent.isKind(tsm.SyntaxKind.WhileStatement) ||
    parent.isKind(tsm.SyntaxKind.DoStatement) ||
    parent.isKind(tsm.SyntaxKind.SwitchStatement)
  ) {
    return parent.getExpression() === node;
  }

  if (parent.isKind(tsm.SyntaxKind.ForStatement)) {
    return parent.getCondition() === node;
  }

  return (
    parent.isKind(tsm.SyntaxKind.ConditionalExpression) &&
    parent.getCondition() === node
  );
};

/**
 * `=` through `^=`, i.e. every assignment operator. TypeScript keeps them in
 * one contiguous block of {@link tsm.SyntaxKind} and marks its ends, which is
 * how the compiler itself recognizes them.
 */
const isAssignmentOperatorKind = (kind: tsm.SyntaxKind): boolean =>
  tsm.SyntaxKind.FirstAssignment <= kind &&
  kind <= tsm.SyntaxKind.LastAssignment;

const equalityOperatorKinds: readonly tsm.SyntaxKind[] = [
  tsm.SyntaxKind.EqualsEqualsToken,
  tsm.SyntaxKind.EqualsEqualsEqualsToken,
  tsm.SyntaxKind.ExclamationEqualsToken,
  tsm.SyntaxKind.ExclamationEqualsEqualsToken,
] as const;

const shortCircuitOperatorKinds: readonly tsm.SyntaxKind[] = [
  tsm.SyntaxKind.QuestionQuestionToken,
  tsm.SyntaxKind.AmpersandAmpersandToken,
  tsm.SyntaxKind.BarBarToken,
] as const;
