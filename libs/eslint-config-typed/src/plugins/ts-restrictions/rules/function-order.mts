import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isTypeWrapper, skipTypeWrappers } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly, FixedLengthTuple, StrictPick } from 'ts-type-forge';

type Options = readonly [];

type MessageIds = 'calleeAfterCaller' | 'exportedAfterHelper';

/**
 * Enforce the order of a module's top-level functions that its file
 * organization rule asks for: exported functions before the module's own
 * helpers, and among the helpers, one that another calls before its caller —
 * lower-level first.
 *
 * ## What counts
 *
 * A **function** is a top-level `function` declaration, a top-level `const`
 * with one declarator whose initializer is an arrow function or a `function`
 * expression, or such an expression after `export default`, each read through
 * `as`, `satisfies`, `!`, `<T>` and parentheses. A `const` holding anything
 * else — `memo(...)`, `memoize(...)`, a call that returns a function — is not
 * one: its initializer runs when the module loads, so its place is decided by
 * what it reads.
 *
 * It is **exported** when it carries `export` or `export default`, or is named
 * by `export { ... }` (not `export type { ... }`), `export default name` or
 * `export =`.
 *
 * A **helper** is a function that is not exported and that the module does not
 * refer to while it loads. A function referred to outside every function body
 * — called by `await main()` at the top level, passed by name to
 * `memoize(...)` or read by a constant — is an entry point rather than a
 * helper: where it goes
 * is decided by when it runs (a `const` read at load time must come before
 * the statement reading it), so the rule leaves it where it is, and the
 * helpers it calls are not ordered against it. That is what lets a script
 * keep `main` at the top and call it at the bottom.
 *
 * A function called where it is written — `void (async () => { await main();
 * })()` — runs while the module loads, so its body counts as outside every
 * function body.
 *
 * Helper `a` **calls** helper `b` when `b` is referred to anywhere in `a`'s
 * body, called or not (`xs.map(b)` counts). A reference in a type
 * (`typeof b`) does not.
 *
 * ## What is reported
 *
 * - **A helper below one of its callers.** Mutual recursion has no order to
 *   ask for, so calls between helpers that reach each other are ignored;
 *   their calls to other helpers are not.
 * - **An exported function below a helper.**
 *
 * ## What is not
 *
 * - **Types and constants.** A type has no runtime position, and the React
 *   component layout puts `type Props` above the component; a constant is
 *   often computed from a helper while the module loads, which pins it below
 *   that helper. Neither can be placed by a rule without contradicting one of
 *   those.
 * - **A memoized component** (`export const C = memo((props) => ...)`): its
 *   initializer is a call, so it is not a function in the sense above. The
 *   helpers below it are still ordered among themselves.
 * - **Code that is not at the top level**, and functions an exported one
 *   calls: exported functions come first whatever they call.
 *
 * ## Fix
 *
 * The fix moves the reported function up — a helper above its first caller,
 * an exported function above the first helper — together with its overload
 * signatures, the comments directly above it (no blank line between) and a
 * comment after it on the same line. Moving a function declaration, or a
 * `const` whose initializer is a function expression, to an earlier position
 * cannot change what the module does: evaluating either has no effect, and a
 * binding that exists earlier cannot be read before it exists. No fix is
 * offered above the file's first statement when a shebang, a triple-slash
 * directive or a pragma (`@jsxImportSource`, `@ts-nocheck`) precedes it, which
 * has to stay first, where an overload
 * signature stands apart from the others, for a
 * statement sharing a line with another, where removing it would join the
 * statements around it into one expression (a statement above it with no
 * semicolon), or in a file with `\r\n` line endings. Nor is one offered where
 * a top-level comment with a blank line after it stands above where the
 * function would go or anywhere between there and the function: that may be a
 * section heading or a note about what follows it, and the rule cannot tell
 * whether the move belongs above it or below. Nor where the function would
 * cross a comment that applies to a stretch of the file (`eslint-disable`,
 * `oxlint-disable`, `cspell:disable`, `#region`,
 * `embed-sample-code-ignore-above`): moving it in or out of that stretch
 * changes what the comment covers.
 */
export const functionOrder: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Require a module's exported functions before its non-exported helpers, and a helper before the helpers that call it",
    },
    fixable: 'code',
    schema: [],
    messages: {
      calleeAfterCaller:
        '`{{callee}}` is called by `{{caller}}`, which comes before it. Move `{{callee}}` above `{{caller}}`: a helper comes before the helpers that call it.',
      exportedAfterHelper:
        'Exported function `{{name}}` comes after the helper `{{helper}}`. Move it above the helpers: exported functions come first.',
    },
    defaultOptions: [],
  },

  create: (context) => ({
    Program: (program) => {
      const { sourceCode } = context;

      const functions = collectFunctions(program);

      const { eager, callersOf } = analyzeReferences(sourceCode, functions);

      const fixContext: FixContext = {
        sourceCode,
        hasCarriageReturn: sourceCode.text.includes('\r'),
        comments: sourceCode.getAllComments(),
      };

      const helpers = functions.filter(
        (f) => !f.exported && f.id !== undefined && !eager.has(f),
      );

      const helperSet: ReadonlySet<TopLevelFunction> =
        new Set<TopLevelFunction>(helpers);

      const helperCallers: ReadonlyMap<
        TopLevelFunction,
        readonly TopLevelFunction[]
      > = new Map<TopLevelFunction, readonly TopLevelFunction[]>(
        helpers.map(
          (f) =>
            [
              f,
              Array.from(callersOf.get(f) ?? []).filter((c) =>
                helperSet.has(c),
              ),
            ] as const,
        ),
      );

      const helperCallersOf = (
        f: TopLevelFunction,
      ): readonly TopLevelFunction[] => helperCallers.get(f) ?? [];

      const componentOf = stronglyConnectedComponents(helpers, helperCallersOf);

      for (const callee of helpers) {
        const firstCallerAbove = helperCallersOf(callee)
          .filter(
            (caller) =>
              caller.index < callee.index &&
              componentOf.get(caller) !== componentOf.get(callee),
          )
          .toSorted((a, b) => a.index - b.index)
          .at(0);

        if (firstCallerAbove !== undefined) {
          context.report({
            node: asNode(callee.id ?? callee.statement),
            messageId: 'calleeAfterCaller',
            data: {
              callee: callee.id?.name ?? '',
              caller: firstCallerAbove.id?.name ?? '',
            },
            fix: moveAbove(fixContext, callee, firstCallerAbove),
          });
        }
      }

      const firstHelper = helpers.at(0);

      if (firstHelper === undefined) {
        return;
      }

      for (const f of functions) {
        if (f.exported && f.index > firstHelper.index) {
          context.report({
            node: asNode(f.id ?? f.statement),
            messageId: 'exportedAfterHelper',
            data: {
              name: f.id?.name ?? 'default',
              helper: firstHelper.id?.name ?? '',
            },
            fix: moveAbove(fixContext, f, firstHelper),
          });
        }
      }
    },
  }),
} as const;

type TopLevelFunction = DeepReadonly<{
  /** The statement directly under `Program`, `export` included. */
  statement: TSESTree.ProgramStatement;
  /**
   * The first of the overload signatures directly above `statement`, or
   * `statement` itself when it has none.
   */
  first: TSESTree.ProgramStatement;
  /**
   * The node whose declared variable is the function's binding; `undefined`
   * for `export default () => ...`, which has none.
   */
  declarator:
    TSESTree.FunctionDeclaration | TSESTree.VariableDeclarator | undefined;
  /** `undefined` for an anonymous `export default`. */
  id: TSESTree.Identifier | undefined;
  index: number;
  exported: boolean;
  /** `false` when an overload signature of it stands apart from the others. */
  movable: boolean;
}>;

type ReferenceSite = DeepReadonly<{
  /** The top-level statement the reference is in. */
  statement: TSESTree.Node;
  /** Whether a function body (or parameter list) lies between the two. */
  deferred: boolean;
}>;

/** What every fix in a file reads, computed once per file. */
type FixContext = DeepReadonly<{
  sourceCode: TSESLint.SourceCode;
  /** The fix writes `\n`, so a file with `\r` in it is left alone. */
  hasCarriageReturn: boolean;
  comments: TSESTree.Comment[];
}>;

type References = Readonly<{
  /** Functions the module refers to while it loads. */
  eager: ReadonlySet<TopLevelFunction>;
  /** For each function, the top-level functions whose bodies refer to it. */
  callersOf: ReadonlyMap<TopLevelFunction, ReadonlySet<TopLevelFunction>>;
}>;

/** Tokens a statement can start with that never continue the one before it. */
const STATEMENT_START_IDENTIFIERS: ReadonlySet<string> = new Set<string>([
  'abstract',
  'async',
  'declare',
  'enum',
  'global',
  'interface',
  'module',
  'namespace',
  'type',
]);

/**
 * A comment that applies to a stretch of the file rather than to the node
 * after it: a `*-disable` / `*-enable` pair (`eslint-`, `oxlint-`, `cspell:`),
 * a coverage-tool range, a `#region`, or a marker such as
 * `embed-sample-code-ignore-above`.
 */
const RANGE_MARKER =
  /^\s*(?:(?:eslint|oxlint|biome|tslint|jshint|stylelint|cspell|spell-checker)(?:-|:\s?)(?:disable|enable)(?![\w-])|[\w:-]*ignore-(?:above|below|start|end)\b|@formatter:(?:on|off)\b|(?:istanbul|c8|v8) ignore (?:start|stop|end)\b|#(?:end)?region\b)/u;

/** A pragma TypeScript or a JSX transform reads only at the top of a file. */
const FILE_PRAGMA = /@(?:jsx\w*|ts-nocheck|ts-check|flow)\b/u;

const FUNCTION_NODE_TYPES: ReadonlySet<AST_NODE_TYPES> =
  new Set<AST_NODE_TYPES>([
    AST_NODE_TYPES.ArrowFunctionExpression,
    AST_NODE_TYPES.FunctionDeclaration,
    AST_NODE_TYPES.FunctionExpression,
  ]);

/**
 * The `@typescript-eslint/utils` APIs take mutable nodes; this module only
 * ever reads them.
 */
const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;

const isFunctionExpression = (
  node: DeepReadonly<TSESTree.Expression> | null,
): boolean => {
  if (node === null) {
    return false;
  }

  const inner = skipTypeWrappers(node);

  return (
    inner.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    inner.type === AST_NODE_TYPES.FunctionExpression
  );
};

/**
 * The function a top-level declaration declares, if it declares exactly one:
 * a `function` declaration, a `const` with a single declarator whose
 * initializer is a function expression, or the function expression of an
 * `export default`.
 */
const functionDeclaredBy = (
  declaration: DeepReadonly<TSESTree.Node>,
): StrictPick<TopLevelFunction, 'declarator' | 'id'> | undefined => {
  const unwrapped = skipTypeWrappers(declaration);

  if (
    unwrapped.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    unwrapped.type === AST_NODE_TYPES.FunctionExpression
  ) {
    return { declarator: undefined, id: undefined };
  }

  if (declaration.type === AST_NODE_TYPES.FunctionDeclaration) {
    return {
      declarator: declaration,
      id: declaration.id ?? undefined,
    };
  }

  if (
    declaration.type !== AST_NODE_TYPES.VariableDeclaration ||
    declaration.kind !== 'const' ||
    !Arr.isFixedLengthArray(1, declaration.declarations)
  ) {
    return undefined;
  }

  const [declarator] = declaration.declarations;

  return declarator.id.type === AST_NODE_TYPES.Identifier &&
    isFunctionExpression(declarator.init)
    ? { declarator, id: declarator.id }
    : undefined;
};

/**
 * Names the module exports by name rather than by a keyword on their
 * declaration: `export { a, b as c }`, `export default a` and `export = a`.
 */
const namesExportedSeparately = (
  program: DeepReadonly<TSESTree.Program>,
): ReadonlySet<string> => {
  const mut_names = new Set<string>();

  for (const statement of program.body) {
    if (
      statement.type === AST_NODE_TYPES.ExportNamedDeclaration &&
      statement.source === null &&
      statement.exportKind === 'value'
    ) {
      // `export { type a }` exports no value.
      for (const specifier of statement.specifiers) {
        if (specifier.exportKind === 'value') {
          mut_names.add(specifier.local.name);
        }
      }
    } else if (
      statement.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
      statement.type === AST_NODE_TYPES.TSExportAssignment
    ) {
      // `export default (run satisfies Fn)` exports `run` all the same.
      const exported = skipTypeWrappers(
        statement.type === AST_NODE_TYPES.ExportDefaultDeclaration
          ? statement.declaration
          : statement.expression,
      );

      if (exported.type === AST_NODE_TYPES.Identifier) {
        mut_names.add(exported.name);
      }
    }
  }

  return mut_names;
};

/**
 * The name of the overload signature `statement` is, `export` included, or
 * `undefined` if it is not one.
 */
const signatureName = (
  statement: DeepReadonly<TSESTree.ProgramStatement>,
): string | undefined => {
  const declaration =
    statement.type === AST_NODE_TYPES.ExportNamedDeclaration ||
    statement.type === AST_NODE_TYPES.ExportDefaultDeclaration
      ? statement.declaration
      : statement;

  return declaration?.type === AST_NODE_TYPES.TSDeclareFunction
    ? declaration.id?.name
    : undefined;
};

const collectFunctions = (
  program: DeepReadonly<TSESTree.Program>,
): readonly TopLevelFunction[] => {
  const exportedNames = namesExportedSeparately(program);

  const mut_signatureCount = new Map<string, number>();

  for (const statement of program.body) {
    const name = signatureName(statement);

    if (name !== undefined) {
      mut_signatureCount.set(name, (mut_signatureCount.get(name) ?? 0) + 1);
    }
  }

  return program.body.flatMap((statement, index) => {
    const exportedByKeyword =
      statement.type === AST_NODE_TYPES.ExportNamedDeclaration ||
      statement.type === AST_NODE_TYPES.ExportDefaultDeclaration;

    const declaration = exportedByKeyword ? statement.declaration : statement;

    const found =
      declaration === null ? undefined : functionDeclaredBy(declaration);

    if (found === undefined) {
      return [];
    }

    const name = found.id?.name;

    let mut_firstIndex = index;

    if (name !== undefined) {
      while (
        mut_firstIndex > 0 &&
        signatureName(program.body[mut_firstIndex - 1] ?? statement) === name
      ) {
        mut_firstIndex -= 1;
      }
    }

    return [
      {
        ...found,
        statement,
        first: program.body[mut_firstIndex] ?? statement,
        index,
        exported:
          exportedByKeyword || (name !== undefined && exportedNames.has(name)),
        movable:
          name === undefined ||
          (mut_signatureCount.get(name) ?? 0) === index - mut_firstIndex,
      },
    ] as const;
  });
};

const inTypePosition = (node: DeepReadonly<TSESTree.Node>): boolean => {
  for (
    let mut_node: DeepReadonly<TSESTree.Node> | undefined = node.parent;
    // `Program`'s parent is `null` at run time, whatever the type says.
    mut_node !== undefined && mut_node.type !== AST_NODE_TYPES.Program;
    mut_node = mut_node.parent
  ) {
    if (mut_node.type === AST_NODE_TYPES.TSTypeQuery) {
      return true;
    }
  }

  return false;
};

/**
 * Whether `fn` is called where it is written — `(() => ...)()`, read through
 * type wrappers — so that its body runs when the code around it does.
 */
const isInvokedInPlace = (fn: DeepReadonly<TSESTree.Node>): boolean => {
  let mut_node: DeepReadonly<TSESTree.Node> = fn;

  while (mut_node.parent !== undefined && isTypeWrapper(mut_node.parent)) {
    mut_node = mut_node.parent;
  }

  return (
    mut_node.parent?.type === AST_NODE_TYPES.CallExpression &&
    mut_node.parent.callee === mut_node
  );
};

/**
 * The top-level statement `node` is in, and whether the code there runs only
 * when some function is called (`deferred`) rather than while the module
 * loads.
 */
const referenceSite = (node: DeepReadonly<TSESTree.Node>): ReferenceSite => {
  let mut_deferred = false;

  let mut_node: DeepReadonly<TSESTree.Node> = node;

  while (
    mut_node.parent !== undefined &&
    mut_node.parent.type !== AST_NODE_TYPES.Program
  ) {
    if (
      FUNCTION_NODE_TYPES.has(mut_node.parent.type) &&
      !isInvokedInPlace(mut_node.parent)
    ) {
      mut_deferred = true;
    }

    mut_node = mut_node.parent;
  }

  return { statement: mut_node, deferred: mut_deferred };
};

/**
 * Which non-exported functions the module refers to while it loads, and which
 * top-level functions refer to each from their bodies.
 */
const analyzeReferences = (
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
  functions: readonly TopLevelFunction[],
): References => {
  const byStatement: ReadonlyMap<
    DeepReadonly<TSESTree.Node>,
    TopLevelFunction
  > = new Map<DeepReadonly<TSESTree.Node>, TopLevelFunction>(
    functions.map((f) => [f.statement, f] as const),
  );

  const mut_eager = new Set<TopLevelFunction>();

  const mut_callersOf = new Map<TopLevelFunction, Set<TopLevelFunction>>();

  for (const f of functions) {
    if (f.exported || f.id === undefined || f.declarator === undefined) {
      continue;
    }

    const variable = sourceCode
      .getDeclaredVariables(asNode(f.declarator))
      .find((v) => v.name === f.id?.name);

    for (const reference of variable?.references ?? []) {
      if (
        reference.identifier === f.id ||
        !reference.isValueReference ||
        inTypePosition(reference.identifier)
      ) {
        continue;
      }

      const site = referenceSite(reference.identifier);

      if (!site.deferred) {
        mut_eager.add(f);

        continue;
      }

      const caller = byStatement.get(site.statement);

      if (caller === undefined || caller === f) {
        continue;
      }

      const mut_callers = mut_callersOf.get(f) ?? new Set<TopLevelFunction>();

      mut_callers.add(caller);

      mut_callersOf.set(f, mut_callers);
    }
  }

  return { eager: mut_eager, callersOf: mut_callersOf };
};

/**
 * Tarjan's algorithm: a map from each node to an id shared exactly by the
 * nodes that reach each other through `edgesOf`.
 */
const stronglyConnectedComponents = <T,>(
  nodes: readonly T[],
  edgesOf: (node: T) => readonly T[],
): ReadonlyMap<T, number> => {
  const mut_index = new Map<T, number>();

  const mut_lowLink = new Map<T, number>();

  const mut_component = new Map<T, number>();

  const mut_stack: T[] = [];

  const mut_onStack = new Set<T>();

  let mut_counter = 0;

  let mut_componentCount = 0;

  const visit = (node: T): void => {
    mut_index.set(node, mut_counter);

    mut_lowLink.set(node, mut_counter);

    mut_counter += 1;

    mut_stack.push(node);

    mut_onStack.add(node);

    for (const next of edgesOf(node)) {
      if (!mut_index.has(next)) {
        visit(next);

        mut_lowLink.set(
          node,
          Math.min(mut_lowLink.get(node) ?? 0, mut_lowLink.get(next) ?? 0),
        );
      } else if (mut_onStack.has(next)) {
        mut_lowLink.set(
          node,
          Math.min(mut_lowLink.get(node) ?? 0, mut_index.get(next) ?? 0),
        );
      }
    }

    if (mut_lowLink.get(node) !== mut_index.get(node)) {
      return;
    }

    for (
      let mut_member = mut_stack.pop();
      mut_member !== undefined;
      mut_member = mut_stack.pop()
    ) {
      mut_onStack.delete(mut_member);

      mut_component.set(mut_member, mut_componentCount);

      if (mut_member === node) {
        break;
      }
    }

    mut_componentCount += 1;
  };

  for (const node of nodes) {
    if (!mut_index.has(node)) {
      visit(node);
    }
  }

  return mut_component;
};

/**
 * The range of `f`'s statements (its overload signatures included), the
 * comments directly above them — each on its own line, with no blank line
 * between it and what follows — and the comments after them on their last
 * line.
 */
const attachedRange = (
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
  f: TopLevelFunction,
): FixedLengthTuple<2, number> => {
  let mut_start: DeepReadonly<TSESTree.Comment | TSESTree.Node> = f.first;

  for (const comment of sourceCode
    .getCommentsBefore(asNode(f.first))
    .toReversed()) {
    // Code on the comment's line makes it that code's trailing comment; another
    // comment there (`/** Doc. */ // note`) does not.
    const before = sourceCode.getTokenBefore(comment);

    if (
      mut_start.loc.start.line - comment.loc.end.line > 1 ||
      (before !== null && before.loc.end.line === comment.loc.start.line)
    ) {
      break;
    }

    mut_start = comment;
  }

  const trailing = sourceCode
    .getCommentsAfter(asNode(f.statement))
    .filter((comment) => comment.loc.start.line === f.statement.loc.end.line)
    .at(-1);

  return [mut_start.range[0], (trailing ?? f.statement).range[1]] as const;
};

/**
 * Whether a comment on its own line stands above `f`'s attached comments with
 * a blank line between: a section heading, or a note about `f` written apart
 * from it. The rule cannot tell which, so it moves nothing across one.
 */
const hasDetachedCommentAbove = (
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
  f: TopLevelFunction,
  attachedStart: number,
): boolean =>
  sourceCode.getCommentsBefore(asNode(f.first)).some((comment) => {
    if (comment.range[1] > attachedStart) {
      return false;
    }

    const before = sourceCode.getTokenBefore(comment);

    return before === null || before.loc.end.line < comment.loc.start.line;
  });

/**
 * Whether something above `f`, the file's first statement, has to stay first:
 * a shebang, a triple-slash directive, or a pragma such as `@jsxImportSource`
 * or `@ts-nocheck`.
 */
const followsFileDirective = (
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
  f: TopLevelFunction,
): boolean =>
  sourceCode.getTokenBefore(asNode(f.first)) === null &&
  (sourceCode.text.startsWith('#!') ||
    sourceCode
      .getCommentsBefore(asNode(f.first))
      .some(
        (comment) =>
          (comment.type === AST_TOKEN_TYPES.Line &&
            comment.value.startsWith('/')) ||
          FILE_PRAGMA.test(comment.value),
      ));

/**
 * `[start of the line containing start, start of the line after end]`, or
 * `undefined` if anything but whitespace shares those lines with the range.
 */
const wholeLines = (
  text: string,
  [start, end]: FixedLengthTuple<2, number>,
): FixedLengthTuple<2, number> | undefined => {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;

  const newline = text.indexOf('\n', end);

  const lineEnd = newline === -1 ? text.length : newline + 1;

  return text.slice(lineStart, start).trim() === '' &&
    text.slice(end, lineEnd).trim() === ''
    ? ([lineStart, lineEnd] as const)
    : undefined;
};

/**
 * Whether taking `f` out leaves the statements around it as separate
 * statements: either the one above ends with `;` (or there is none), or the
 * one below starts with a token that cannot continue an expression.
 */
const removable = (
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
  f: TopLevelFunction,
): boolean => {
  const before = sourceCode.getTokenBefore(asNode(f.first));

  const after = sourceCode.getTokenAfter(asNode(f.statement));

  return (
    before === null ||
    before.value === ';' ||
    after === null ||
    after.type === AST_TOKEN_TYPES.Keyword ||
    (after.type === AST_TOKEN_TYPES.Identifier &&
      STATEMENT_START_IDENTIFIERS.has(after.value))
  );
};

/**
 * Whether moving the lines `[to, from)` apart would take something along that
 * the rule cannot judge: a comment that applies to a stretch of the file
 * anywhere in them (moving code in or out of it changes what it covers), or a
 * top-level comment on its own line with a blank line after it — a section
 * heading, or a note written apart from what it is about.
 */
const crossesComment = (
  { sourceCode, comments }: FixContext,
  [to, from]: FixedLengthTuple<2, number>,
): boolean =>
  comments.some((comment) => {
    if (comment.range[0] < to || comment.range[1] > from) {
      return false;
    }

    if (RANGE_MARKER.test(comment.value)) {
      return true;
    }

    const { start, end } = comment.loc;

    const ownLine =
      sourceCode.lines[start.line - 1]?.slice(0, start.column).trim() === '';

    const blankAfter = sourceCode.lines[end.line]?.trim() === '';

    return (
      ownLine &&
      blankAfter &&
      sourceCode.getNodeByRangeIndex(comment.range[0])?.type ===
        AST_NODE_TYPES.Program
    );
  });

/**
 * A fix moving `moved`, with its attached comments, to the line above
 * `target`'s attached comments, or `null` where that cannot be done exactly.
 */
const moveAbove = (
  fixContext: FixContext,
  moved: TopLevelFunction,
  target: TopLevelFunction,
): TSESLint.ReportFixFunction | null => {
  const { sourceCode, hasCarriageReturn } = fixContext;

  if (hasCarriageReturn || !moved.movable || !removable(sourceCode, moved)) {
    return null;
  }

  const targetRange = attachedRange(sourceCode, target);

  if (
    hasDetachedCommentAbove(sourceCode, target, targetRange[0]) ||
    followsFileDirective(sourceCode, target)
  ) {
    return null;
  }

  const { text } = sourceCode;

  const from = wholeLines(text, attachedRange(sourceCode, moved));

  const to = wholeLines(text, targetRange);

  if (
    from === undefined ||
    to === undefined ||
    crossesComment(fixContext, [to[0], from[1]])
  ) {
    return null;
  }

  const movedText = text.slice(...from);

  // The blank line above the moved lines goes with them, so that the gap they
  // leave is one blank line rather than two.
  const removedStart = text.endsWith('\n\n', from[0]) ? from[0] - 1 : from[0];

  return (fixer) => [
    fixer.insertTextBeforeRange(
      [to[0], to[0]],
      `${movedText.endsWith('\n') ? movedText : `${movedText}\n`}\n`,
    ),
    fixer.removeRange([removedStart, from[1]]),
  ];
};
