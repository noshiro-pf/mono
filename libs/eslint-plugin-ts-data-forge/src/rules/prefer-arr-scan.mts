import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { type FixedLengthTuple } from 'ts-type-forge';
import * as ts from 'typescript';
import {
  buildImportFixes,
  getNamedImports,
  getTsDataForgeImport,
} from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'preferArrScanPrefix' | 'preferArrScanAccumulate';

/** Array methods that cut a prefix or a suffix out of the array they are called on. */
const SLICING_METHODS: ReadonlySet<string> = new Set(['slice', 'subarray']);

/** A `map` call whose callback ignores the element it is handed. */
type PrefixCandidate = Readonly<{
  call: TSESTree.CallExpression;
  /** Source text of the array being mapped, as written. */
  arrayText: string;
  body: TSESTree.Node;
  /** Every place the callback reads its index parameter. */
  indexReads: readonly TSESTree.Node[];
}>;

/** A `slice` / `subarray` call, wherever it appears. */
type SliceCall = Readonly<{
  call: TSESTree.CallExpression;
  /** Source text of the array being sliced, as written. */
  arrayText: string;
}>;

/** A `reduce` call that spreads its accumulator into a new array. */
type AccumulationCandidate = Readonly<{
  call: TSESTree.CallExpression;
  /**
   * What the call is replaced with, or `undefined` when the rewrite could not
   * be derived and the report carries no fix.
   */
  replacement: string | undefined;
}>;

/**
 * A `reduce` callback that appends one value to its accumulator, in either of
 * the two spellings this repository's rules produce.
 */
type Accumulation = Readonly<{
  accumulatorParam: TSESTree.Identifier;
  /** The reference to the accumulator that the rewrite drops. */
  accumulatorRef: TSESTree.Node;
  /** The value appended on this step. */
  element: TSESTree.Expression;
}>;

/** One source range and the text that takes its place. */
type Splice = Readonly<{ range: FixedLengthTuple<2, number>; text: string }>;

/**
 * Report an accumulated value that is rebuilt from scratch for every element,
 * and point at `Arr.scan` from ts-data-forge.
 *
 * ## Why
 *
 * Two shapes compute what `Arr.scan` computes — a value carried from one
 * element to the next — by re-deriving it from the whole prefix each time.
 *
 * ```ts
 * // (1) the prefix rebuilt per element: `slice` allocates, and the combining
 * //     function runs over the whole prefix again. O(n²).
 * segments.map((_, index) =>
 *   path.resolve(root, ...segments.slice(0, index + 1)),
 * );
 *
 * // one pass — and `scan` puts the initial value at the head of its result,
 * // which here is exactly "the root, then each ancestor below it"
 * Arr.scan(
 *   segments,
 *   (ancestor, segment) => path.resolve(ancestor, segment),
 *   root,
 * );
 * ```
 *
 * ```ts
 * // (2) the accumulator copied on every step, for the same O(n²)
 * xs.reduce<readonly number[]>((acc, x) => [...acc, (acc.at(-1) ?? 0) + x], [0]);
 *
 * Arr.scan(xs, (total, x) => total + x, 0);
 * ```
 *
 * The complexity is the smaller half of it. What the rebuilt form loses is the
 * name of what is being accumulated: (1) says "for each index, combine
 * everything up to it", and a reader has to turn that back into "carry a value
 * along" before the code says what it does.
 *
 * ## Why only one of the two is fixed
 *
 * **(1) cannot be fixed at all**, and the obstacle is not difficulty. Turning
 * `f(seed, ...xs.slice(0, i + 1))` into a `scan` is only valid if
 * `f(seed, a, b, c) === f(f(f(seed, a), b), c)` — that the variadic callee is a
 * left fold. That is a semantic property of the callee, invisible in the AST
 * and in the type: `path.resolve` and `Math.max` have it, `Array.of` and
 * `console.log` do not. Nothing static licenses the rewrite, so this shape is
 * reported and left to a reader. The direction is a second obstacle —
 * `slice(0, i + 1)` runs forwards while `slice(0, xs.length - i)` runs
 * backwards and needs the result reversed — and the length a third, `scan`
 * putting the initial value at the head where `map` has n elements.
 *
 * **(2) is fixed**, because none of those three apply to it: the combining
 * function is the callback body itself, there is no slice and so no direction
 * to infer, and the lengths already agree — a `reduce` seeded with `[init]`
 * yields n+1 elements and so does `Arr.scan(xs, f, init)`.
 *
 * The fix is withheld unless every one of these holds, since each is what makes
 * the two forms equal rather than merely similar:
 *
 * - the initial value is a one-element array literal `[E]`, so `scan`'s initial
 *   value is `E`;
 * - the body is exactly `[...acc, ELEMENT]` — one spread of the accumulator and
 *   one new element, since `scan` appends exactly one value per step;
 * - every other mention of the accumulator in `ELEMENT` is `acc.at(-1)`, and
 *   there is at least one. `scan` hands its callback the previous *value*, not
 *   the prefix, so `acc.length`, `acc[0]` or `acc.filter(...)` cannot be
 *   expressed and block the fix. `at(-1)` is the only spelling substituted:
 *   `Arr.last` returns an `Optional`, not the element, so it is not a
 *   substitution at all;
 * - the parameters are plain identifiers with no type annotations — an
 *   annotation on the accumulator describes the array, and would be wrong on
 *   `scan`'s value parameter — and there are at most three of them, `reduce`'s
 *   fourth parameter (the whole array) having no counterpart in `scan`.
 *
 * `acc.at(-1)` is typed `T | undefined` while `scan`'s accumulator is `S`, so a
 * `?? fallback` guarding it becomes redundant after the fix. It is left in
 * place rather than removed: it evaluates identically either way, and deciding
 * that it is dead needs to know that `S` excludes `undefined`, which is type
 * information this rule does not take.
 *
 * ## What is not reported
 *
 * A `map` callback that reads its element parameter. Rebuilding a prefix *and*
 * using the current element is not an accumulation spelled out the long way:
 * `scan` hands its callback the accumulated value and the element, never the
 * prefix, so such a callback is not one it can express.
 *
 * The array has to be spelled the same way in the `map` and in the `slice`.
 * Deciding that two differently written expressions denote one array needs type
 * information and would still be a guess about aliasing.
 */
export const preferArrScan: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Report an accumulated value rebuilt from scratch for every element — `xs.map((_, i) => f(...xs.slice(0, i + 1)))`, or a `reduce` that spreads its accumulator into a new array — and point at `Arr.scan` from ts-data-forge, which does the same in one pass',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferArrScanPrefix:
        'This rebuilds a prefix of `{{array}}` for every element, so the combining function runs over the whole prefix again each time. `Arr.scan` from ts-data-forge carries the value from one element to the next in a single pass, with the initial value at the head of the result.',
      preferArrScanAccumulate:
        'Rebuilding the accumulator array on every step copies it each time. `Arr.scan` from ts-data-forge accumulates in one pass and returns the initial value followed by every intermediate one.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsDataForgeImport = getTsDataForgeImport(program);

    const services = sourceCode.parserServices;

    const checker = services?.program?.getTypeChecker();

    /**
     * Whether the value at `node` can be `null` or `undefined`. Answers `true`
     * without type information, which is the conservative direction: it only
     * ever keeps a `?? fallback` that could have been removed.
     */
    const isNullish = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      node: TSESTree.Node,
    ): boolean => {
      const tsNode = services?.esTreeNodeToTSNodeMap?.get(node);

      if (checker === undefined || tsNode === undefined) return true;

      const type = checker.getTypeAtLocation(tsNode);

      return (type.isUnion() ? type.types : [type]).some(
        (constituent) =>
          (constituent.flags &
            (ts.TypeFlags.Null |
              ts.TypeFlags.Undefined |
              ts.TypeFlags.Void |
              ts.TypeFlags.Any |
              ts.TypeFlags.Unknown)) !==
          0,
      );
    };

    const mut_candidates: PrefixCandidate[] = [];

    const mut_slices: SliceCall[] = [];

    const mut_accumulations: AccumulationCandidate[] = [];

    /**
     * The text `xs.reduce(...)` is replaced with, or `undefined` when one of the
     * conditions that make the two forms equal does not hold. See the rule
     * documentation for what each of them rules out.
     */
    const scanReplacementFor = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      call: TSESTree.CallExpression,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      callback: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      initial: TSESTree.Node,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      accumulation: Accumulation,
    ): string | undefined => {
      if (callback.async || callback.generator) return undefined;

      // `reduce`'s fourth parameter is the whole array, which `scan` never
      // hands its callback; an annotation on the accumulator describes that
      // array, and would be wrong on `scan`'s value parameter.
      if (
        callback.params.length < 2 ||
        callback.params.length > 3 ||
        callback.params.some(
          (param) =>
            param.type !== AST_NODE_TYPES.Identifier ||
            param.typeAnnotation !== undefined,
        )
      ) {
        return undefined;
      }

      const { accumulatorParam, accumulatorRef, element } = accumulation;

      // `scan`'s initial value is the single element the reduce was seeded with.
      if (
        initial.type !== AST_NODE_TYPES.ArrayExpression ||
        !Arr.isFixedLengthArray(1, initial.elements)
      ) {
        return undefined;
      }

      const [seed] = initial.elements;

      if (seed === null || seed.type === AST_NODE_TYPES.SpreadElement) {
        return undefined;
      }

      const scope = sourceCode.getScope(callback);

      const accumulator = scope.variables.find(
        (variable) => variable.name === accumulatorParam.name,
      );

      if (accumulator === undefined) return undefined;

      // `acc.at(-1)` is `T | undefined` only because `at` can go out of bounds,
      // which a seeded accumulator never does. So once the value `scan` carries
      // is known not to be nullish, a `?? fallback` guarding the read is dead
      // and the fix takes it with the read — leaving it would hand the author an
      // unnecessary condition that no rule can fix for them.
      const carriesNullish = isNullish(seed) || isNullish(element);

      const mut_lastReads: Splice[] = [];

      for (const reference of accumulator.references) {
        const identifier = reference.identifier;

        // The `...acc` / `Arr.toPushed(acc, …)` target the rewrite drops.
        if (identifier === accumulatorRef) continue;

        if (identifier.type !== AST_NODE_TYPES.Identifier) return undefined;

        const lastRead = enclosingLastRead(identifier);

        if (lastRead === undefined) return undefined;

        const guard = carriesNullish ? undefined : nullishGuardAround(lastRead);

        mut_lastReads.push({
          range: (guard ?? lastRead).range,
          text: accumulatorParam.name,
        });
      }

      // Two reads inside one `?? ` — `acc.at(-1) ?? acc.at(-1)` — would give
      // ranges that contain one another, which no ordering of splices resolves.
      if (overlaps(mut_lastReads)) return undefined;

      // With no read of the previous value this is a `map` with a seed rather
      // than a scan, and the accumulator parameter would be left unused.
      if (mut_lastReads.length === 0) return undefined;

      const parameterText = callback.params
        .map((param) => sourceCode.getText(param))
        .join(', ');

      const elementText = applySplices(
        sourceCode.getText(element),
        element.range[0],
        mut_lastReads,
      );

      const arrayText = sourceCode.getText(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (call.callee as TSESTree.MemberExpression).object,
      );

      return `Arr.scan(${arrayText}, (${parameterText}) => ${elementText}, ${sourceCode.getText(seed)})`;
    };

    /**
     * The places a `map` callback reads its index parameter, or `undefined`
     * when the callback is not of the shape this rule looks for — the wrong
     * arity, a destructured parameter, or an element parameter it actually
     * reads.
     */
    const indexReadsOf = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      callback: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ): readonly TSESTree.Node[] | undefined => {
      if (!Arr.isFixedLengthArray(2, callback.params)) return undefined;

      const [elementParam, indexParam] = callback.params;

      if (
        elementParam.type !== AST_NODE_TYPES.Identifier ||
        indexParam.type !== AST_NODE_TYPES.Identifier
      ) {
        return undefined;
      }

      const scope = sourceCode.getScope(callback);

      const elementVariable = scope.variables.find(
        (variable) => variable.name === elementParam.name,
      );

      const indexVariable = scope.variables.find(
        (variable) => variable.name === indexParam.name,
      );

      if (elementVariable === undefined || indexVariable === undefined) {
        return undefined;
      }

      if (elementVariable.references.length > 0) return undefined;

      return indexVariable.references.map(
        (reference) => reference.identifier as TSESTree.Node,
      );
    };

    return {
      CallExpression: (node) => {
        if (
          node.callee.type !== AST_NODE_TYPES.MemberExpression ||
          node.callee.computed ||
          node.callee.property.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        const methodName = node.callee.property.name;

        const arrayText = sourceCode.getText(node.callee.object);

        if (SLICING_METHODS.has(methodName)) {
          mut_slices.push({ call: node, arrayText });
        }

        const [callback, ...rest] = node.arguments;

        if (
          callback === undefined ||
          (callback.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
            callback.type !== AST_NODE_TYPES.FunctionExpression)
        ) {
          return;
        }

        switch (methodName) {
          case 'map': {
            if (rest.length > 0) break;

            const indexReads = indexReadsOf(callback);

            if (indexReads === undefined) break;

            mut_candidates.push({
              call: node,
              arrayText,
              body: callback.body,
              indexReads,
            });

            break;
          }

          case 'reduce': {
            // Two arguments, so that the initial value is explicit: a `reduce`
            // without one starts from the first element and has no `scan`
            // spelling at all.
            if (rest.length !== 1 || !appendsToItsAccumulator(callback)) break;

            const [initial] = rest;

            const accumulation = accumulationOf(callback);

            mut_accumulations.push({
              call: node,
              replacement:
                initial === undefined || accumulation === undefined
                  ? undefined
                  : scanReplacementFor(node, callback, initial, accumulation),
            });

            break;
          }

          default:
            break;
        }
      },

      // Deferred to the end so that a `slice` nested inside the callback has
      // been seen by the time its `map` is judged, whichever order the traversal
      // reached them in.
      'Program:exit': () => {
        const hasArrImport = getNamedImports(tsDataForgeImport).includes('Arr');

        // The import is inserted once per pass: two fixes writing the same
        // insertion point would otherwise produce it twice.
        const mut_importNeededBy = hasArrImport
          ? undefined
          : mut_accumulations.find(
              (accumulation) => accumulation.replacement !== undefined,
            )?.call;

        for (const accumulation of mut_accumulations) {
          const { call, replacement } = accumulation;

          context.report({
            node: call,
            messageId: 'preferArrScanAccumulate',
            fix:
              replacement === undefined
                ? undefined
                : (fixer) => [
                    ...(call === mut_importNeededBy
                      ? buildImportFixes(fixer, program, tsDataForgeImport, [
                          'Arr',
                        ])
                      : []),
                    fixer.replaceText(call, replacement),
                  ],
          });
        }

        for (const candidate of mut_candidates) {
          const rebuild = mut_slices.find(
            (slice) =>
              slice.arrayText === candidate.arrayText &&
              encloses(candidate.body, slice.call) &&
              candidate.indexReads.some((read) =>
                slice.call.arguments.some((argument) =>
                  encloses(argument, read),
                ),
              ),
          );

          if (rebuild === undefined) continue;

          context.report({
            node: candidate.call,
            messageId: 'preferArrScanPrefix',
            data: { array: candidate.arrayText },
          });
        }
      },
    };
  },
  defaultOptions: [],
} as const;

/**
 * The `acc.at(-1)` call an accumulator reference sits at the head of, or
 * `undefined` when the reference is used in any other way — which is what
 * withholds the fix, `scan` having no prefix to offer.
 */
const enclosingLastRead = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  identifier: TSESTree.Identifier,
): TSESTree.CallExpression | undefined => {
  const member = identifier.parent;

  if (
    member.type !== AST_NODE_TYPES.MemberExpression ||
    member.object !== identifier ||
    member.computed ||
    member.property.type !== AST_NODE_TYPES.Identifier ||
    member.property.name !== 'at'
  ) {
    return undefined;
  }

  const call = member.parent;

  if (
    call.type !== AST_NODE_TYPES.CallExpression ||
    call.callee !== member ||
    !Arr.isFixedLengthArray(1, call.arguments)
  ) {
    return undefined;
  }

  const [argument] = call.arguments;

  // `at(-1)` only: any other index is not the previous value.
  return argument.type === AST_NODE_TYPES.UnaryExpression &&
    argument.operator === '-' &&
    argument.argument.type === AST_NODE_TYPES.Literal &&
    argument.argument.value === 1
    ? call
    : undefined;
};

/**
 * The `X ?? fallback` that `read` is the left-hand side of, if it is one.
 */
const nullishGuardAround = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  read: TSESTree.CallExpression,
): TSESTree.LogicalExpression | undefined => {
  const parent = read.parent;

  return parent.type === AST_NODE_TYPES.LogicalExpression &&
    parent.operator === '??' &&
    parent.left === read
    ? parent
    : undefined;
};

/** Whether any two of the splices cover overlapping source. */
const overlaps = (splices: readonly Splice[]): boolean =>
  splices
    .toSorted((a, b) => a.range[0] - b.range[0])
    .some(
      (splice, index, sorted) =>
        index > 0 && splice.range[0] < (sorted[index - 1]?.range[1] ?? 0),
    );

/**
 * `text`, which starts at `offset` in the file, with each splice applied.
 * Right to left, so that an earlier replacement does not move a later range.
 */
const applySplices = (
  text: string,
  offset: number,
  splices: readonly Splice[],
): string =>
  splices
    .toSorted((a, b) => b.range[0] - a.range[0])
    .reduce(
      (mut_text, splice) =>
        `${mut_text.slice(0, splice.range[0] - offset)}${splice.text}${mut_text.slice(splice.range[1] - offset)}`,
      text,
    );

/**
 * Whether `inner` lies inside `outer`. Ranges rather than parent pointers,
 * because the two nodes are reached from different visitor calls.
 */
const encloses = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  outer: TSESTree.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  inner: TSESTree.Node,
): boolean =>
  outer.range[0] <= inner.range[0] && inner.range[1] <= outer.range[1];

/**
 * Whether the callback's body appends to its own accumulator at all — the
 * O(n²) shape this rule reports, in either spelling and whatever it appends.
 * Deliberately looser than {@link accumulationOf}: appending two values per
 * step is still worth reporting, it is only the rewrite that cannot express it.
 */
const appendsToItsAccumulator = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  callback: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
): boolean => {
  const [accumulatorParam] = callback.params;

  if (accumulatorParam?.type !== AST_NODE_TYPES.Identifier) return false;

  const { body } = callback;

  const spelling =
    body.type === AST_NODE_TYPES.ArrayExpression
      ? body.elements[0]
      : body.type === AST_NODE_TYPES.CallExpression &&
          body.callee.type === AST_NODE_TYPES.MemberExpression &&
          !body.callee.computed &&
          body.callee.property.type === AST_NODE_TYPES.Identifier &&
          body.callee.property.name === 'toPushed'
        ? body.arguments[0]
        : undefined;

  const target =
    spelling?.type === AST_NODE_TYPES.SpreadElement
      ? spelling.argument
      : spelling;

  return (
    target?.type === AST_NODE_TYPES.Identifier &&
    target.name === accumulatorParam.name
  );
};

/**
 * The append this `reduce` callback performs, or `undefined` when its body is
 * not one. Two spellings mean the same thing here, and both have to be
 * recognized: `[...acc, x]` as written, and `Arr.toPushed(acc, x)`, which is
 * what `ts-data-forge/prefer-canonical-array-slicing` rewrites the first into.
 * Seeing only the first would leave this rule blind after a single `--fix`
 * pass, with the O(n²) accumulation still there under the other spelling.
 */
const accumulationOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  callback: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
): Accumulation | undefined => {
  const [accumulatorParam] = callback.params;

  if (accumulatorParam?.type !== AST_NODE_TYPES.Identifier) return undefined;

  const { body } = callback;

  // `[...acc, ELEMENT]` — exactly one spread and one new value, since `scan`
  // appends exactly one per step.
  if (body.type === AST_NODE_TYPES.ArrayExpression) {
    if (!Arr.isFixedLengthArray(2, body.elements)) return undefined;

    const [spread, element] = body.elements;

    return element === null ||
      element.type === AST_NODE_TYPES.SpreadElement ||
      spread?.type !== AST_NODE_TYPES.SpreadElement ||
      spread.argument.type !== AST_NODE_TYPES.Identifier ||
      spread.argument.name !== accumulatorParam.name
      ? undefined
      : { accumulatorParam, accumulatorRef: spread.argument, element };
  }

  // `Arr.toPushed(acc, ELEMENT)`, matched on the method name as the rest of
  // this rule matches `slice` and `at`.
  if (body.type === AST_NODE_TYPES.CallExpression) {
    const { callee } = body;

    if (
      callee.type !== AST_NODE_TYPES.MemberExpression ||
      callee.computed ||
      callee.property.type !== AST_NODE_TYPES.Identifier ||
      callee.property.name !== 'toPushed' ||
      !Arr.isFixedLengthArray(2, body.arguments)
    ) {
      return undefined;
    }

    const [target, element] = body.arguments;

    return element.type === AST_NODE_TYPES.SpreadElement ||
      target.type !== AST_NODE_TYPES.Identifier ||
      target.name !== accumulatorParam.name
      ? undefined
      : { accumulatorParam, accumulatorRef: target, element };
  }

  return undefined;
};
