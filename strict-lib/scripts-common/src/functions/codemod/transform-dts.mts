import * as ts from 'typescript';

/**
 * A single text edit against the original source. `start === end` denotes a
 * pure insertion; otherwise the span `[start, end)` is replaced by `text`.
 */
type Edit = Readonly<{
  start: number;
  end: number;
  text: string;
  /**
   * DFS discovery order. Used only to break ties when several edits share the
   * same `start`, so that outer-node insertions land before inner-node ones
   * (needed for nested array parenthesization).
   */
  seq: number;
}>;

const READONLY_PREFIX = 'readonly ';

/** Bare collection type references that have a `Readonly*` counterpart. */
const readonlyCollectionRename = new Map<string, string>([
  ['Array', 'ReadonlyArray'],
  ['Map', 'ReadonlyMap'],
  ['Set', 'ReadonlySet'],
]);

const hasReadonlyModifier = (node: ts.Node): boolean =>
  ts.canHaveModifiers(node) &&
  (ts.getModifiers(node) ?? []).some(
    (m) => m.kind === ts.SyntaxKind.ReadonlyKeyword,
  );

const isReadonlyOperator = (node: ts.Node | undefined): boolean =>
  node !== undefined &&
  ts.isTypeOperatorNode(node) &&
  node.operator === ts.SyntaxKind.ReadonlyKeyword;

/**
 * Whether an `any` keyword is the array element of a rest parameter
 * (`...args: any[]`).
 *
 * Such `any`s are left untouched, mirroring `@typescript-eslint/no-explicit-any`
 * with `ignoreRestArgs: true`, which ignores rest-parameter *arrays* only (a
 * bare `...args: any` is still converted to `unknown`). The downstream
 * `convert-dts` step relies on this: e.g. `dom-common.mts` expects to find
 * `readonly any[]` in the intermediate.
 */
const isRestArgAny = (anyNode: ts.Node): boolean => {
  const parent = anyNode.parent;

  return (
    ts.isArrayTypeNode(parent) &&
    parent.elementType === anyNode &&
    ts.isParameter(parent.parent) &&
    parent.parent.dotDotDotToken !== undefined &&
    parent.parent.type === parent
  );
};

/**
 * Apply the strict-lib source transformations to a single `.d.ts` file:
 *
 * - `any` -> `unknown` (always).
 * - When `addReadonly` is `true`, additionally add `readonly` to object
 *   property/index signatures and mapped types, add `readonly` to array and
 *   tuple types, and rename `Array` / `Map` / `Set` type references to their
 *   `ReadonlyArray` / `ReadonlyMap` / `ReadonlySet` counterparts.
 *
 * This mirrors the transformations previously produced by the ESLint
 * `@typescript-eslint/no-explicit-any` (`fixToUnknown`) and
 * `functional/prefer-readonly-type` rules, which the downstream `convert-dts`
 * step is calibrated against.
 *
 * It is implemented as a single-pass, text-splice transform over the raw
 * TypeScript AST (no type checker, no printer round-trip), so comments and
 * formatting are preserved byte-for-byte outside the edited spans. This is
 * dramatically faster than a ts-morph / printer round-trip, which took tens of
 * seconds per large lib file.
 */
export const transformDeclarationFile = (
  code: string,
  addReadonly: boolean,
): string => {
  const sf = ts.createSourceFile(
    'file.d.ts',
    code,
    ts.ScriptTarget.Latest,
    true, // setParentNodes: required for parent-based checks below
    ts.ScriptKind.TS,
  );

  const mut_edits: Edit[] = [];

  let seq = 0 as const;

  const insert = (pos: number, text: string): void => {
    mut_edits.push({ start: pos, end: pos, text, seq });

    seq += 1;
  };

  const replace = (start: number, end: number, text: string): void => {
    mut_edits.push({ start, end, text, seq });

    seq += 1;
  };

  const addReadonlyEdits = (node: ts.Node): void => {
    if (
      (ts.isPropertySignature(node) || ts.isIndexSignatureDeclaration(node)) &&
      !hasReadonlyModifier(node)
    ) {
      insert(node.getStart(sf), READONLY_PREFIX);

      return;
    }

    if (ts.isMappedTypeNode(node)) {
      const rt = node.readonlyToken;

      if (rt === undefined) {
        // Plain `[K in ...]`: insert `readonly ` before the opening `[`.
        const bracket = node
          .getChildren(sf)
          .find((c) => c.kind === ts.SyntaxKind.OpenBracketToken);

        if (bracket !== undefined) {
          insert(bracket.getStart(sf), READONLY_PREFIX);
        }
      } else if (rt.kind === ts.SyntaxKind.MinusToken) {
        // `-readonly [K in ...]`: prepend `readonly `, yielding the
        // `readonly -readonly` marker that `convert-dts` (convert-main.mts)
        // rewrites per-config to `readonly` or `-readonly`. (A plain
        // `readonly` / `+readonly` mapped type is left as-is.)
        insert(rt.getStart(sf), READONLY_PREFIX);
      }

      return;
    }

    if (ts.isArrayTypeNode(node) || ts.isTupleTypeNode(node)) {
      if (isReadonlyOperator(node.parent)) {
        return; // already `readonly T[]` / `readonly [...]`
      }

      // Parenthesize when a postfix `[]` / `[K]` would otherwise bind tighter
      // than the inserted `readonly`:
      //   `T[][]`       -> `readonly (readonly T[])[]`
      //   `[...][Idx]`  -> `(readonly [...])[Idx]`
      const parent = node.parent;

      const needsParens =
        (ts.isArrayTypeNode(parent) && parent.elementType === node) ||
        (ts.isIndexedAccessTypeNode(parent) && parent.objectType === node);

      const start = node.getStart(sf);

      if (needsParens) {
        insert(start, '(');
      }

      insert(start, READONLY_PREFIX);

      if (needsParens) {
        insert(node.getEnd(), ')');
      }

      return;
    }

    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      const renamed = readonlyCollectionRename.get(node.typeName.text);

      if (renamed !== undefined) {
        replace(node.typeName.getStart(sf), node.typeName.getEnd(), renamed);
      }
    }
  };

  const visit = (node: ts.Node): void => {
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      if (!isRestArgAny(node)) {
        replace(node.getStart(sf), node.getEnd(), 'unknown');
      }
    } else if (addReadonly) {
      addReadonlyEdits(node);
    }

    ts.forEachChild(node, visit);
  };

  visit(sf);

  const sorted = mut_edits.toSorted((a, b) =>
    a.start !== b.start ? a.start - b.start : a.seq - b.seq,
  );

  let out = '' as const;

  let mut_cursor = 0;

  for (const e of sorted) {
    out += code.slice(mut_cursor, e.start);

    out += e.text;

    mut_cursor = e.end;
  }

  out += code.slice(mut_cursor);

  return out;
};
