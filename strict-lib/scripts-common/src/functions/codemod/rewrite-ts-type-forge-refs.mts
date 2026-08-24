import * as ts from 'typescript';

const TS_TYPE_FORGE = 'ts-type-forge';

/**
 * ts-type-forge type names that the generated lib references. Only bare type
 * references to these names are rewritten; anything qualified by a repo-owned
 * namespace (`NumberType.*`, `StrictLibInternals.*`) is left alone because its
 * leftmost identifier is not in this set. `convert-dts` emits exactly these, so
 * the list is closed; a missing entry surfaces as an unresolved-type error in
 * the per-version lib-check (`skipLibCheck: false`).
 */
const tsTypeForgeTypeNames: ReadonlySet<string> = new Set([
  // brandedNumberFromTypeUtils
  'FiniteNumber',
  'Int',
  'NaNType',
  'NEGATIVE_INFINITY',
  'POSITIVE_INFINITY',
  'PositiveNumber',
  'NonNegativeNumber',
  'InfiniteNumber',
  'Int16',
  'Uint16',
  'Int32',
  'Uint32',
  'Float16',
  'Float32',
  'Float64',
  'BigInt64',
  'BigUint64',
  'SafeInt',
  'SafeUint',
  'NegativeInt32',
  'SmallInt',
  // utility types used in signatures / StrictLibInternals bodies
  'WidenLiteral',
  'ValueOf',
  'WithSmallInt',
  'IntersectBrand',
  'UnknownRecord',
  'MutableRecord',
  'ReadonlyRecord',
  'MutableJsonValue',
  'JsonValue',
  'JsonObject',
  'MutableJsonObject',
  'JsonPrimitive',
  'MergeIntersection',
  'TypeEq',
  'List',
  'Decrement',
  'IsUnion',
  'IsFixedLengthList',
  'Int8',
  'Uint8',
  'UintRange',
  'AbsoluteValue',
  'RelaxedExclude',
  'HTTPRequestMethod',
  'DateEnum',
  'MonthIndexEnum',
  'DayOfWeekIndex',
  'HoursEnum',
  'MinutesEnum',
  'SecondsEnum',
  'MillisecondsEnum',
]);

/** The leftmost identifier of an entity name (`A.B.C` -> `A`). */
const leftmostIdentifier = (name: ts.EntityName): ts.Identifier =>
  ts.isIdentifier(name) ? name : leftmostIdentifier(name.left);

/**
 * Rewrites the generated strict lib so it no longer leaks ts-type-forge's
 * global augmentations into the install site:
 *
 * - drops the `/// <reference types="ts-type-forge/global" />` directive, and
 * - rewrites every bare ts-type-forge *type reference* to an inline
 *   `import('ts-type-forge').X` (a type-only import type, which keeps the file
 *   a global lib script and does not add any global name).
 *
 * Only type-reference positions are touched, so value positions that happen to
 * share a name (e.g. the `NEGATIVE_INFINITY` property) are left untouched.
 */
export const rewriteTsTypeForgeRefs = (code: string): string => {
  const sf = ts.createSourceFile(
    'lib.d.ts',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const mut_spans: Readonly<{
    start: number;
    end: number;
    name: string;
  }>[] = [] as const;

  const visit = (node: ts.Node): void => {
    if (ts.isTypeReferenceNode(node)) {
      const id = leftmostIdentifier(node.typeName);

      if (tsTypeForgeTypeNames.has(id.text)) {
        mut_spans.push({
          start: id.getStart(sf),
          end: id.getEnd(),
          name: id.text,
        });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sf);

  // Apply from the end so earlier offsets stay valid.
  const sorted = mut_spans.toSorted((a, b) => b.start - a.start);

  let out = code;

  for (const span of sorted) {
    out = `${out.slice(0, span.start)}import('${TS_TYPE_FORGE}').${span.name}${out.slice(span.end)}`;
  }

  return out;
};
