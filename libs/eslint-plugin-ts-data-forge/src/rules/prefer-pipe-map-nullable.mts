import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  getArgumentText,
  getImportDeclarations,
  hasForeignBinding,
  isTypeWrapper,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import * as ts from 'typescript';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

type Options = readonly [];

type MessageIds = 'useMapNullable' | 'suggestMapNullable';

/**
 * `pipe(x).map(mapNullable(fn))` and `pipe(x).mapNullable(fn)` compute the same
 * value: `mapNullable(fn)` is `(v) => v == null ? undefined : fn(v)`, and
 * `Pipe.mapNullable(fn)` is `pipe(a == null ? undefined : fn(a))`.
 *
 * Only the curried `mapNullable(fn)` imported from ts-data-forge is rewritten,
 * and only on a receiver this rule can see is a pipe: a `pipe(…)` call, or a
 * chain of `map` / `mapNullable` / `mapOptional` calls on one.
 *
 * The static type can differ. `mapNullable` declares `const B` and
 * `Pipe.mapNullable` a plain `B`, so for an inline function `(v) => 'a'` the
 * first infers `'a'` and the second `string`, and `(v) => [v, 1]` becomes
 * `number[]` instead of `readonly [number, 1]`. The fix is therefore applied
 * automatically only when the function's return type is not inferred, or is
 * inferred with nothing such a widening could change; otherwise, and whenever
 * a comment or a type wrapper around `mapNullable` would be dropped, it is
 * offered as a suggestion.
 */
export const preferPipeMapNullable: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `pipe(x).map(mapNullable(fn))` with `pipe(x).mapNullable(fn)`.',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      useMapNullable:
        'Replace `.map({{mapNullableName}}(…))` with `.mapNullable(…)`.',
      suggestMapNullable:
        'Replace `.map({{mapNullableName}}(…))` with `.mapNullable(…)` (the inferred type may be widened, or a comment or type assertion dropped).',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const resolveTsDataForge = buildCalleeResolver(
      getImportDeclarations(program, TS_DATA_FORGE_MODULE),
    );

    const pipeResolvers = PIPE_MODULES.map(
      (moduleName) =>
        [
          moduleName,
          buildCalleeResolver(getImportDeclarations(program, moduleName)),
        ] as const,
    );

    const services = sourceCode.parserServices;

    const checker = services?.program?.getTypeChecker();

    const esTreeNodeToTSNodeMap = services?.esTreeNodeToTSNodeMap;

    /**
     * Whether `callee` calls the export `name` of the module `resolve`
     * reads, rather than a local binding that shadows the import.
     */
    const calls = (
      resolve: ReturnType<typeof buildCalleeResolver>,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      callee: TSESTree.Expression,
      name: string,
      moduleName: string,
    ): boolean => {
      if (resolve(callee)?.canonicalName !== name) {
        return false;
      }

      const unwrapped = skipTypeWrappers(callee);

      // The named import itself, or the namespace of `m.f`.
      const binding =
        unwrapped.type === AST_NODE_TYPES.MemberExpression
          ? skipTypeWrappers(unwrapped.object)
          : unwrapped;

      return (
        binding.type === AST_NODE_TYPES.Identifier &&
        !hasForeignBinding(sourceCode, binding, binding.name, moduleName)
      );
    };

    /**
     * Whether `node` is `pipe(…)`, or `p.map(…)` / `p.mapNullable(…)` /
     * `p.mapOptional(…)` on such a `p`.
     */
    const isPipe = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      wrapped: TSESTree.Node,
    ): boolean => {
      const node = skipTypeWrappers(wrapped);

      if (node.type !== AST_NODE_TYPES.CallExpression || node.optional) {
        return false;
      }

      if (
        pipeResolvers.some(([moduleName, resolve]) =>
          calls(resolve, node.callee, 'pipe', moduleName),
        )
      ) {
        return true;
      }

      const { callee } = node;

      return (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        !callee.computed &&
        !callee.optional &&
        callee.property.type === AST_NODE_TYPES.Identifier &&
        PIPE_CHAIN_METHODS.has(callee.property.name) &&
        isPipe(callee.object)
      );
    };

    /**
     * Whether `Pipe.mapNullable(mapFn)` infers the same result type as
     * `mapNullable(mapFn)` did (see the rule's comment).
     */
    const keepsResultType = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      mapNullableCall: TSESTree.CallExpression,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      mapFn: TSESTree.Expression,
    ): boolean => {
      // `satisfies` leaves the function's own type to inference.
      const fn = skipSatisfies(mapFn);

      if (
        (fn.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
          fn.type !== AST_NODE_TYPES.FunctionExpression) ||
        fn.returnType !== undefined
      ) {
        // A function whose type is fixed before `B` is inferred.
        return true;
      }

      if (checker === undefined || esTreeNodeToTSNodeMap === undefined) {
        return false;
      }

      // The `B | undefined` that `mapNullable(fn)` returns, with `B` as the
      // `const` type parameter inferred it. The function's own return type
      // is no guide: for `(v) => ({ kind: 'n', v })` it is already widened
      // to `{ kind: string; v: number }`, while `B` keeps `'n'`.
      const signatures = checker
        .getTypeAtLocation(esTreeNodeToTSNodeMap.get(mapNullableCall))
        .getCallSignatures();

      return (
        Arr.isFixedLengthTuple(1, signatures) &&
        !hasConstInferredPart(
          checker,
          checker.getReturnTypeOfSignature(signatures[0]),
          0,
        )
      );
    };

    return {
      CallExpression: (node) => {
        // <pipe>.map(mapNullable(fn))
        if (
          node.optional ||
          node.typeArguments !== undefined ||
          node.callee.type !== AST_NODE_TYPES.MemberExpression ||
          node.callee.computed ||
          node.callee.optional ||
          node.callee.property.type !== AST_NODE_TYPES.Identifier ||
          node.callee.property.name !== 'map' ||
          !Arr.isFixedLengthTuple(1, node.arguments)
        ) {
          return;
        }

        const mapNullableCall = node.arguments[0];

        if (
          mapNullableCall.type !== AST_NODE_TYPES.CallExpression ||
          mapNullableCall.optional ||
          // `mapNullable<A, B>(fn)` pins types `Pipe.mapNullable<B>` has no
          // place for.
          mapNullableCall.typeArguments !== undefined ||
          // `mapNullable(x, fn)` is the two-argument form, which returns the
          // mapped value rather than a function.
          !Arr.isFixedLengthTuple(1, mapNullableCall.arguments)
        ) {
          return;
        }

        const mapFn = mapNullableCall.arguments[0];

        if (
          mapFn.type === AST_NODE_TYPES.SpreadElement ||
          !calls(
            resolveTsDataForge,
            mapNullableCall.callee,
            'mapNullable',
            TS_DATA_FORGE_MODULE,
          ) ||
          !isPipe(node.callee.object)
        ) {
          return;
        }

        // Everything the fix removes: `mapNullable(` and `)` around `fn`.
        const droppedRanges = [
          [mapNullableCall.range[0], mapFn.range[0]],
          [mapFn.range[1], mapNullableCall.range[1]],
        ] as const;

        const dropsComment = sourceCode
          .getCommentsInside(mapNullableCall)
          .some((comment) =>
            droppedRanges.some(
              ([start, end]) =>
                start <= comment.range[0] && comment.range[1] <= end,
            ),
          );

        const autofixable =
          !dropsComment &&
          !isTypeWrapper(mapNullableCall.callee) &&
          keepsResultType(mapNullableCall, mapFn);

        const mapProperty = node.callee.property;

        const fix: TSESLint.ReportFixFunction = (fixer) => [
          fixer.replaceText(mapProperty, 'mapNullable'),
          fixer.replaceText(
            mapNullableCall,
            getArgumentText(sourceCode, mapFn),
          ),
        ];

        const data = {
          mapNullableName: sourceCode.getText(mapNullableCall.callee),
        } as const;

        if (autofixable) {
          context.report({
            node,
            messageId: 'useMapNullable',
            data,
            fix,
          });
        } else {
          context.report({
            node,
            messageId: 'useMapNullable',
            data,
            suggest: [{ messageId: 'suggestMapNullable', data, fix }],
          });
        }
      },
    };
  },
  defaultOptions: [],
} as const;

/**
 * `ts-data-forge` re-exports `pipe` from `ts-std-forge`, so a pipe built
 * through either package is the same object. `mapNullable` is exported by
 * `ts-data-forge` only.
 */
const PIPE_MODULES = [TS_DATA_FORGE_MODULE, 'ts-std-forge'] as const;

/** The methods of a `Pipe` that return another `Pipe`. */
const PIPE_CHAIN_METHODS: ReadonlySet<string> = new Set<string>([
  'map',
  'mapNullable',
  'mapOptional',
]);

/** Literal types, which a `const` type parameter keeps and a plain one widens. */
const literalTypeFlags =
  ts.TypeFlags.StringLiteral |
  ts.TypeFlags.NumberLiteral |
  ts.TypeFlags.BigIntLiteral |
  ts.TypeFlags.BooleanLiteral |
  ts.TypeFlags.EnumLiteral |
  ts.TypeFlags.TemplateLiteral |
  ts.TypeFlags.UniqueESSymbol;

/** Deeper than this, a type is assumed to have a `const`-inferred part. */
const MAX_DEPTH = 4;

/**
 * Whether `type`, inferred for a `const` type parameter, has a part a plain
 * type parameter would infer differently: a literal (`'a'` against `string`)
 * or a tuple (`readonly [number, 1]` against `number[]`), at the top level or
 * inside an array, a generic type's arguments or an object literal's
 * properties. Conservative: a declared literal type, which neither widens,
 * also counts.
 */
const hasConstInferredPart = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  depth: number,
): boolean => {
  if (depth > MAX_DEPTH) {
    return true;
  }

  // `boolean` is the union `true | false`, which widens to itself.
  if ((type.flags & ts.TypeFlags.Boolean) !== 0) {
    return false;
  }

  if (type.isUnion() || type.isIntersection()) {
    return type.types.some((t) => hasConstInferredPart(checker, t, depth + 1));
  }

  if ((type.flags & literalTypeFlags) !== 0 || checker.isTupleType(type)) {
    return true;
  }

  if ((type.flags & ts.TypeFlags.Object) === 0) {
    return false;
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const { objectFlags } = type as ts.ObjectType;

  // `Promise<'a'>`, `readonly 'a'[]`.
  if (
    (objectFlags & ts.ObjectFlags.Reference) !== 0 &&
    checker
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      .getTypeArguments(type as ts.TypeReference)
      .some((t) => hasConstInferredPart(checker, t, depth + 1))
  ) {
    return true;
  }

  return (
    // An object literal's type, which reaches here instantiated (`Anonymous`)
    // rather than flagged `ObjectLiteral`.
    (objectFlags &
      (ts.ObjectFlags.ObjectLiteral | ts.ObjectFlags.Anonymous)) !==
      0 &&
    type
      .getProperties()
      .some((property) =>
        hasConstInferredPart(
          checker,
          checker.getTypeOfSymbol(property),
          depth + 1,
        ),
      )
  );
};

/** `node` with every `satisfies` around it taken off. */
const skipSatisfies = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
): TSESTree.Expression =>
  node.type === AST_NODE_TYPES.TSSatisfiesExpression
    ? skipSatisfies(node.expression)
    : node;
