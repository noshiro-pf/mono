import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import * as ts from 'typescript';
import {
  buildImportFixes,
  getImportedLocalName,
  getTsDataForgeImport,
} from './import-utils.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

type Options = readonly [];

type MessageIds = 'preferCanonicalArraySlicing';

/**
 * A canonical ts-data-forge `Arr` operation a detected pattern is rewritten to:
 *
 * - `tail` / `butLast` — drop the first / last element
 * - `skip N` / `take N` — drop / keep the first `N` elements
 * - `skipLast N` / `takeLast N` — drop / keep the last `N` elements
 * - `toUnshifted item` / `toPushed item` — prepend / append one element
 *   (`toUnshifted` is emitted in its curried form `toUnshifted(item)(xs)` so
 *   the new element keeps the leading position it had in `[item, ...xs]`)
 */
type CopyOp = Readonly<
  | { fn: 'butLast' | 'tail' }
  | { fn: 'skip' | 'skipLast' | 'take' | 'takeLast'; count: number }
  | { fn: 'toPushed' | 'toUnshifted'; itemText: string }
>;

/** `skip 1` / `skipLast 1` have dedicated single-element names. */
const normalizeCountedOp = (
  fn: 'skip' | 'skipLast' | 'take' | 'takeLast',
  count: number,
): CopyOp | undefined =>
  count < 1
    ? undefined
    : fn === 'skip' && count === 1
      ? ({ fn: 'tail' } as const)
      : fn === 'skipLast' && count === 1
        ? ({ fn: 'butLast' } as const)
        : ({ fn, count } as const);

const asNonNegativeIntegerLiteral = (
  node: TSESTree.Node,
): number | undefined =>
  node.type === AST_NODE_TYPES.Literal &&
  typeof node.value === 'number' &&
  Number.isInteger(node.value) &&
  node.value >= 0
    ? node.value
    : undefined;

/** Matches `-N` (unary minus of a positive integer literal) and returns `N`. */
const asNegatedPositiveIntegerLiteral = (
  node: TSESTree.Node,
): number | undefined => {
  if (
    node.type !== AST_NODE_TYPES.UnaryExpression ||
    node.operator !== '-' ||
    node.argument.type !== AST_NODE_TYPES.Literal
  ) {
    return undefined;
  }

  const n = asNonNegativeIntegerLiteral(node.argument);

  return n !== undefined && n >= 1 ? n : undefined;
};

/**
 * Whether re-reading the expression is free of side effects (a plain variable
 * or a non-computed property chain). Required for patterns that reference the
 * receiver twice, such as `xs.filter((_, i) => i < xs.length - 1)`.
 */
const isSimpleReference = (node: TSESTree.Node): boolean =>
  node.type === AST_NODE_TYPES.Identifier ||
  node.type === AST_NODE_TYPES.ThisExpression ||
  (node.type === AST_NODE_TYPES.MemberExpression &&
    !node.computed &&
    node.property.type === AST_NODE_TYPES.Identifier &&
    isSimpleReference(node.object));

const rootIdentifierName = (node: TSESTree.Node): string | undefined =>
  node.type === AST_NODE_TYPES.Identifier
    ? node.name
    : node.type === AST_NODE_TYPES.MemberExpression
      ? rootIdentifierName(node.object)
      : undefined;

type ComparisonOperator = '!==' | '<' | '<=' | '>' | '>=';

const COMPARISON_OPERATORS: ReadonlySet<string> = new Set([
  '!==',
  '<',
  '<=',
  '>',
  '>=',
] as const satisfies readonly ComparisonOperator[]);

/** Mirror of each comparison when its operands are swapped. */
const FLIPPED_OPERATORS = {
  '!==': '!==',
  '<': '>',
  '<=': '>=',
  '>': '<',
  '>=': '<=',
} as const satisfies Record<ComparisonOperator, ComparisonOperator>;

/** Classifies `index OP N` (a comparison against an integer literal). */
const classifyLiteralComparison = (
  op: ComparisonOperator,
  n: number,
): CopyOp | undefined => {
  switch (op) {
    case '>=':
      return normalizeCountedOp('skip', n);

    case '>':
      return normalizeCountedOp('skip', n + 1);

    case '!==':
      return n === 0 ? { fn: 'tail' } : undefined;

    case '<':
      return normalizeCountedOp('take', n);

    case '<=':
      return normalizeCountedOp('take', n + 1);
  }
};

/** Classifies `index OP <xs>.length - M`. */
const classifyLengthComparison = (
  op: ComparisonOperator,
  m: number,
): CopyOp | undefined => {
  switch (op) {
    case '<':
      return normalizeCountedOp('skipLast', m);

    case '<=':
      return normalizeCountedOp('skipLast', m - 1);

    case '!==':
      return m === 1 ? { fn: 'butLast' } : undefined;

    case '>=':
      return normalizeCountedOp('takeLast', m);

    case '>':
      return normalizeCountedOp('takeLast', m - 1);
  }
};

export const preferCanonicalArraySlicing: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Unify non-mutating array element addition/removal patterns (`slice` / `toSpliced` / `filter` / `concat` / spread) into the corresponding ts-data-forge functions: `Arr.tail`, `Arr.skip`, `Arr.take`, `Arr.butLast`, `Arr.skipLast`, `Arr.takeLast`, `Arr.toUnshifted`, `Arr.toPushed`.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferCanonicalArraySlicing:
        'Replace with `{{replacement}}` from ts-data-forge.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsDataForgeImport = getTsDataForgeImport(program);

    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    /**
     * The in-scope way to reference the `Arr` namespace: a named import
     * (possibly aliased), a namespace import member, or the canonical `Arr`
     * (added by the import fix when nothing is imported yet).
     */
    const arrLocalName = getImportedLocalName(tsDataForgeImport, 'Arr');

    const namespaceLocalName = tsDataForgeImport?.specifiers.find(
      (specifier) => specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier,
    )?.local.name;

    const arrRef =
      arrLocalName ??
      (namespaceLocalName === undefined ? 'Arr' : `${namespaceLocalName}.Arr`);

    const needsArrImport =
      arrLocalName === undefined && namespaceLocalName === undefined;

    /**
     * Deferred (non-concrete) types are reduced to their base constraint
     * before checking; `any` / `unknown` are conservatively not array-like.
     */
    const isArrayOrTupleType = (type: ts.Type): boolean => {
      if ((type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) !== 0) {
        return false;
      }

      if (type.isUnion()) {
        return type.types.every(isArrayOrTupleType);
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

        return constraint !== undefined && isArrayOrTupleType(constraint);
      }

      return checker.isArrayType(type) || checker.isTupleType(type);
    };

    const getTypeOf = (node: TSESTree.Node): ts.Type =>
      checker.getTypeAtLocation(parserServices.esTreeNodeToTSNodeMap.get(node));

    /**
     * `true` only when the type can never be an array in any branch, so
     * `xs.concat(v)` is guaranteed to append `v` as one element rather than
     * flattening it.
     */
    const isDefinitelyNotArrayType = (type: ts.Type): boolean => {
      if ((type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) !== 0) {
        return false;
      }

      if (type.isUnion()) {
        return type.types.every(isDefinitelyNotArrayType);
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

        return constraint !== undefined && isDefinitelyNotArrayType(constraint);
      }

      return !checker.isArrayType(type) && !checker.isTupleType(type);
    };

    /** Argument-position text; a comma (sequence) expression needs parens. */
    const toArgText = (node: TSESTree.Node): string => {
      const text = sourceCode.getText(node);

      return node.type === AST_NODE_TYPES.SequenceExpression
        ? `(${text})`
        : text;
    };

    const toReplacementText = (op: CopyOp, xsText: string): string => {
      switch (op.fn) {
        case 'tail':
        case 'butLast':
          return `${arrRef}.${op.fn}(${xsText})`;

        case 'skip':
        case 'take':
        case 'skipLast':
        case 'takeLast':
          return `${arrRef}.${op.fn}(${xsText}, ${op.count})`;

        // Emit the curried form for `toUnshifted` so the new element stays in
        // the same textual position as in the `[item, ...xs]` source, keeping
        // the rewrite easy to read.
        case 'toUnshifted':
          return `${arrRef}.toUnshifted(${op.itemText})(${xsText})`;

        case 'toPushed':
          return `${arrRef}.toPushed(${xsText}, ${op.itemText})`;
      }
    };

    const mut_nodesToFix: {
      node: TSESTree.Node;
      replacement: string;
    }[] = [];

    const report = (node: TSESTree.Node, op: CopyOp, xsText: string): void => {
      mut_nodesToFix.push({
        node,
        replacement: toReplacementText(op, xsText),
      });
    };

    /** Matches `<xsText>.length` (non-computed). */
    const isReceiverLengthAccess = (
      node: TSESTree.Node,
      receiverText: string,
    ): boolean =>
      node.type === AST_NODE_TYPES.MemberExpression &&
      !node.computed &&
      node.property.type === AST_NODE_TYPES.Identifier &&
      node.property.name === 'length' &&
      sourceCode.getText(node.object) === receiverText;

    /** Matches `<xsText>.length - M` (M ≥ 1) and returns `M`. */
    const matchLengthMinus = (
      node: TSESTree.Node,
      receiverText: string,
    ): number | undefined => {
      if (
        node.type !== AST_NODE_TYPES.BinaryExpression ||
        node.operator !== '-' ||
        !isReceiverLengthAccess(node.left, receiverText)
      ) {
        return undefined;
      }

      const m = asNonNegativeIntegerLiteral(node.right);

      return m !== undefined && m >= 1 ? m : undefined;
    };

    /**
     * Matches an index-only filter callback (`(_, i) => <comparison>`) and
     * classifies the comparison. Both a leading index (`i >= 1`) and a
     * trailing index (`1 <= i`) operand order are accepted.
     */
    const classifyFilterCallback = (
      callback: TSESTree.CallExpressionArgument,
      receiver: TSESTree.Expression,
      receiverText: string,
    ): CopyOp | undefined => {
      if (
        callback.type !== AST_NODE_TYPES.ArrowFunctionExpression ||
        callback.async ||
        callback.body.type === AST_NODE_TYPES.BlockStatement ||
        callback.params.length !== 2
      ) {
        return undefined;
      }

      const [elementParam, indexParam] = callback.params;

      if (
        elementParam === undefined ||
        indexParam === undefined ||
        elementParam.type !== AST_NODE_TYPES.Identifier ||
        indexParam.type !== AST_NODE_TYPES.Identifier
      ) {
        return undefined;
      }

      // A callback parameter shadowing the receiver's root binding (e.g.
      // `xs.filter((xs, i) => i < xs.length - 1)`) would make the textual
      // `xs.length` comparison refer to the element, not the receiver.
      const receiverRoot = rootIdentifierName(receiver);

      if (
        receiverRoot !== undefined &&
        (elementParam.name === receiverRoot || indexParam.name === receiverRoot)
      ) {
        return undefined;
      }

      const body = callback.body;

      if (
        body.type !== AST_NODE_TYPES.BinaryExpression ||
        !COMPARISON_OPERATORS.has(body.operator)
      ) {
        return undefined;
      }

      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      const rawOperator = body.operator as ComparisonOperator;

      const isIndex = (side: TSESTree.Node): boolean =>
        side.type === AST_NODE_TYPES.Identifier &&
        side.name === indexParam.name;

      const [op, other] = isIndex(body.left)
        ? ([rawOperator, body.right] as const)
        : isIndex(body.right)
          ? ([FLIPPED_OPERATORS[rawOperator], body.left] as const)
          : [undefined, undefined];

      // `op` and `other` are set together (both from the same tuple), so
      // checking `op` also guarantees `other` is defined.
      if (op === undefined || isIndex(other)) {
        return undefined;
      }

      // The element parameter must not participate in the comparison (only
      // the index side and a receiver-independent bound are recognized, so
      // reaching here with an element reference is impossible for literals,
      // but `xs.length - N` needs a stable receiver).
      const n = asNonNegativeIntegerLiteral(other);

      if (n !== undefined) {
        return classifyLiteralComparison(op, n);
      }

      if (!isSimpleReference(receiver)) return undefined;

      const m = matchLengthMinus(other, receiverText);

      return m === undefined ? undefined : classifyLengthComparison(op, m);
    };

    const classifySliceArgs = (
      args: readonly TSESTree.CallExpressionArgument[],
      receiver: TSESTree.Expression,
    ): CopyOp | undefined => {
      if (args.length === 1) {
        const [start] = args;

        if (start === undefined) return undefined;

        const n = asNonNegativeIntegerLiteral(start);

        if (n !== undefined) return normalizeCountedOp('skip', n);

        const negated = asNegatedPositiveIntegerLiteral(start);

        return negated === undefined
          ? undefined
          : normalizeCountedOp('takeLast', negated);
      }

      if (args.length === 2) {
        const [start, end] = args;

        if (
          start === undefined ||
          end === undefined ||
          asNonNegativeIntegerLiteral(start) !== 0
        ) {
          return undefined;
        }

        const n = asNonNegativeIntegerLiteral(end);

        if (n !== undefined) return normalizeCountedOp('take', n);

        const negated = asNegatedPositiveIntegerLiteral(end);

        if (negated !== undefined) {
          return normalizeCountedOp('skipLast', negated);
        }

        if (!isSimpleReference(receiver)) return undefined;

        const m = matchLengthMinus(end, sourceCode.getText(receiver));

        return m === undefined ? undefined : normalizeCountedOp('skipLast', m);
      }

      return undefined;
    };

    const classifyToSplicedArgs = (
      args: readonly TSESTree.CallExpressionArgument[],
      receiver: TSESTree.Expression,
      receiverText: string,
    ): CopyOp | undefined => {
      if (args.length === 1) {
        const [start] = args;

        if (start === undefined) return undefined;

        const n = asNonNegativeIntegerLiteral(start);

        // `xs.toSpliced(N)` removes everything from index N on → take N.
        if (n !== undefined) return normalizeCountedOp('take', n);

        const negated = asNegatedPositiveIntegerLiteral(start);

        // `xs.toSpliced(-N)` removes the last N elements → skipLast N.
        return negated === undefined
          ? undefined
          : normalizeCountedOp('skipLast', negated);
      }

      if (args.length === 2) {
        const [start, deleteCount] = args;

        if (
          start === undefined ||
          deleteCount === undefined ||
          asNonNegativeIntegerLiteral(start) !== 0
        ) {
          return undefined;
        }

        // `xs.toSpliced(0, N)` removes the first N elements → skip N.
        const n = asNonNegativeIntegerLiteral(deleteCount);

        if (n !== undefined) return normalizeCountedOp('skip', n);

        // `xs.toSpliced(0, xs.length - N)` keeps the last N → takeLast N.
        // (Note: `xs.toSpliced(0, -N)` clamps the delete count to 0 and is a
        // plain copy, so it is deliberately NOT treated as takeLast.)
        if (!isSimpleReference(receiver)) return undefined;

        const m = matchLengthMinus(deleteCount, receiverText);

        return m === undefined ? undefined : normalizeCountedOp('takeLast', m);
      }

      if (args.length === 3) {
        const [start, deleteCount, item] = args;

        if (
          start === undefined ||
          deleteCount === undefined ||
          item === undefined ||
          item.type === AST_NODE_TYPES.SpreadElement ||
          asNonNegativeIntegerLiteral(deleteCount) !== 0
        ) {
          return undefined;
        }

        // `xs.toSpliced(0, 0, item)` prepends → toUnshifted.
        if (asNonNegativeIntegerLiteral(start) === 0) {
          return { fn: 'toUnshifted', itemText: toArgText(item) };
        }

        // `xs.toSpliced(xs.length, 0, item)` appends → toPushed.
        if (
          isSimpleReference(receiver) &&
          isReceiverLengthAccess(start, receiverText)
        ) {
          return { fn: 'toPushed', itemText: toArgText(item) };
        }

        return undefined;
      }

      return undefined;
    };

    return {
      CallExpression: (node) => {
        const callee = node.callee;

        if (
          callee.type !== AST_NODE_TYPES.MemberExpression ||
          callee.computed ||
          callee.property.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        const methodName = callee.property.name;

        const receiver = callee.object;

        // `Arr.skip(xs, 1)` → `Arr.tail(xs)`, `Arr.skipLast(xs, 1)` →
        // `Arr.butLast(xs)` (also via a namespace import or an alias).
        if (methodName === 'skip' || methodName === 'skipLast') {
          const isArrObject =
            (receiver.type === AST_NODE_TYPES.Identifier &&
              receiver.name === arrLocalName) ||
            (receiver.type === AST_NODE_TYPES.MemberExpression &&
              !receiver.computed &&
              receiver.object.type === AST_NODE_TYPES.Identifier &&
              receiver.object.name === namespaceLocalName &&
              receiver.property.type === AST_NODE_TYPES.Identifier &&
              receiver.property.name === 'Arr');

          const [arrayArg, countArg] = node.arguments;

          if (
            isArrObject &&
            node.arguments.length === 2 &&
            arrayArg !== undefined &&
            arrayArg.type !== AST_NODE_TYPES.SpreadElement &&
            countArg !== undefined &&
            asNonNegativeIntegerLiteral(countArg) === 1
          ) {
            report(
              node,
              { fn: methodName === 'skip' ? 'tail' : 'butLast' },
              toArgText(arrayArg),
            );
          }

          return;
        }

        // `[item].concat(xs)` → `Arr.toUnshifted(xs, item)`.
        if (
          methodName === 'concat' &&
          receiver.type === AST_NODE_TYPES.ArrayExpression
        ) {
          const [element] = receiver.elements;

          const [arg] = node.arguments;

          if (
            receiver.elements.length === 1 &&
            element !== null &&
            element !== undefined &&
            element.type !== AST_NODE_TYPES.SpreadElement &&
            node.arguments.length === 1 &&
            arg !== undefined &&
            arg.type !== AST_NODE_TYPES.SpreadElement &&
            isArrayOrTupleType(getTypeOf(arg))
          ) {
            report(
              node,
              { fn: 'toUnshifted', itemText: toArgText(element) },
              toArgText(arg),
            );
          }

          return;
        }

        if (
          methodName !== 'slice' &&
          methodName !== 'toSpliced' &&
          methodName !== 'filter' &&
          methodName !== 'concat'
        ) {
          return;
        }

        // The receiver must be an array or tuple (not a string / typed array
        // / other object that happens to share the method name).
        if (!isArrayOrTupleType(getTypeOf(receiver))) return;

        const receiverText = sourceCode.getText(receiver);

        switch (methodName) {
          case 'slice': {
            const op = classifySliceArgs(node.arguments, receiver);

            if (op !== undefined) report(node, op, toArgText(receiver));

            return;
          }

          case 'toSpliced': {
            const op = classifyToSplicedArgs(
              node.arguments,
              receiver,
              receiverText,
            );

            if (op !== undefined) report(node, op, toArgText(receiver));

            return;
          }

          case 'filter': {
            const [callback] = node.arguments;

            if (callback === undefined || node.arguments.length !== 1) {
              return;
            }

            const op = classifyFilterCallback(callback, receiver, receiverText);

            if (op !== undefined) report(node, op, toArgText(receiver));

            return;
          }

          case 'concat': {
            const [arg] = node.arguments;

            if (
              node.arguments.length !== 1 ||
              arg === undefined ||
              arg.type === AST_NODE_TYPES.SpreadElement
            ) {
              return;
            }

            // `xs.concat([item])` → `Arr.toPushed(xs, item)`.
            if (arg.type === AST_NODE_TYPES.ArrayExpression) {
              const [element] = arg.elements;

              if (
                arg.elements.length === 1 &&
                element !== null &&
                element !== undefined &&
                element.type !== AST_NODE_TYPES.SpreadElement
              ) {
                report(
                  node,
                  { fn: 'toPushed', itemText: toArgText(element) },
                  toArgText(receiver),
                );
              }

              return;
            }

            // `xs.concat(item)` appends only when `item` can never be an
            // array (otherwise `concat` would flatten it).
            if (isDefinitelyNotArrayType(getTypeOf(arg))) {
              report(
                node,
                { fn: 'toPushed', itemText: toArgText(arg) },
                toArgText(receiver),
              );
            }
          }
        }
      },

      ArrayExpression: (node) => {
        // `[item, ...xs]` → `Arr.toUnshifted(xs, item)`,
        // `[...xs, item]` → `Arr.toPushed(xs, item)`.
        if (node.elements.length !== 2) return;

        const [first, second] = node.elements;

        if (
          first === null ||
          first === undefined ||
          second === null ||
          second === undefined
        ) {
          return;
        }

        const [spread, item, fn] =
          first.type === AST_NODE_TYPES.SpreadElement &&
          second.type !== AST_NODE_TYPES.SpreadElement
            ? ([first, second, 'toPushed'] as const)
            : first.type !== AST_NODE_TYPES.SpreadElement &&
                second.type === AST_NODE_TYPES.SpreadElement
              ? ([second, first, 'toUnshifted'] as const)
              : [undefined, undefined, undefined];

        // `spread`, `item`, and `fn` are set together (all from the same
        // tuple), so checking `spread` also guarantees the others are
        // defined.
        if (spread === undefined) return;

        // Spreading a non-array iterable (`[v, ...someSet]`) is a genuine
        // conversion, not an element addition to an array.
        if (!isArrayOrTupleType(getTypeOf(spread.argument))) return;

        report(
          node,
          { fn, itemText: toArgText(item) },
          toArgText(spread.argument),
        );
      },

      'Program:exit': () => {
        for (const [index, nodeInfo] of mut_nodesToFix.entries()) {
          context.report({
            node: nodeInfo.node,
            messageId: 'preferCanonicalArraySlicing',
            data: { replacement: nodeInfo.replacement },
            fix: (fixer) => {
              const importFixes =
                index === 0 && needsArrImport
                  ? buildImportFixes(fixer, program, tsDataForgeImport, ['Arr'])
                  : [];

              return [
                ...importFixes,
                fixer.replaceText(nodeInfo.node, nodeInfo.replacement),
              ];
            },
          });
        }
      },
    };
  },
  defaultOptions: [],
} as const;

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types */
