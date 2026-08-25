import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import {
  buildImportFixes,
  getImportedLocalName,
  getNamedImports,
  getTsDataForgeImport,
} from './import-utils.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

type Options = readonly [];

type MessageIds = 'useObjFilter' | 'useObjFilterMap' | 'useObjMap';

/** The `Obj` function an entries round trip is rewritten to. */
type ObjMethod = 'filter' | 'filterMap' | 'map';

const MESSAGE_ID_OF = {
  map: 'useObjMap',
  filter: 'useObjFilter',
  filterMap: 'useObjFilterMap',
} as const satisfies ReadonlyRecord<ObjMethod, MessageIds>;

/**
 * The body the rewritten callback gets:
 *
 * - `expression` — the mapped value (`Obj.map`) or the predicate (`Obj.filter`),
 *   used verbatim.
 * - `optional` — the two branches of the `flatMap` callback's conditional,
 *   rebuilt as `Optional.some(...)` / `Optional.none` (`Obj.filterMap`).
 */
type CallbackBody = Readonly<
  | { kind: 'expression'; expression: TSESTree.Expression }
  | {
      kind: 'optional';
      test: TSESTree.Expression;
      kept: TSESTree.Expression;
      keepOnTrue: boolean;
    }
>;

type RoundTrip = Readonly<{
  method: ObjMethod;
  /** The record `Object.entries` was called on. */
  record: TSESTree.Expression;
  /** The callback given to `map` / `filter` / `flatMap`. */
  callback: TSESTree.ArrowFunctionExpression;
  /** `k` in `([k, v]) => …`, absent when the entry pattern elides it. */
  keyParam: TSESTree.Identifier | undefined;
  /** `v` in `([k, v]) => …`, absent when the entry pattern elides it. */
  valueParam: TSESTree.Identifier | undefined;
  /**
   * The key identifiers the rewrite drops — the ones that only rebuilt the
   * entry. They are excluded when deciding whether the callback still needs a
   * key parameter.
   */
  dropped: readonly TSESTree.Identifier[];
  body: CallbackBody;
}>;

export const preferObjOverEntriesRoundTrip: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace an `Object.fromEntries(Object.entries(record).map/filter/flatMap(...))` round trip with `Obj.map` / `Obj.filter` / `Obj.filterMap` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useObjMap:
        'Replace this `Object.fromEntries(Object.entries(…).map(…))` round trip with `Obj.map` from ts-data-forge, which keeps the key set of the record in the result type.',
      useObjFilter:
        'Replace this `Object.fromEntries(Object.entries(…).filter(…))` round trip with `Obj.filter` from ts-data-forge, which keeps the key and value types of the record in the result type.',
      useObjFilterMap:
        'Replace this `Object.fromEntries(Object.entries(…).flatMap(…))` round trip with `Obj.filterMap` from ts-data-forge, which keeps the key types of the record in the result type.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsDataForgeImport = getTsDataForgeImport(program);

    const mut_roundTrips: {
      node: TSESTree.CallExpression;
      roundTrip: RoundTrip;
    }[] = [];

    /**
     * Rebuilds the callback's parameter list. The entry pattern binds
     * `[key, value]`; `Obj` passes `(value, key)`, and either parameter is
     * dropped when the rewritten body no longer refers to it.
     */
    const buildParams = (roundTrip: RoundTrip): string => {
      const scope = sourceCode.getScope(roundTrip.callback);

      const dropped = new Set<TSESTree.Node>(roundTrip.dropped);

      const keyName =
        roundTrip.keyParam !== undefined &&
        isReferencedOutside(scope, roundTrip.keyParam.name, dropped)
          ? roundTrip.keyParam.name
          : undefined;

      const valueName = roundTrip.valueParam?.name;

      if (keyName !== undefined) {
        // `Obj` puts the value first, so a callback that only needs the key
        // still has to name a value parameter.
        return `(${valueName ?? unusedValueParamName(scope)}, ${keyName})`;
      }

      return valueName !== undefined &&
        isReferencedOutside(scope, valueName, dropped)
        ? `(${valueName})`
        : '()';
    };

    const buildCallbackBody = (
      roundTrip: RoundTrip,
      optionalName: string,
    ): string => {
      const { body } = roundTrip;

      if (body.kind === 'expression') {
        return arrowBodyText(
          sourceCode.getText(body.expression),
          body.expression,
        );
      }

      const testText = conditionalTestText(
        sourceCode.getText(body.test),
        body.test,
      );

      const someText = `${optionalName}.some(${argumentText(sourceCode.getText(body.kept), body.kept)})`;

      const noneText = `${optionalName}.none`;

      return body.keepOnTrue
        ? `${testText} ? ${someText} : ${noneText}`
        : `${testText} ? ${noneText} : ${someText}`;
    };

    return {
      CallExpression: (node) => {
        const roundTrip = parseEntriesRoundTrip(node);

        if (roundTrip === undefined) return;

        mut_roundTrips.push({ node, roundTrip });
      },

      'Program:exit': () => {
        const namedImports = getNamedImports(tsDataForgeImport);

        const objName = getImportedLocalName(tsDataForgeImport, 'Obj') ?? 'Obj';

        const optionalName =
          getImportedLocalName(tsDataForgeImport, 'Optional') ?? 'Optional';

        const needsOptional = mut_roundTrips.some(
          ({ roundTrip }) => roundTrip.body.kind === 'optional',
        );

        const missingImports = (['Obj', 'Optional'] as const).filter(
          (name) =>
            (name !== 'Optional' || needsOptional) &&
            !namedImports.includes(name),
        );

        // Note: the import is added by the first fix only, so that several
        // fixes in one file do not each insert it at the same position.
        for (const [index, { node, roundTrip }] of mut_roundTrips.entries()) {
          context.report({
            node,
            messageId: MESSAGE_ID_OF[roundTrip.method],
            fix: (fixer) => {
              const recordText = argumentText(
                sourceCode.getText(roundTrip.record),
                roundTrip.record,
              );

              const replacement = `${objName}.${roundTrip.method}(${recordText}, ${buildParams(roundTrip)} => ${buildCallbackBody(roundTrip, optionalName)})`;

              const importFixes =
                index === 0 && missingImports.length > 0
                  ? buildImportFixes(
                      fixer,
                      program,
                      tsDataForgeImport,
                      missingImports,
                    )
                  : [];

              return [...importFixes, fixer.replaceText(node, replacement)];
            },
          });
        }
      },
    };
  },
  defaultOptions: [],
} as const;

/**
 * Matches `Object.fromEntries(Object.entries(record).map|filter|flatMap(cb))`
 * and reports which `Obj` function replaces it, or `undefined` when the call is
 * not such a round trip or `cb` has a shape `Obj` cannot express (a key
 * transform, a block body, an entry-index parameter, …).
 */
const parseEntriesRoundTrip = (
  node: TSESTree.CallExpression,
): RoundTrip | undefined => {
  if (!isObjectStaticCall(node, 'fromEntries')) return undefined;

  if (!Arr.isFixedLengthTuple(1, node.arguments)) return undefined;

  const [transform] = node.arguments;

  if (transform.type !== AST_NODE_TYPES.CallExpression) return undefined;

  const { callee } = transform;

  if (
    callee.type !== AST_NODE_TYPES.MemberExpression ||
    callee.computed ||
    callee.property.type !== AST_NODE_TYPES.Identifier
  ) {
    return undefined;
  }

  const arrayMethod = callee.property.name;

  if (
    arrayMethod !== 'map' &&
    arrayMethod !== 'filter' &&
    arrayMethod !== 'flatMap'
  ) {
    return undefined;
  }

  const entriesCall = callee.object;

  if (
    entriesCall.type !== AST_NODE_TYPES.CallExpression ||
    !isObjectStaticCall(entriesCall, 'entries') ||
    !Arr.isFixedLengthTuple(1, entriesCall.arguments)
  ) {
    return undefined;
  }

  const [record] = entriesCall.arguments;

  if (record.type === AST_NODE_TYPES.SpreadElement) return undefined;

  // A second argument (`thisArg`) or a callback that also takes the entry index
  // has no counterpart in `Obj`.
  if (!Arr.isFixedLengthTuple(1, transform.arguments)) return undefined;

  const [callback] = transform.arguments;

  if (
    callback.type !== AST_NODE_TYPES.ArrowFunctionExpression ||
    callback.async ||
    // An explicit return type is either redundant or a type predicate; the
    // latter would be lost by the rewrite.
    callback.returnType !== undefined ||
    !Arr.isFixedLengthTuple(1, callback.params) ||
    callback.body.type === AST_NODE_TYPES.BlockStatement
  ) {
    return undefined;
  }

  const [entryPattern] = callback.params;

  if (entryPattern.type !== AST_NODE_TYPES.ArrayPattern) return undefined;

  const entryParams = parseEntryPattern(entryPattern);

  if (entryParams === undefined) return undefined;

  const body = callback.body;

  const common = { record, callback, ...entryParams } as const;

  switch (arrayMethod) {
    case 'filter':
      return {
        ...common,
        method: 'filter',
        dropped: [],
        body: { kind: 'expression', expression: body },
      };

    case 'map': {
      const entry = parseKeptEntry(body, entryParams.keyParam);

      return entry === undefined
        ? undefined
        : {
            ...common,
            method: 'map',
            dropped: [entry.key],
            body: { kind: 'expression', expression: entry.value },
          };
    }

    case 'flatMap': {
      if (body.type !== AST_NODE_TYPES.ConditionalExpression) return undefined;

      const onTrue = parseSingletonEntry(body.consequent, entryParams.keyParam);

      const onFalse = parseSingletonEntry(body.alternate, entryParams.keyParam);

      const keepOnTrue = onTrue !== undefined && isEmptyArray(body.alternate);

      const kept = keepOnTrue
        ? onTrue
        : onFalse !== undefined && isEmptyArray(body.consequent)
          ? onFalse
          : undefined;

      return kept === undefined
        ? undefined
        : {
            ...common,
            method: 'filterMap',
            dropped: [kept.key],
            body: {
              kind: 'optional',
              test: body.test,
              kept: kept.value,
              keepOnTrue,
            },
          };
    }
  }
};

type EntryParams = Readonly<{
  keyParam: TSESTree.Identifier | undefined;
  valueParam: TSESTree.Identifier | undefined;
}>;

/**
 * Reads the `[key, value]` destructuring the entry callback binds. Anything
 * beyond a plain binding — a default, a rest element, a nested pattern — is
 * rejected, because the rewritten callback receives the value and the key
 * directly rather than an entry tuple.
 */
const parseEntryPattern = (
  pattern: TSESTree.ArrayPattern,
): EntryParams | undefined => {
  if (pattern.elements.length > 2) return undefined;

  const [keyElement, valueElement] = pattern.elements;

  return isElidedOrIdentifier(keyElement) && isElidedOrIdentifier(valueElement)
    ? {
        keyParam: keyElement ?? undefined,
        valueParam: valueElement ?? undefined,
      }
    : undefined;
};

const isElidedOrIdentifier = (
  element: TSESTree.DestructuringPattern | null | undefined,
): element is TSESTree.Identifier | null | undefined =>
  element === null ||
  element === undefined ||
  element.type === AST_NODE_TYPES.Identifier;

type KeptEntry = Readonly<{
  /** The key identifier that only rebuilds the entry, dropped by the rewrite. */
  key: TSESTree.Identifier;
  value: TSESTree.Expression;
}>;

/**
 * Matches `[k, value]` — an entry rebuilt under the very key it came from,
 * which is the only shape `Obj.map` / `Obj.filterMap` can express. An entry
 * built under a different key is left alone.
 */
const parseKeptEntry = (
  node: TSESTree.Expression,
  keyParam: TSESTree.Identifier | undefined,
): KeptEntry | undefined => {
  if (keyParam === undefined) return undefined;

  const tuple = stripTypeWrappers(node);

  if (
    tuple.type !== AST_NODE_TYPES.ArrayExpression ||
    !Arr.isFixedLengthTuple(2, tuple.elements)
  ) {
    return undefined;
  }

  const [key, value] = tuple.elements;

  return key !== null &&
    value !== null &&
    key.type === AST_NODE_TYPES.Identifier &&
    value.type !== AST_NODE_TYPES.SpreadElement &&
    key.name === keyParam.name
    ? { key, value }
    : undefined;
};

/** Matches `[[k, value]]` — the `flatMap` branch that keeps an entry. */
const parseSingletonEntry = (
  node: TSESTree.Expression,
  keyParam: TSESTree.Identifier | undefined,
): KeptEntry | undefined => {
  const array = stripTypeWrappers(node);

  if (
    array.type !== AST_NODE_TYPES.ArrayExpression ||
    !Arr.isFixedLengthTuple(1, array.elements)
  ) {
    return undefined;
  }

  const [entry] = array.elements;

  return entry === null || entry.type === AST_NODE_TYPES.SpreadElement
    ? undefined
    : parseKeptEntry(entry, keyParam);
};

/** Matches `[]` — the `flatMap` branch that drops an entry. */
const isEmptyArray = (node: TSESTree.Expression): boolean => {
  const array = stripTypeWrappers(node);

  return (
    array.type === AST_NODE_TYPES.ArrayExpression && array.elements.length === 0
  );
};

/**
 * Looks through the `as const` / `satisfies` an entry tuple usually carries.
 * Any other assertion is left in place, so that a tuple asserted to a wider
 * type than the callback returns is not reported: `Obj` would infer the
 * narrower one and the rewrite would not type-check.
 */
const stripTypeWrappers = (node: TSESTree.Expression): TSESTree.Expression =>
  node.type === AST_NODE_TYPES.TSSatisfiesExpression ||
  (node.type === AST_NODE_TYPES.TSAsExpression && isConstAssertion(node))
    ? stripTypeWrappers(node.expression)
    : node;

const isConstAssertion = (node: TSESTree.TSAsExpression): boolean =>
  node.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
  node.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier &&
  node.typeAnnotation.typeName.name === 'const';

const isObjectStaticCall = (
  node: TSESTree.CallExpression,
  name: 'entries' | 'fromEntries',
): boolean =>
  node.callee.type === AST_NODE_TYPES.MemberExpression &&
  !node.callee.computed &&
  node.callee.object.type === AST_NODE_TYPES.Identifier &&
  node.callee.object.name === 'Object' &&
  node.callee.property.type === AST_NODE_TYPES.Identifier &&
  node.callee.property.name === name;

/**
 * `true` when the parameter is still referenced once the identifiers in
 * `dropped` — the ones that only rebuilt the entry key — are discounted.
 * References from nested functions resolve to the same variable, so they count.
 */
const isReferencedOutside = (
  scope: TSESLint.Scope.Scope,
  name: string,
  dropped: ReadonlySet<TSESTree.Node>,
): boolean =>
  scope.variables
    .find((variable) => variable.name === name)
    ?.references.some((reference) => !dropped.has(reference.identifier)) ??
  false;

/**
 * A name for the value parameter of a callback that only uses the key. `_value`
 * is what the `Obj` documentation uses; a suffix is added if that name is
 * already referenced inside the callback, so the new parameter shadows nothing.
 */
const unusedValueParamName = (scope: TSESLint.Scope.Scope): string => {
  const taken = new Set<string>(
    scope.through
      .map((reference) => reference.identifier.name)
      .concat(scope.variables.map((variable) => variable.name)),
  );

  const firstFree = (candidate: string, suffix: number): string =>
    taken.has(candidate)
      ? firstFree(`_value${suffix + 1}`, suffix + 1)
      : candidate;

  return firstFree('_value', 1);
};

/** Expressions that bind looser than a conditional's test position. */
const NEEDS_PARENS_AS_TEST: ReadonlySet<string> = new Set<string>([
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.AssignmentExpression,
  AST_NODE_TYPES.ConditionalExpression,
  AST_NODE_TYPES.SequenceExpression,
  AST_NODE_TYPES.YieldExpression,
]);

const conditionalTestText = (
  text: string,
  node: TSESTree.Expression,
): string =>
  NEEDS_PARENS_AS_TEST.has(node.type) ? (`(${text})` as const) : text;

/** A comma expression would read as another argument without parentheses. */
const argumentText = (text: string, node: TSESTree.Expression): string =>
  node.type === AST_NODE_TYPES.SequenceExpression
    ? (`(${text})` as const)
    : text;

/**
 * A concise arrow body cannot start with `{`, nor hold a bare comma. The text
 * is what decides the first case rather than the node type, because an object
 * literal keeps its leading brace under an `as const`.
 */
const arrowBodyText = (text: string, node: TSESTree.Expression): string =>
  text.startsWith('{') || node.type === AST_NODE_TYPES.SequenceExpression
    ? (`(${text})` as const)
    : text;
