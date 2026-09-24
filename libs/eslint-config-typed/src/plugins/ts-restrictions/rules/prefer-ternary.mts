import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';

type Options = readonly [('always' | 'only-single-line')?];

type MessageIds = 'preferTernary' | 'preferTernarySuggestion';

/**
 * Prefer a ternary expression to an `if` statement that only chooses what to
 * return or what to assign — `unicorn/prefer-ternary`, extended to chains.
 *
 * Everything `unicorn/prefer-ternary` reports is reported here, with the same
 * fix and the same `only-single-line` option:
 *
 * - `if (a) return x; else return y;` and `if (a) return x; return y;` →
 *   `return a ? x : y;`
 * - `if (a) v = x; else v = y;` → `v = a ? x : y;`
 * - `let v = y; if (a) v = x;` → `const v = a ? x : y;`, as a suggestion.
 *
 * ## What it adds
 *
 * unicorn folds one `if` at a time and refuses a branch that already returns a
 * ternary, so a chain is left folded at its last link only:
 *
 * ```ts
 * if (a) return 1;
 * if (b) return 2;
 * return 3;
 * // unicorn stops here, and the `if` above it is never folded:
 * if (a) return 1;
 * return b ? 2 : 3;
 * ```
 *
 * This rule folds the whole chain at once — consecutive `if`s that return,
 * `else if` branches, and a fallback that is itself a ternary — into
 * `return a ? 1 : b ? 2 : 3;`. A ternary is still refused anywhere but in the
 * last position, where nesting it reads as one more `else if`.
 *
 * A chain is reported at its first `if`. A range that contains a comment is
 * reported without a fix, since the fix has nowhere to put it.
 */
export const preferTernary: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer ternary expressions over `if` statements, and chains of them, that only choose what to return or assign.',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [
      {
        type: 'string',
        enum: ['always', 'only-single-line'],
        description:
          'Whether to always prefer ternary, or only when every test and branch is on one line.',
      },
    ],
    messages: {
      preferTernary:
        'This `if` statement can be replaced by a ternary expression.',
      preferTernarySuggestion: 'Use a ternary expression.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const isOnlySingleLine = context.options[0] === 'only-single-line';

    /** The range of `node` together with any parentheses around it. */
    const parenthesizedRange = (
      node: DeepReadonly<TSESTree.Node>,
    ): TSESTree.Range => {
      const depth = parenthesisDepth(node);

      if (depth === 0) return [node.range[0], node.range[1]];

      const opening = sourceCode.getTokenBefore(asNode(node), {
        skip: depth - 1,
      });

      const closing = sourceCode.getTokenAfter(asNode(node), {
        skip: depth - 1,
      });

      return opening === null || closing === null
        ? [node.range[0], node.range[1]]
        : [opening.range[0], closing.range[1]];
    };

    const parenthesisDepth = (node: DeepReadonly<TSESTree.Node>): number => {
      let mut_depth = 0;

      while (
        ASTUtils.isParenthesized(mut_depth + 1, asNode(node), sourceCode)
      ) {
        mut_depth += 1;
      }

      return mut_depth;
    };

    /** The text of `node` as an operand of `?:`, parenthesized if need be. */
    const operandText = (
      node: DeepReadonly<TSESTree.Node> | undefined,
    ): string => {
      if (node === undefined) return 'undefined';

      const text = sourceCode.text.slice(...parenthesizedRange(node));

      return parenthesisDepth(node) === 0 && LOW_PRECEDENCE_TYPES.has(node.type)
        ? `(${text})`
        : text;
    };

    /**
     * The chain as one statement: what every branch starts with (`return `,
     * `v = `), and the values it chooses between. `undefined` when the
     * branches do not start alike or break one of the conditions above.
     */
    const foldChain = (chain: Chain): Folded | undefined => {
      const { arms, fallback } = chain;

      if (arms.some(({ test }) => isTernary(test))) return undefined;

      if (
        isOnlySingleLine &&
        [
          ...arms.flatMap(({ test, body }) => [test, body]),
          ...linesOfFallback(fallback),
        ].some((node) => !isSingleLine(node))
      ) {
        return undefined;
      }

      const leaves: readonly Leaf[] = Arr.toPushed(
        arms.map(({ body }) => body),
        fallback,
      );

      const first = peel(leaves);

      if (first === undefined) return undefined;

      let mut_prefix = first.prefix;

      let mut_leaves = first.leaves;

      for (;;) {
        const next = peel(mut_leaves);

        if (next === undefined) break;

        mut_prefix += next.prefix;

        mut_leaves = next.leaves;
      }

      return { prefix: mut_prefix, leaves: mut_leaves };
    };

    /**
     * One layer every leaf shares: all `return`, or all assigning to the same
     * target with the same operator. Only the last leaf may be a ternary.
     */
    const peel = (
      leaves: readonly Leaf[],
    ): Readonly<{ prefix: string; leaves: readonly Leaf[] }> | undefined => {
      if (
        leaves.every((leaf) => leaf?.type === AST_NODE_TYPES.ReturnStatement)
      ) {
        const returned = leaves.map((leaf) => leaf.argument ?? undefined);

        if (Arr.butLast(returned).some(isTernary)) return undefined;

        // `return a ? true : false` is `return a` or `return !!a`, which is
        // not this rule's to say.
        return returned.every(isBooleanLiteral)
          ? undefined
          : { prefix: 'return ', leaves: returned };
      }

      const [head] = leaves;

      if (head?.type !== AST_NODE_TYPES.AssignmentExpression) return undefined;

      const isSameAssignment = leaves.every(
        (leaf) =>
          leaf?.type === AST_NODE_TYPES.AssignmentExpression &&
          leaf.operator === head.operator &&
          !isTernary(leaf.left) &&
          isSameReference(leaf.left, head.left),
      );

      if (!isSameAssignment) return undefined;

      const assigned = leaves.map((leaf) =>
        leaf?.type === AST_NODE_TYPES.AssignmentExpression
          ? leaf.right
          : undefined,
      );

      if (Arr.butLast(assigned).some(isTernary)) return undefined;

      const [left] = parenthesizedRange(head.left);

      return {
        prefix: `${sourceCode.text.slice(left, head.left.range[1])} ${head.operator} `,
        leaves: assigned,
      };
    };

    /**
     * The report for the chain starting at `node`, and the last statement it
     * covers.
     *
     * A comment in the range leaves nowhere for the fix to put it. Where
     * unicorn would report, that is still reported, without a fix. A chain
     * only this rule would fold is left alone instead: the comments there
     * are nearly always one per guard, saying why it is there, and folding
     * them into a nested ternary by hand would not read better. The part of
     * the chain below the last comment is still checked on its own.
     */
    const chainProblem = (
      node: DeepReadonly<TSESTree.IfStatement>,
    ):
      | Readonly<{
          descriptor: TSESLint.ReportDescriptor<MessageIds>;
          last: DeepReadonly<TSESTree.Node>;
        }>
      | undefined => {
      const chain = collectChain(node);

      if (chain === undefined) return undefined;

      const folded = foldChain(chain);

      if (folded === undefined) return undefined;

      const range: TSESTree.Range = [node.range[0], chain.last.range[1]];

      const problem = {
        node: asNode(node),
        messageId: 'preferTernary',
      } as const;

      const hasTrailingComment =
        chain.last !== node &&
        sourceCode
          .getCommentsAfter(asNode(chain.last))
          .some(
            (comment) => comment.loc.start.line === chain.last.loc.end.line,
          );

      if (hasTrailingComment || hasCommentInRange(range)) {
        return isUnicornShape(chain)
          ? { descriptor: problem, last: chain.last }
          : undefined;
      }

      const choices = chain.arms
        .map(
          ({ test }, index) =>
            `${operandText(test)} ? ${operandText(folded.leaves[index])} : `,
        )
        .join('');

      const fixed = `${folded.prefix}${choices}${operandText(folded.leaves.at(-1))};`;

      const tokenBefore = sourceCode.getTokenBefore(asNode(node));

      const needsSemicolonBefore =
        tokenBefore !== null &&
        !STATEMENT_BOUNDARIES.has(tokenBefore.value) &&
        STARTS_CONTINUING_A_LINE.test(fixed);

      return {
        descriptor: {
          ...problem,
          fix: (fixer) =>
            fixer.replaceTextRange(
              range,
              needsSemicolonBefore ? `;${fixed}` : fixed,
            ),
        },
        last: chain.last,
      };
    };

    /** `let v = y; if (a) v = x;`, suggested as `const v = a ? x : y;`. */
    const letPlusIfProblem = (
      node: DeepReadonly<TSESTree.IfStatement>,
    ): TSESLint.ReportDescriptor<MessageIds> | undefined => {
      if (node.alternate !== null) return undefined;

      const body = nodeBodyOf(node.consequent);

      if (
        body.type !== AST_NODE_TYPES.AssignmentExpression ||
        body.operator !== '='
      ) {
        return undefined;
      }

      const { left, right } = body;

      if (left.type !== AST_NODE_TYPES.Identifier) return undefined;

      if (isTernary(node.test) || isTernary(right)) return undefined;

      if (
        isOnlySingleLine &&
        !(isSingleLine(node.test) && isSingleLine(right))
      ) {
        return undefined;
      }

      const previous = siblingOf(node, -1);

      if (
        previous?.type !== AST_NODE_TYPES.VariableDeclaration ||
        previous.kind !== 'let' ||
        previous.declarations.length !== 1
      ) {
        return undefined;
      }

      const [declarator] = previous.declarations;

      const init = declarator?.init ?? null;

      if (
        init === null ||
        declarator?.id.type !== AST_NODE_TYPES.Identifier ||
        declarator.id.name !== left.name ||
        isTernary(init) ||
        (isOnlySingleLine && !isSingleLine(init)) ||
        ASTUtils.hasSideEffect(asNode(init), sourceCode)
      ) {
        return undefined;
      }

      const variable = ASTUtils.findVariable(
        sourceCode.getScope(asNode(node)),
        asNode<TSESTree.Identifier>(left),
      );

      if (variable === null) return undefined;

      const isInside = (
        reference: DeepReadonly<TSESLint.Scope.Reference>,
        target: DeepReadonly<TSESTree.Node>,
      ): boolean =>
        reference.identifier.range[0] >= target.range[0] &&
        reference.identifier.range[1] <= target.range[1];

      if (
        variable.references.some(
          (reference) =>
            isInside(reference, node.test) || isInside(reference, right),
        )
      ) {
        return undefined;
      }

      const problem = {
        node: asNode(node),
        messageId: 'preferTernary',
      } as const;

      if (hasCommentInRange([previous.range[0], node.range[1]])) return problem;

      const hasOtherWrites = variable.references.some(
        (reference) =>
          reference.init !== true &&
          reference.isWrite() &&
          !isInside(reference, node),
      );

      const letToken = sourceCode.getFirstToken(asNode(previous));

      const lastToken = sourceCode.getLastToken(asNode(previous));

      const nextToken = sourceCode.getTokenAfter(asNode(node));

      const needsSemicolon =
        lastToken?.value !== ';' &&
        nextToken !== null &&
        STARTS_CONTINUING_A_LINE.test(nextToken.value);

      return {
        ...problem,
        suggest: [
          {
            messageId: 'preferTernarySuggestion',
            fix: (fixer) =>
              [
                letToken === null
                  ? undefined
                  : fixer.replaceText(
                      letToken,
                      hasOtherWrites ? 'let' : 'const',
                    ),
                fixer.replaceTextRange(
                  parenthesizedRange(init),
                  `${operandText(node.test)} ? ${operandText(right)} : ${operandText(init)}`,
                ),
                fixer.replaceTextRange(
                  [previous.range[1], node.range[1]],
                  needsSemicolon ? ';' : '',
                ),
              ].filter((fix) => fix !== undefined),
          },
        ],
      };
    };

    const hasCommentInRange = ([
      start,
      end,
    ]: Readonly<TSESTree.Range>): boolean =>
      sourceCode
        .getAllComments()
        .some(
          (comment) => comment.range[0] >= start && comment.range[1] <= end,
        );

    return {
      IfStatement: (node) => {
        // An `else if` is folded, if at all, from the `if` it belongs to.
        if (
          node.parent.type === AST_NODE_TYPES.IfStatement &&
          node.parent.alternate === node
        ) {
          return;
        }

        // Nor is a link reported on its own when the chain above it is.
        const previous = siblingOf(node, -1);

        if (
          previous?.type === AST_NODE_TYPES.IfStatement &&
          (chainProblem(previous)?.last.range[1] ?? 0) >= node.range[1]
        ) {
          return;
        }

        const problem =
          chainProblem(node)?.descriptor ?? letPlusIfProblem(node);

        if (problem !== undefined) context.report(problem);
      },
    };
  },
  defaultOptions: ['always'],
} as const;

type Arm = Readonly<{
  test: DeepReadonly<TSESTree.Expression>;
  body: DeepReadonly<TSESTree.Node>;
}>;

type Chain = Readonly<{
  arms: readonly Arm[];
  fallback: DeepReadonly<TSESTree.Node>;
  /** The last statement the fold replaces; the first is the `if` reported. */
  last: DeepReadonly<TSESTree.Node>;
}>;

/** One branch's value; `undefined` for a bare `return;`. */
type Leaf = DeepReadonly<TSESTree.Node> | undefined;

type Folded = Readonly<{ prefix: string; leaves: readonly Leaf[] }>;

/** Operands that `?:` binds tighter than, and so must be parenthesized. */
const LOW_PRECEDENCE_TYPES: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.AssignmentExpression,
  AST_NODE_TYPES.AwaitExpression,
  AST_NODE_TYPES.SequenceExpression,
  AST_NODE_TYPES.TSAsExpression,
  AST_NODE_TYPES.TSSatisfiesExpression,
  AST_NODE_TYPES.TSTypeAssertion,
  AST_NODE_TYPES.YieldExpression,
]);

/** Tokens after which a statement starts, whatever comes next. */
const STATEMENT_BOUNDARIES: ReadonlySet<string> = new Set([';', '{', '}']);

/** A statement starting so would continue the line before it without `;`. */
const STARTS_CONTINUING_A_LINE = /^[([`+\-/]/u;

const isTernary = (node: DeepReadonly<TSESTree.Node> | undefined): boolean =>
  node?.type === AST_NODE_TYPES.ConditionalExpression;

const isBooleanLiteral = (
  node: DeepReadonly<TSESTree.Node> | undefined,
): boolean =>
  node?.type === AST_NODE_TYPES.Literal && typeof node.value === 'boolean';

/**
 * What a branch comes down to: an expression statement's expression, and a
 * block's one statement. A block of any other length is itself.
 */
const nodeBodyOf = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> => {
  if (node.type === AST_NODE_TYPES.ExpressionStatement) {
    return nodeBodyOf(node.expression);
  }

  if (node.type === AST_NODE_TYPES.BlockStatement) {
    const statements = node.body.filter(
      (statement) => statement.type !== AST_NODE_TYPES.EmptyStatement,
    );

    return Arr.isFixedLengthArray(1, statements)
      ? nodeBodyOf(statements[0])
      : node;
  }

  return node;
};

/**
 * Every branch of the chain starting at `start`, in order, and the
 * fallback that follows the last.
 *
 * A branch with an `else` continues into it. A branch without one
 * continues into the statement after the chain, which it can reach only
 * by not returning — so a branch that falls through must return.
 */
const collectChain = (
  start: DeepReadonly<TSESTree.IfStatement>,
): Chain | undefined => {
  const mut_arms: Arm[] = [];

  let mut_if = start;

  let mut_last: DeepReadonly<TSESTree.Node> = start;

  for (;;) {
    const body = nodeBodyOf(mut_if.consequent);

    mut_arms.push({ test: mut_if.test, body });

    if (mut_if.alternate !== null) {
      const alternate = nodeBodyOf(mut_if.alternate);

      if (alternate.type !== AST_NODE_TYPES.IfStatement) {
        return { arms: mut_arms, fallback: alternate, last: mut_last };
      }

      mut_if = alternate;

      continue;
    }

    if (body.type !== AST_NODE_TYPES.ReturnStatement) return undefined;

    const next = siblingOf(mut_last, 1);

    if (next?.type === AST_NODE_TYPES.ReturnStatement) {
      return { arms: mut_arms, fallback: next, last: next };
    }

    if (next?.type !== AST_NODE_TYPES.IfStatement) return undefined;

    mut_if = next;

    mut_last = next;
  }
};

/**
 * What `only-single-line` measures in the fallback. A ternary there is the
 * rest of the chain, which Prettier wraps one branch per line once it is long;
 * each of its tests and branches has to fit on a line, not the whole.
 */
const linesOfFallback = (
  node: DeepReadonly<TSESTree.Node>,
): readonly DeepReadonly<TSESTree.Node>[] => {
  const value = chosenValueOf(node);

  return value?.type === AST_NODE_TYPES.ConditionalExpression
    ? branchesOf(value)
    : [node];
};

const branchesOf = (
  node: DeepReadonly<TSESTree.Expression>,
): readonly DeepReadonly<TSESTree.Node>[] =>
  node.type === AST_NODE_TYPES.ConditionalExpression
    ? ([node.test, node.consequent, ...branchesOf(node.alternate)] as const)
    : ([node] as const);

/**
 * Whether `unicorn/prefer-ternary` would report the chain too: one `if`, and a
 * fallback that is not already a ternary.
 */
const isUnicornShape = (chain: Chain): boolean =>
  Arr.isFixedLengthArray(1, chain.arms) &&
  !isTernary(chosenValueOf(chain.fallback));

/** What a `return` returns, or what an assignment assigns. */
const chosenValueOf = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> | undefined =>
  node.type === AST_NODE_TYPES.ReturnStatement
    ? (node.argument ?? undefined)
    : node.type === AST_NODE_TYPES.AssignmentExpression
      ? node.right
      : undefined;

const isSingleLine = (node: DeepReadonly<TSESTree.Node>): boolean =>
  node.loc.start.line === node.loc.end.line;

/**
 * The statement next to `node` in the list it is one of — the only place a
 * branch that returns can fall through to what follows it.
 */
const siblingOf = (
  node: DeepReadonly<TSESTree.Node>,
  offset: 1 | -1,
): DeepReadonly<TSESTree.Node> | undefined => {
  const list = statementListOf(node);

  if (list === undefined) return undefined;

  const index = list.indexOf(node);

  return index === -1 ? undefined : list[index + offset];
};

const statementListOf = (
  node: DeepReadonly<TSESTree.Node>,
): readonly DeepReadonly<TSESTree.Node>[] | undefined => {
  const { parent } = node;

  if (parent === undefined) return undefined;

  if (
    parent.type === AST_NODE_TYPES.Program ||
    parent.type === AST_NODE_TYPES.BlockStatement ||
    parent.type === AST_NODE_TYPES.StaticBlock ||
    parent.type === AST_NODE_TYPES.TSModuleBlock
  ) {
    return parent.body;
  }

  return parent.type === AST_NODE_TYPES.SwitchCase
    ? parent.consequent
    : undefined;
};

/** Whether two assignment targets are the same, as `x.y` and `x['y']` are. */
const isSameReference = (
  left: DeepReadonly<TSESTree.Node>,
  right: DeepReadonly<TSESTree.Node>,
): boolean => {
  if (
    left.type === AST_NODE_TYPES.Super ||
    left.type === AST_NODE_TYPES.ThisExpression
  ) {
    return right.type === left.type;
  }

  if (
    left.type === AST_NODE_TYPES.Identifier ||
    left.type === AST_NODE_TYPES.PrivateIdentifier
  ) {
    return right.type === left.type && right.name === left.name;
  }

  if (left.type === AST_NODE_TYPES.Literal) {
    return right.type === left.type && right.value === left.value;
  }

  if (
    left.type !== AST_NODE_TYPES.MemberExpression ||
    right.type !== AST_NODE_TYPES.MemberExpression
  ) {
    return false;
  }

  const name = staticPropertyName(left);

  return name === undefined
    ? left.computed === right.computed &&
        isSameReference(left.object, right.object) &&
        isSameReference(left.property, right.property)
    : name === staticPropertyName(right) &&
        isSameReference(left.object, right.object);
};

const staticPropertyName = (
  node: DeepReadonly<TSESTree.MemberExpression>,
): string | undefined => {
  if (!node.computed) {
    return node.property.type === AST_NODE_TYPES.PrivateIdentifier
      ? `#${node.property.name}`
      : node.property.name;
  }

  const value = ASTUtils.getStaticValue(asNode(node.property))?.value;

  // `x[0]` and `x['0']` name the same property.
  return typeof value === 'string'
    ? value
    : typeof value === 'number' || typeof value === 'bigint'
      ? value.toString()
      : undefined;
};

/**
 * The `@typescript-eslint/utils` helpers take mutable nodes; the rule only
 * ever reads them.
 */
const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;
