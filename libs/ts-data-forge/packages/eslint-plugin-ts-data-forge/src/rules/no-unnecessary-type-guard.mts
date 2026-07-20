import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import {
  buildCalleeResolver,
  buildImportFixes,
  getImportedLocalName,
  getTsDataForgeImport,
} from './import-utils.mjs';

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
      replacements?: Record<string, string>;
    }
  | {
      kind: 'excludeFrom';
      atoms: AtomKey[];
      replacements?: Record<string, string>;
    }
  | { kind: 'nonEmptyString' }
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

const NULLISH_REPLACEMENTS_EXCLUDE: Readonly<Record<string, string>> = {
  undefined: 'isNotUndefined',
  null: 'isNotNull',
} as const;

const NULLISH_REPLACEMENTS_NARROW: Readonly<Record<string, string>> = {
  undefined: 'isUndefined',
  null: 'isNull',
} as const;

const GUARD_SPECS: DeepReadonly<Record<string, GuardSpec>> = {
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
} as const;

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
    },

    create: (context) => {
      const options = context.options[0];

      const parserServices = ESLintUtils.getParserServices(context);

      const compilerOptions = parserServices.program.getCompilerOptions();

      // Without `strictNullChecks`, `null` / `undefined` are erased from the type
      // system, so reasoning about nullish narrowing is unsound. Disable entirely.
      const strictNullChecks =
        compilerOptions.strictNullChecks ?? compilerOptions.strict ?? false;

      if (!strictNullChecks) return {};

      const checker = parserServices.program.getTypeChecker();

      const sourceCode = context.sourceCode;

      const program = sourceCode.ast;

      const ignored = new Set(options?.ignore);

      const tsDataForgeImport = getTsDataForgeImport(program);

      const resolveGuard = buildCalleeResolver(tsDataForgeImport);

      const buildReplaceFix =
        (
          isNamespace: boolean,
          // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
          propertyNode: TSESTree.Node,
          replacement: string,
        ): TSESLint.ReportFixFunction =>
        (fixer) => {
          // A namespace member access (`tf.isX`) exposes every export, so the
          // canonical name is always in scope.
          if (isNamespace) {
            return [fixer.replaceText(propertyNode, replacement)];
          }

          // If the replacement guard is already imported (possibly under an
          // alias), rename to its in-scope local name. Otherwise add a new
          // import and rename to the canonical name.
          const localName = getImportedLocalName(
            tsDataForgeImport,
            replacement,
          );

          if (localName !== undefined) {
            return [fixer.replaceText(propertyNode, localName)];
          }

          return [
            ...buildImportFixes(fixer, program, tsDataForgeImport, [
              replacement,
            ]),
            fixer.replaceText(propertyNode, replacement),
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
          data: { from, to },
          fix: buildReplaceFix(isNamespace, propertyNode, to),
        });
      };

      return {
        CallExpression: (node) => {
          if (node.arguments.length !== 1) return;

          const argument = node.arguments[0];

          if (
            argument === undefined ||
            argument.type === AST_NODE_TYPES.SpreadElement
          ) {
            return;
          }

          const resolved = resolveGuard(node.callee);

          if (resolved === undefined) return;

          const { canonicalName, propertyNode, isNamespace } = resolved;

          if (ignored.has(canonicalName)) return;

          const spec = GUARD_SPECS[canonicalName];

          if (spec === undefined) return;

          const argTsNode = parserServices.esTreeNodeToTSNodeMap.get(argument);

          const argType = checker.getTypeAtLocation(argTsNode);

          const parts = collectUnionParts(argType);

          if (parts === undefined) return; // opaque / generic → bail conservatively

          const inputAtoms = new Set(parts.map(classifyAtom));

          const hasMemberOutsideTarget = (
            atoms: readonly AtomKey[],
          ): boolean => {
            const targetSet = new Set<Atom>(atoms);

            return parts.some((p) => !targetSet.has(classifyAtom(p)));
          };

          switch (spec.kind) {
            case 'excludeFrom': {
              const removable = spec.atoms.filter((a) => inputAtoms.has(a));

              if (removable.length === 0) {
                // Nothing to exclude → the guard always holds.
                reportConstant(node, canonicalName, true, argument);
              } else if (!hasMemberOutsideTarget(spec.atoms)) {
                // Every member is excluded → the guard never holds.
                reportConstant(node, canonicalName, false, argument);
              } else if (removable.length < spec.atoms.length) {
                const replacement = spec.replacements?.[joinAtoms(removable)];

                if (replacement !== undefined) {
                  reportReplace(
                    node,
                    canonicalName,
                    replacement,
                    isNamespace,
                    propertyNode,
                  );
                }
              }

              break;
            }

            case 'narrowTo': {
              const present = spec.atoms.filter((a) => inputAtoms.has(a));

              if (present.length === 0) {
                // No member is in the target set → the guard never holds.
                reportConstant(node, canonicalName, false, argument);
              } else if (!hasMemberOutsideTarget(spec.atoms)) {
                // Input ⊆ target → the guard always holds and narrows nothing.
                reportConstant(node, canonicalName, true, argument);
              } else if (present.length < spec.atoms.length) {
                const replacement = spec.replacements?.[joinAtoms(present)];

                if (replacement !== undefined) {
                  reportReplace(
                    node,
                    canonicalName,
                    replacement,
                    isNamespace,
                    propertyNode,
                  );
                }
              }

              break;
            }

            case 'nonEmptyString': {
              const hasNullish =
                inputAtoms.has('undefined') || inputAtoms.has('null');

              const nonNullishParts = parts.filter((p) => {
                const atom = classifyAtom(p);

                return atom !== 'undefined' && atom !== 'null';
              });

              if (!nonNullishParts.some(couldBeNonEmptyString)) {
                // No member can be a non-empty string → the guard never holds.
                reportConstant(node, canonicalName, false, argument);

                break;
              }

              if (
                nonNullishParts.some(
                  (p) => !isGuaranteedNonEmptyString(p, checker),
                )
              ) {
                break; // still does real string/empty work
              }

              if (hasNullish) {
                reportReplace(
                  node,
                  canonicalName,
                  'isNonNullish',
                  isNamespace,
                  propertyNode,
                );
              } else {
                reportConstant(node, canonicalName, true, argument);
              }

              break;
            }
          }
        },
      };
    },
    defaultOptions: [{}],
  } as const;

/**
 * Decomposes a type into its union members. Returns `undefined` when any member
 * is opaque (`any` / `unknown` / `never`) or deferred (type parameter, indexed
 * access, …), signalling that the rule should not draw conclusions.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const collectUnionParts = (type: ts.Type): readonly ts.Type[] | undefined => {
  const parts = type.isUnion() ? type.types : ([type] as const);

  for (const part of parts) {
    if ((part.flags & DEFERRED_OR_OPAQUE_FLAGS) !== 0) return undefined;
  }

  return parts;
};

/** Classifies a single (non-union) type into a primitive {@link Atom}. */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const classifyAtom = (type: ts.Type): Atom => {
  const { flags } = type;

  if ((flags & ts.TypeFlags.Undefined) !== 0) return 'undefined';

  if ((flags & ts.TypeFlags.Null) !== 0) return 'null';

  if ((flags & ts.TypeFlags.BooleanLike) !== 0) return 'boolean';

  if ((flags & ts.TypeFlags.NumberLike) !== 0) return 'number';

  if ((flags & ts.TypeFlags.StringLike) !== 0) return 'string';

  if ((flags & ts.TypeFlags.BigIntLike) !== 0) return 'bigint';

  if ((flags & ts.TypeFlags.ESSymbolLike) !== 0) return 'symbol';

  // Branded primitives (e.g. `NonEmptyString = string & {...}`) are
  // intersections; classify them by their underlying primitive constituent.
  if (type.isIntersection()) {
    for (const constituent of type.types) {
      const atom = classifyAtom(constituent);

      if (atom !== 'other') return atom;
    }
  }

  return 'other';
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
  if (type.isStringLiteral()) return type.value !== '';

  if (type.getProperty(BRAND_MARKER_PROPERTY) === undefined) return false;

  const minLengthSymbol = type.getProperty(MIN_LENGTH_BRAND_KEY);

  if (minLengthSymbol === undefined) return false;

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
const couldBeNonEmptyString = (type: ts.Type): boolean => {
  if (type.isStringLiteral()) return type.value !== '';

  return classifyAtom(type) === 'string';
};

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

    default:
      return false;
  }
};
