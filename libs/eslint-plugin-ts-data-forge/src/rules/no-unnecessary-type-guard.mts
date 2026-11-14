import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  getImportDeclarations,
  isTypeWrapper,
  skipTypeWrappers,
  typeWrapperLayers,
  type ResolvedCallee,
} from 'eslint-rule-forge';
import { isString } from 'ts-data-forge';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import {
  SHARED_EXPORTS,
  TS_DATA_FORGE_MODULE,
  TS_STD_FORGE_MODULE,
} from './constants.mjs';
import { tsDataForgeValueAtByName } from './import-binding.mjs';

type Options = readonly [
  Readonly<{
    /** Names of ts-data-forge guard functions to skip checking. */
    ignore?: readonly string[];
  }>?,
];

type MessageIds = 'alwaysTrue' | 'alwaysFalse' | 'replaceTypeGuard';

/**
 * The primitive categories a (non-`null`/`undefined`) union member can fall
 * into. `other` covers anything the rule does not reason about (objects,
 * functions, `void`, …).
 */
type AtomKey =
  'undefined' | 'null' | 'boolean' | 'number' | 'string' | 'bigint' | 'symbol';

type Atom = AtomKey | 'other';

type GuardSpec = DeepReadonly<
  | {
      kind: 'narrowTo';
      atoms: AtomKey[];
      replacements?: ReadonlyRecord<string, string>;
    }
  | {
      kind: 'excludeFrom';
      atoms: AtomKey[];
      replacements?: ReadonlyRecord<string, string>;
    }
  | { kind: 'nonEmptyString' }
  | { kind: 'record' }
  | { kind: 'variant'; tags: string[] }
>;

/**
 * Internal marker property attached to every `ts-type-forge` branded type. Its
 * presence (together with the `MinLength` brand key) lets us recognize a
 * `NonEmptyString` without holding a reference to the type itself.
 */
const BRAND_MARKER_PROPERTY =
  'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3';

/**
 * Brand key carried by `MinLengthString<N>` — and therefore by
 * `NonEmptyString = MinLengthString<1>`. Its value is `MinLengthTuple<N, 0>`, a
 * tuple of `0`s with at least `N` elements, so a required first element means
 * `N >= 1` (the string cannot be empty).
 */
const MIN_LENGTH_BRAND_KEY = 'MinLength';

/**
 * The `$$tag` discriminants of the algebraic data types' variants. A variant
 * guard compares nothing else, so the tags of the argument's union members
 * decide its result.
 */
const SOME_TAG = 'ts-data-forge::Optional.some';

const NONE_TAG = 'ts-data-forge::Optional.none';

const OK_TAG = 'ts-data-forge::Result.ok';

const ERR_TAG = 'ts-data-forge::Result.err';

const WARN_TAG = 'ts-data-forge::Result.warn';

const IDLE_TAG = 'ts-data-forge::AsyncData.idle';

const PENDING_TAG = 'ts-data-forge::AsyncData.pending';

const TAG_PROPERTY = '$$tag';

/**
 * `Optional`'s variants carry no `$$tag`: a `Some` is its value unwrapped and
 * `None` a reserved string, so the variant is named by a type-only property
 * instead. Its values map to the tags the guards above are written in, so that
 * an `Optional` from a ts-std-forge before the change (tagged) and one after it
 * classify the same. A tagged `Optional` reaching a guard of the unwrapped
 * version is a mix of the two, which neither supports; the rule judges each by
 * its own type.
 */
const OPTIONAL_VARIANT_PROPERTY = 'ts-std-forge::Optional';

/** The type-only property of an unwrapped `Some` that holds its value's type. */
const OPTIONAL_VALUE_PROPERTY = 'ts-std-forge::Optional.value';

const OPTIONAL_VARIANT_TAGS: ReadonlyRecord<string, string> = {
  some: SOME_TAG,
  none: NONE_TAG,
} as const;

const NULLISH_REPLACEMENTS_EXCLUDE: ReadonlyRecord<string, string> = {
  undefined: 'isNotUndefined',
  null: 'isNotNull',
} as const;

const NULLISH_REPLACEMENTS_NARROW: ReadonlyRecord<string, string> = {
  undefined: 'isUndefined',
  null: 'isNull',
} as const;

const GUARD_SPECS: DeepReadonly<ReadonlyRecord<string, GuardSpec>> = {
  isUndefined: { kind: 'narrowTo', atoms: ['undefined'] },
  isNotUndefined: { kind: 'excludeFrom', atoms: ['undefined'] },
  isNull: { kind: 'narrowTo', atoms: ['null'] },
  isNotNull: { kind: 'excludeFrom', atoms: ['null'] },
  isBoolean: { kind: 'narrowTo', atoms: ['boolean'] },
  isNotBoolean: { kind: 'excludeFrom', atoms: ['boolean'] },
  isNumber: { kind: 'narrowTo', atoms: ['number'] },
  isNotNumber: { kind: 'excludeFrom', atoms: ['number'] },
  isString: { kind: 'narrowTo', atoms: ['string'] },
  isNotString: { kind: 'excludeFrom', atoms: ['string'] },
  isBigint: { kind: 'narrowTo', atoms: ['bigint'] },
  isNotBigint: { kind: 'excludeFrom', atoms: ['bigint'] },
  isSymbol: { kind: 'narrowTo', atoms: ['symbol'] },
  isNotSymbol: { kind: 'excludeFrom', atoms: ['symbol'] },
  isNullish: {
    kind: 'narrowTo',
    atoms: ['null', 'undefined'],
    replacements: NULLISH_REPLACEMENTS_NARROW,
  },
  isNonNullish: {
    kind: 'excludeFrom',
    atoms: ['null', 'undefined'],
    replacements: NULLISH_REPLACEMENTS_EXCLUDE,
  },
  isNonEmptyString: { kind: 'nonEmptyString' },
  isRecord: { kind: 'record' },
  // The variant guards are members of an exported object, named by both.
  'Optional.isSome': { kind: 'variant', tags: [SOME_TAG] },
  'Optional.isNone': { kind: 'variant', tags: [NONE_TAG] },
  'Result.isOk': { kind: 'variant', tags: [OK_TAG] },
  'Result.isErr': { kind: 'variant', tags: [ERR_TAG] },
  'TernaryResult.isOk': { kind: 'variant', tags: [OK_TAG] },
  'TernaryResult.isWarn': { kind: 'variant', tags: [WARN_TAG] },
  'TernaryResult.isErr': { kind: 'variant', tags: [ERR_TAG] },
  'AsyncData.isIdle': { kind: 'variant', tags: [IDLE_TAG] },
  'AsyncData.isPending': { kind: 'variant', tags: [PENDING_TAG] },
  'AsyncData.isOk': { kind: 'variant', tags: [OK_TAG] },
  'AsyncData.isErr': { kind: 'variant', tags: [ERR_TAG] },
  'AsyncData.isSettled': { kind: 'variant', tags: [OK_TAG, ERR_TAG] },
} as const;

/** What ts-data-forge re-exports from ts-std-forge, read through either. */
const sharedExports: ReadonlySet<string> = new Set(SHARED_EXPORTS);

const DEFERRED_OR_OPAQUE_FLAGS =
  ts.TypeFlags.Any |
  ts.TypeFlags.Unknown |
  ts.TypeFlags.Never |
  ts.TypeFlags.TypeParameter |
  ts.TypeFlags.IndexedAccess |
  ts.TypeFlags.Conditional |
  ts.TypeFlags.Substitution;

export const noUnnecessaryTypeGuard: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'suggestion',
      docs: {
        description:
          'Detect ts-data-forge type guard calls that perform no narrowing (the argument type already satisfies, or can never satisfy, the guard).',
      },
      fixable: 'code',
      schema: [
        {
          type: 'object',
          properties: {
            ignore: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Names of ts-data-forge guard functions to skip checking.',
            },
          },
          additionalProperties: false,
        },
      ],
      messages: {
        alwaysTrue:
          'Unnecessary `{{name}}` call: the argument type guarantees it always returns `true`. Replace the call with `true`.',
        alwaysFalse:
          'Unnecessary `{{name}}` call: the argument type guarantees it always returns `false`. Replace the call with `false`.',
        replaceTypeGuard:
          'Unnecessary `{{from}}` call: the argument can only be narrowed by `{{to}}`. Use `{{to}}` instead.',
      },
      defaultOptions: [{}],
    },

    create: (context) => {
      const options = context.options[0];

      const parserServices = ESLintUtils.getParserServices(context);

      const compilerOptions = parserServices.program.getCompilerOptions();

      // Without `strictNullChecks`, `null` / `undefined` are erased from the type
      // system, so reasoning about nullish narrowing is unsound. Disable entirely.
      const strictNullChecks =
        compilerOptions.strictNullChecks ?? compilerOptions.strict ?? false;

      if (!strictNullChecks) {
        return {};
      }

      const checker = parserServices.program.getTypeChecker();

      const sourceCode = context.sourceCode;

      const program = sourceCode.ast;

      const ignored = new Set(options?.ignore);

      const tsDataForgeImports = getImportDeclarations(
        program,
        TS_DATA_FORGE_MODULE,
      );

      const resolveTsDataForge = buildCalleeResolver(tsDataForgeImports);

      // What ts-data-forge re-exports from ts-std-forge (`isRecord`,
      // `Optional`, …) is the same declaration imported from either, so it is
      // read through both; nothing else is, as only ts-data-forge's own guards
      // have specs.
      const resolveTsStdForge = buildCalleeResolver(
        getImportDeclarations(program, TS_STD_FORGE_MODULE),
      );

      const resolveGuard = (
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        callee: TSESTree.Expression,
      ): ResolvedCallee | undefined => {
        const fromTsDataForge = resolveTsDataForge(callee);

        if (fromTsDataForge !== undefined) {
          return fromTsDataForge;
        }

        const fromTsStdForge = resolveTsStdForge(callee);

        return fromTsStdForge !== undefined &&
          isSharedExport(fromTsStdForge.canonicalName)
          ? fromTsStdForge
          : undefined;
      };

      // `Optional.isNone(x)`, `tf.Optional.isNone(x)`: a guard that is a member
      // of an exported object, named `Optional.isNone` in `GUARD_SPECS`.
      const resolveMemberGuard = (
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        callee: TSESTree.Expression,
      ): ResolvedCallee | undefined => {
        const member = skipTypeWrappers(callee);

        if (
          member.type !== AST_NODE_TYPES.MemberExpression ||
          member.computed ||
          member.property.type !== AST_NODE_TYPES.Identifier
        ) {
          return undefined;
        }

        const owner = resolveGuard(member.object);

        return owner === undefined
          ? undefined
          : {
              canonicalName: `${owner.canonicalName}.${member.property.name}`,
              propertyNode: member.property,
              isNamespace: owner.isNamespace,
              bindingNode: owner.bindingNode,
            };
      };

      /**
       * Whether `node`, alone or under `!` and type wrappers, is the argument an
       * assertion function asserts: `assert.isTrue(Optional.isSome(x))` checks
       * at run time what the type only claims, so it is not a guard that could
       * go.
       */
      const isAssertedArgument = (
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        node: TSESTree.Node,
      ): boolean => {
        const { parent } = node;

        if (parent === undefined) {
          return false;
        }

        if (
          isTypeWrapper(parent) ||
          (parent.type === AST_NODE_TYPES.UnaryExpression &&
            parent.operator === '!')
        ) {
          return isAssertedArgument(parent);
        }

        if (parent.type !== AST_NODE_TYPES.CallExpression) {
          return false;
        }

        const index = (parent.arguments as readonly TSESTree.Node[]).indexOf(
          node,
        );

        if (index === -1) {
          return false;
        }

        const signature = checker.getResolvedSignature(
          parserServices.esTreeNodeToTSNodeMap.get(parent),
        );

        const predicate =
          signature === undefined
            ? undefined
            : checker.getTypePredicateOfSignature(signature);

        return (
          predicate?.kind === ts.TypePredicateKind.AssertsIdentifier &&
          predicate.parameterIndex === index
        );
      };

      /**
       * Whether `argument` reads a binding that a function other than its own
       * assigns, directly or through a property. TypeScript keeps narrowing
       * across calls — after `let x: Optional<T> = Optional.none;
       * xs.forEach(() => { x = … });`, `x` is still `None` — so the type says
       * nothing about the value there.
       */
      const readsClosureAssignedBinding = (
        argument: DeepReadonly<TSESTree.Expression>,
      ): boolean => {
        const [start, end] = argument.range;

        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        const scope = sourceCode.getScope(argument as TSESTree.Node);

        return scope.references.some(
          (reference) =>
            reference.identifier.range[0] >= start &&
            reference.identifier.range[1] <= end &&
            reference.resolved !== null &&
            isAssignedFromAnotherFunction(reference.resolved),
        );
      };

      // One binding per replacement guard, however many reports use it.
      const guardAt = tsDataForgeValueAtByName(sourceCode);

      const buildReplaceFix = (
        isNamespace: boolean,
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        propertyNode: TSESTree.Node,
        replacement: string,
      ): TSESLint.ReportFixFunction | null => {
        // A namespace member access (`tf.isX`) exposes every export, so the
        // canonical name is always in scope.
        if (isNamespace) {
          return (fixer) => [fixer.replaceText(propertyNode, replacement)];
        }

        // The replacement guard's local name, or the guard through a namespace
        // import, added to the imports when the file has neither; no fix when
        // it cannot be bound there.
        const guard = guardAt(replacement)(propertyNode);

        return guard === undefined
          ? null
          : (fixer) => [
              ...guard.edits(fixer),
              fixer.replaceText(propertyNode, guard.localName),
            ];
      };

      const reportConstant = (
        node: DeepReadonly<TSESTree.CallExpression>,
        name: string,
        value: boolean,
        argument: DeepReadonly<TSESTree.Expression>,
      ): void => {
        // Replacing the call with a literal drops the argument expression, so only
        // autofix when evaluating it cannot have observable side effects.
        const canFix = isSideEffectFreeArg(argument);

        context.report({
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          node: node as TSESTree.Node,
          messageId: value ? 'alwaysTrue' : 'alwaysFalse',
          data: { name },
          fix: canFix
            ? (fixer) =>
                fixer.replaceText(
                  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                  node as TSESTree.Node,
                  value ? 'true' : 'false',
                )
            : undefined,
        });
      };

      const reportReplace = (
        node: DeepReadonly<TSESTree.CallExpression>,
        from: string,
        to: string,
        isNamespace: boolean,
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        propertyNode: TSESTree.Node,
      ): void => {
        context.report({
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          node: node as TSESTree.Node,
          messageId: 'replaceTypeGuard',
          // The name the fix writes: an aliased import's local name, or the
          // guard through a namespace import.
          data: {
            from,
            to: isNamespace ? to : (guardAt(to)(propertyNode)?.localName ?? to),
          },
          fix: buildReplaceFix(isNamespace, propertyNode, to),
        });
      };

      return {
        CallExpression: (node) => {
          if (node.arguments.length !== 1) {
            return;
          }

          const argument = node.arguments[0];

          if (
            argument === undefined ||
            argument.type === AST_NODE_TYPES.SpreadElement
          ) {
            return;
          }

          const resolved =
            resolveGuard(node.callee) ?? resolveMemberGuard(node.callee);

          if (resolved === undefined) {
            return;
          }

          const { canonicalName, propertyNode, isNamespace } = resolved;

          if (ignored.has(canonicalName)) {
            return;
          }

          const spec = GUARD_SPECS[canonicalName];

          if (spec === undefined) {
            return;
          }

          if (readsClosureAssignedBinding(argument)) {
            return;
          }

          // A conclusion drawn from the argument's type has to hold at every
          // layer of type wrappers around it (see typeWrapperLayers):
          // `isNull(x as string | null)` is the author saying `x` may be
          // `null`, and `isNullish(x as string | undefined)` still sees the
          // `null` that `x` may hold.
          const layerTypes = typeWrapperLayers(argument).map((layer) =>
            checker.getTypeAtLocation(
              parserServices.esTreeNodeToTSNodeMap.get(layer),
            ),
          );

          const verdict = layerTypes
            .map((type) => verdictOf(spec, type, checker))
            .find(
              (candidate): candidate is Verdict =>
                candidate !== undefined &&
                layerTypes.every((type) =>
                  holdsOn(candidate, spec, type, checker),
                ),
            );

          if (verdict === undefined) {
            return;
          }

          if (verdict.kind === 'constant') {
            if (!isAssertedArgument(node)) {
              reportConstant(node, canonicalName, verdict.value, argument);
            }
          } else {
            reportReplace(
              node,
              canonicalName,
              verdict.replacement,
              isNamespace,
              propertyNode,
            );
          }
        },
      };
    },
  } as const;

/** What the rule concludes about a guard call from one type of its argument. */
type Verdict = DeepReadonly<
  | { kind: 'constant'; value: boolean }
  | { kind: 'replace'; replacement: string }
>;

const replacementVerdict = (
  replacement: string | undefined,
): Verdict | undefined =>
  replacement === undefined
    ? undefined
    : ({ kind: 'replace', replacement } as const);

/**
 * Decomposes a type into its union members. Returns `undefined` when any member
 * is opaque (`any` / `unknown` / `never`) or deferred (type parameter, indexed
 * access, …), signalling that the rule should not draw conclusions.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const collectUnionParts = (type: ts.Type): readonly ts.Type[] | undefined => {
  const parts = type.isUnion() ? type.types : ([type] as const);

  for (const part of parts) {
    if ((part.flags & DEFERRED_OR_OPAQUE_FLAGS) !== 0) {
      return undefined;
    }
  }

  return parts;
};

const isCallableType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean =>
  checker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0 ||
  checker.getSignaturesOfType(type, ts.SignatureKind.Construct).length > 0;

/**
 * Whether `isRecord` is guaranteed to accept this (non-union) type.
 *
 * `isRecord` narrows to `UnknownRecord` (`ReadonlyRecord<string, unknown>`), so
 * a string index signature is exactly what it asks for and its value type is
 * `unknown`, which anything satisfies. Arrays and callables are excluded even
 * when they carry one, because `isRecord` rejects them at runtime
 * (`Array.isArray` is true; `typeof fn === 'object'` is false).
 *
 * Deliberately conservative: an object type without an index signature of its
 * own is reported as neither guaranteed-accepted nor guaranteed-rejected, even
 * where TypeScript would accept it through an implicit index signature.
 */
const isGuaranteedRecord = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean =>
  checker.getIndexInfoOfType(type, ts.IndexKind.String) !== undefined &&
  !isCallableType(type, checker) &&
  !checker.isArrayType(type) &&
  !checker.isTupleType(type);

/**
 * The string literal a (non-union) type's `$$tag` property holds, or
 * `undefined` when it has none: `Ok<number>` gives `'ts-data-forge::Result.ok'`.
 * An `Optional` variant, which has no `$$tag`, gives the tag its type-only key
 * stands for (`Some<number>` gives `'ts-data-forge::Optional.some'`).
 */
const variantTagOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): string | undefined => {
  const tagSymbol = type.getProperty(TAG_PROPERTY);

  if (tagSymbol !== undefined) {
    const tagType = checker.getTypeOfSymbol(tagSymbol);

    return tagType.isStringLiteral() ? tagType.value : undefined;
  }

  const variantSymbol = type.getProperty(OPTIONAL_VARIANT_PROPERTY);

  if (variantSymbol === undefined) {
    return undefined;
  }

  const variantType = checker.getTypeOfSymbol(variantSymbol);

  return variantType.isStringLiteral()
    ? OPTIONAL_VARIANT_TAGS[variantType.value]
    : undefined;
};

/**
 * A tag no variant guard names, for a value no variant guard but `Optional`'s
 * accepts.
 */
const NO_VARIANT_TAG = '(no variant)';

/** Whether `type` is a variant of the unwrapped `Optional` (see above). */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const isUnwrappedOptional = (type: ts.Type): boolean =>
  type.getProperty(OPTIONAL_VARIANT_PROPERTY) !== undefined;

/** Classifies a single (non-union) type into a primitive {@link Atom}. */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const classifyAtom = (type: ts.Type): Atom => {
  const { flags } = type;

  if ((flags & ts.TypeFlags.Undefined) !== 0) {
    return 'undefined';
  }

  if ((flags & ts.TypeFlags.Null) !== 0) {
    return 'null';
  }

  if ((flags & ts.TypeFlags.BooleanLike) !== 0) {
    return 'boolean';
  }

  if ((flags & ts.TypeFlags.NumberLike) !== 0) {
    return 'number';
  }

  if ((flags & ts.TypeFlags.StringLike) !== 0) {
    return 'string';
  }

  if ((flags & ts.TypeFlags.BigIntLike) !== 0) {
    return 'bigint';
  }

  if ((flags & ts.TypeFlags.ESSymbolLike) !== 0) {
    return 'symbol';
  }

  // Branded primitives (e.g. `NonEmptyString = string & {...}`) are
  // intersections; classify them by their underlying primitive constituent.
  if (type.isIntersection()) {
    for (const constituent of type.types) {
      const atom = classifyAtom(constituent);

      if (atom !== 'other') {
        return atom;
      }
    }
  }

  return 'other';
};

/** Whether `type` is the `None` variant of the unwrapped `Optional`. */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const isNoneVariant = (type: ts.Type): boolean =>
  isUnwrappedOptional(type) &&
  type.getProperty(OPTIONAL_VALUE_PROPERTY) === undefined;

/**
 * The tag another type's variant guard (`Result.isOk`, ...) sees at runtime in
 * a value of `type`. An unwrapped `Some` is the value it holds, so it shows that
 * value's tag, and a primitive one none; `None`, and a `Some` of `None`, are
 * reserved strings, which no such guard accepts. `undefined` stands for a
 * member whose tag cannot be told.
 *
 * A `Some` that holds another `Some` gives no verdict. What it is at runtime
 * depends on what the inner one holds (the innermost value itself, or a
 * reserved string for `None` or a reserved string), and following that, even to
 * a fixed depth, multiplies the work by the width of each held union and needs
 * a cut for a type that holds itself. The rule leaves this rare case without a
 * verdict rather than pay for it.
 */
const runtimeVariantTagsOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): readonly (string | undefined)[] => {
  if (!isUnwrappedOptional(type)) {
    return [variantTagOf(type, checker)];
  }

  const valueSymbol = type.getProperty(OPTIONAL_VALUE_PROPERTY);

  if (valueSymbol === undefined) {
    return [NO_VARIANT_TAG]; // `None`
  }

  const held = collectUnionParts(checker.getTypeOfSymbol(valueSymbol));

  return held === undefined
    ? [undefined]
    : held.map((p) =>
        isUnwrappedOptional(p)
          ? isNoneVariant(p)
            ? NO_VARIANT_TAG // a `Some` of `None`
            : undefined // a `Some` of a `Some`, not followed (see above)
          : classifyAtom(p) === 'other'
            ? variantTagOf(p, checker)
            : NO_VARIANT_TAG,
      );
};

/**
 * Whether `isRecord` is guaranteed to reject this (non-union) type: every
 * primitive (`null` included), every array or tuple, and every callable fails
 * its `typeof x === 'object' && x !== null && !Array.isArray(x)` check.
 */
const isGuaranteedNotRecord = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean =>
  classifyAtom(type) !== 'other' ||
  checker.isArrayType(type) ||
  checker.isTupleType(type) ||
  isCallableType(type, checker);

/** A stable key for a set of atoms, used to look up replacement guards. */
const joinAtoms = (atoms: readonly AtomKey[]): string =>
  ATOM_ORDER.filter((atom) => atoms.includes(atom)).join('|');

/**
 * Returns `true` when the type is guaranteed to be a non-empty string: either a
 * non-empty string literal or a value branded as `NonEmptyString`
 * (`MinLengthString<N>` with `N >= 1`).
 */
const isGuaranteedNonEmptyString = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean => {
  if (type.isStringLiteral()) {
    return type.value !== '';
  }

  if (type.getProperty(BRAND_MARKER_PROPERTY) === undefined) {
    return false;
  }

  const minLengthSymbol = type.getProperty(MIN_LENGTH_BRAND_KEY);

  if (minLengthSymbol === undefined) {
    return false;
  }

  // The `MinLength` brand value is `MinLengthTuple<N, 0>`; it has a required
  // first element (`'0'`) exactly when `N >= 1`, i.e. the string is non-empty.
  // `MinLengthString<0>` brands with a plain array and has no such element.
  return (
    checker.getTypeOfSymbol(minLengthSymbol).getProperty('0') !== undefined
  );
};

/**
 * Returns `true` when the type can possibly be a non-empty string (a general
 * `string`, a branded string, or a non-empty string literal). The empty string
 * literal and non-string types cannot.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const couldBeNonEmptyString = (type: ts.Type): boolean =>
  type.isStringLiteral() ? type.value !== '' : classifyAtom(type) === 'string';

/**
 * What a guard with `spec` does on an argument of `type`: always the same
 * boolean, the same as a narrower guard, or nothing the rule can say.
 */
const verdictOf = (
  spec: GuardSpec,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): Verdict | undefined => {
  const parts = collectUnionParts(type);

  if (parts === undefined) {
    return undefined; // opaque / generic → bail conservatively
  }

  if (parts.some(isUnwrappedOptional) && spec.kind !== 'variant') {
    // An unwrapped `Optional` is typed as an object but is, at runtime, the
    // value it holds (a `Some`, `undefined` and `null` included) or a string
    // (`None`): of any kind, nullish too. A variant guard reads it through
    // `runtimeVariantTagsOf`; no other guard can be judged on it.
    return undefined;
  }

  const inputAtoms = new Set(parts.map(classifyAtom));

  const hasMemberOutsideTarget = (atoms: readonly AtomKey[]): boolean => {
    const targetSet = new Set<Atom>(atoms);

    return parts.some((p) => !targetSet.has(classifyAtom(p)));
  };

  switch (spec.kind) {
    case 'excludeFrom': {
      const removable = spec.atoms.filter((a) => inputAtoms.has(a));

      if (removable.length === 0) {
        // Nothing to exclude → the guard always holds.
        return { kind: 'constant', value: true } as const;
      }

      if (!hasMemberOutsideTarget(spec.atoms)) {
        // Every member is excluded → the guard never holds.
        return { kind: 'constant', value: false } as const;
      }

      return replacementVerdict(
        removable.length < spec.atoms.length
          ? spec.replacements?.[joinAtoms(removable)]
          : undefined,
      );
    }

    case 'narrowTo': {
      const present = spec.atoms.filter((a) => inputAtoms.has(a));

      if (present.length === 0) {
        // No member is in the target set → the guard never holds.
        return { kind: 'constant', value: false } as const;
      }

      if (!hasMemberOutsideTarget(spec.atoms)) {
        // Input ⊆ target → the guard always holds and narrows nothing.
        return { kind: 'constant', value: true } as const;
      }

      return replacementVerdict(
        present.length < spec.atoms.length
          ? spec.replacements?.[joinAtoms(present)]
          : undefined,
      );
    }

    case 'record':
      // Every member already satisfies `UnknownRecord`, or none can ever be a
      // non-null, non-array object.
      return parts.every((p) => isGuaranteedRecord(p, checker))
        ? ({ kind: 'constant', value: true } as const)
        : parts.every((p) => isGuaranteedNotRecord(p, checker))
          ? ({ kind: 'constant', value: false } as const)
          : undefined;

    case 'variant': {
      const isOptionalGuard = spec.tags.every(
        (tag) => tag === SOME_TAG || tag === NONE_TAG,
      );

      const tags = isOptionalGuard
        ? parts.map((p) => variantTagOf(p, checker))
        : parts.flatMap((p) => runtimeVariantTagsOf(p, checker));

      if (!tags.every(isString)) {
        return undefined; // a member the tag does not identify
      }

      return tags.every((tag) => spec.tags.includes(tag))
        ? ({ kind: 'constant', value: true } as const)
        : tags.every((tag) => !spec.tags.includes(tag))
          ? ({ kind: 'constant', value: false } as const)
          : undefined;
    }

    case 'nonEmptyString': {
      const nonNullishParts = parts.filter((p) => {
        const atom = classifyAtom(p);

        return atom !== 'undefined' && atom !== 'null';
      });

      if (!nonNullishParts.some(couldBeNonEmptyString)) {
        // No member can be a non-empty string → the guard never holds.
        return { kind: 'constant', value: false } as const;
      }

      if (
        nonNullishParts.some((p) => !isGuaranteedNonEmptyString(p, checker))
      ) {
        return undefined; // still does real string/empty work
      }

      return inputAtoms.has('undefined') || inputAtoms.has('null')
        ? ({ kind: 'replace', replacement: 'isNonNullish' } as const)
        : ({ kind: 'constant', value: true } as const);
    }
  }
};

/**
 * Whether `verdict`, drawn from one layer's type, also holds for `type`. A
 * constant has to come out the same. A replacement holds where the rule would
 * suggest the same one, or where the guard and its replacement are the same
 * constant: under `x!` on a `string | null`, `isNonNullish` and `isNotNull` are
 * both always `true` on `string`.
 */
const holdsOn = (
  verdict: Verdict,
  spec: GuardSpec,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean => {
  const onType = verdictOf(spec, type, checker);

  if (verdict.kind === 'constant') {
    return onType?.kind === 'constant' && onType.value === verdict.value;
  }

  if (onType?.kind === 'replace') {
    return onType.replacement === verdict.replacement;
  }

  const replacementSpec = GUARD_SPECS[verdict.replacement];

  const replacementOnType =
    replacementSpec === undefined
      ? undefined
      : verdictOf(replacementSpec, type, checker);

  return (
    onType?.kind === 'constant' &&
    replacementOnType?.kind === 'constant' &&
    replacementOnType.value === onType.value
  );
};

const ATOM_ORDER: readonly AtomKey[] = [
  'undefined',
  'null',
  'boolean',
  'number',
  'string',
  'bigint',
  'symbol',
] as const;

/** Whether a member expression is the target of an assignment or update. */
const isMemberAssignmentTarget = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  member: TSESTree.MemberExpression,
): boolean => {
  const { parent } = member;

  return (
    (parent.type === AST_NODE_TYPES.AssignmentExpression &&
      parent.left === member) ||
    (parent.type === AST_NODE_TYPES.UpdateExpression &&
      parent.argument === member)
  );
};

/**
 * Whether `node` starts a member chain that is assigned to or updated:
 * `state` in `state.found = …`, `(state as S).a.b++` or `state.n += 1`.
 */
const isAssignedThrough = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean => {
  const { parent } = node;

  if (parent === undefined) {
    return false;
  }

  if (isTypeWrapper(parent)) {
    return isAssignedThrough(parent);
  }

  return (
    parent.type === AST_NODE_TYPES.MemberExpression &&
    parent.object === node &&
    (isMemberAssignmentTarget(parent) || isAssignedThrough(parent))
  );
};

/**
 * Whether a function other than the one declaring `variable` assigns it, or
 * assigns a property reached from it (`state.found = …`).
 */
const isAssignedFromAnotherFunction = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  variable: TSESLint.Scope.Variable,
): boolean =>
  variable.references.some(
    (reference) =>
      reference.from.variableScope !== variable.scope.variableScope &&
      ((reference.isWrite() && reference.init !== true) ||
        isAssignedThrough(reference.identifier)),
  );

/**
 * Returns `true` when evaluating the expression cannot have observable side
 * effects, so replacing the surrounding call with a literal is safe. Limited to
 * simple references (identifiers, `this`, literals, and member-access chains).
 */

const isSideEffectFreeArg = (node: DeepReadonly<TSESTree.Node>): boolean => {
  // `node.type` is one of 130+ AST kinds; only a handful are relevant here.
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (node.type) {
    case AST_NODE_TYPES.Identifier:
    case AST_NODE_TYPES.ThisExpression:
    case AST_NODE_TYPES.Literal:
      return true;

    case AST_NODE_TYPES.MemberExpression:
      return (
        isSideEffectFreeArg(node.object) &&
        (!node.computed || isSideEffectFreeArg(node.property))
      );

    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSNonNullExpression:
    case AST_NODE_TYPES.TSSatisfiesExpression:
    case AST_NODE_TYPES.TSTypeAssertion:
      return isSideEffectFreeArg(node.expression);

    default:
      return false;
  }
};

const isSharedExport = (name: string): boolean => sharedExports.has(name);
