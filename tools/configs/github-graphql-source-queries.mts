import * as fs from 'node:fs';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import * as ts from 'typescript';

/**
 * The GraphQL written in the files under `srcDir` that none of `sent`
 * contains, each as `<file>:<line> <its first line>`, `<file>` relative to
 * `srcDir`. Test files are left out.
 *
 * The `github-graphql.test.mts` in `libs/pr-merge-queue` and in
 * `apps/pr-manager` validate the requests they are given, so a query none of
 * them carries is validated by nothing short of GitHub. This names it, so
 * that registering a query is not a step someone has to remember.
 *
 * GraphQL here is a string, or a template literal, that begins an operation
 * (`query Name(`, `mutation (`, `query ${name}(`) or binds an argument to a
 * variable (`pullRequest(number: $`, `, after: $`), as a field built per
 * alias does. One in an array is the array, joined. It is contained
 * in a request when its fixed text appears in it in order, whitespace
 * ignored, whatever the substitutions and the elements that are not literals
 * turned into. A part of a query that is neither — a list of fields in a
 * constant, a branch that only adds a field — is seen only through the query
 * it is spliced into, and a branch never taken by a test request is not seen
 * at all.
 */
export const queriesNotSent = (
  srcDir: string,
  sent: readonly string[],
): readonly string[] => {
  const sentTexts = sent.map(withoutWhitespace);

  return sourceFilesIn(srcDir).flatMap((file) =>
    queriesIn(
      file,
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFileSync(path.join(srcDir, file), 'utf8'),
    )
      .filter(({ pieces }) =>
        sentTexts.every((text) => !containsInOrder(text, pieces)),
      )
      .map(({ line, firstLine }) => `${file}:${line} ${firstLine}`),
  );
};

type SourceQuery = Readonly<{
  /** Where its first line is, counted from 1. */
  line: number;
  /** As written, a substitution shown as `…`. */
  firstLine: string;
  /**
   * Its fixed text without whitespace, split where a substitution or an
   * element that is not a literal goes.
   */
  pieces: readonly string[];
}>;

/** A string, or the part of a template literal between substitutions. */
type LiteralPiece =
  | ts.NoSubstitutionTemplateLiteral
  | ts.StringLiteral
  | ts.TemplateHead
  | ts.TemplateMiddle
  | ts.TemplateTail;

/** `query Read(`, `mutation (`, `query {`. */
const OPERATION = /^\s*(?:query|mutation|subscription)\b\s*\w*\s*[({]/u;

/** `query ` before the substitution that names it. */
const OPERATION_BEFORE_NAME = /^\s*(?:query|mutation|subscription)\s+$/u;

/** `(number: $` and `, after: $`, before a variable's name. */
const VARIABLE_ARGUMENT = /[(,]\s*\w+\s*:\s*\$/u;

const withoutWhitespace = (text: string): string =>
  text.replaceAll(/\s+/gu, '');

/** Whether `pieces` appear in `text` in order, none overlapping the next. */
const containsInOrder = (text: string, pieces: readonly string[]): boolean => {
  if (!Arr.isNonEmpty(pieces)) {
    return true;
  }

  const [first, ...rest] = pieces;

  const at = text.indexOf(first);

  return at !== -1 && containsInOrder(text.slice(at + first.length), rest);
};

const isWrapper = (
  node: ts.Node,
): node is
  | ts.AsExpression
  | ts.NonNullExpression
  | ts.ParenthesizedExpression
  | ts.SatisfiesExpression
  | ts.TypeAssertion =>
  ts.isParenthesizedExpression(node) ||
  ts.isAsExpression(node) ||
  ts.isSatisfiesExpression(node) ||
  ts.isNonNullExpression(node) ||
  ts.isTypeAssertionExpression(node);

/** `node` without the type assertions and parentheses around it. */
const innermost = (node: ts.Node): ts.Node =>
  isWrapper(node) ? innermost(node.expression) : node;

/** `node` with what it is the operand of a type assertion or parentheses in. */
const outermost = (node: ts.Node): ts.Node =>
  isWrapper(node.parent) ? outermost(node.parent) : node;

const isLiteralPiece = (node: ts.Node): node is LiteralPiece =>
  ts.isStringLiteral(node) ||
  ts.isNoSubstitutionTemplateLiteral(node) ||
  ts.isTemplateHead(node) ||
  ts.isTemplateMiddle(node) ||
  ts.isTemplateTail(node);

/** Every string and template literal part in `node`, `node` included. */
const literalPiecesIn = (node: ts.Node): readonly ts.Node[] => {
  const mut_children: ts.Node[] = [];

  ts.forEachChild(node, (child) => {
    mut_children.push(child);
  });

  return [
    ...(isLiteralPiece(node) ? [node] : []),
    ...mut_children.flatMap(literalPiecesIn),
  ];
};

const marksQuery = (piece: ts.Node): boolean =>
  isLiteralPiece(piece) &&
  (OPERATION.test(piece.text) ||
    VARIABLE_ARGUMENT.test(piece.text) ||
    (ts.isTemplateHead(piece) && OPERATION_BEFORE_NAME.test(piece.text)));

/** The template literal a part of one belongs to, or the string itself. */
const ownerOf = (piece: ts.Node): ts.Node =>
  ts.isTemplateHead(piece)
    ? piece.parent
    : ts.isTemplateMiddle(piece) || ts.isTemplateTail(piece)
      ? piece.parent.parent
      : piece;

/**
 * What is checked as one query: the array `piece` is an element of,
 * otherwise the literal it is part of.
 */
const constructOf = (piece: ts.Node): ts.Node => {
  const owner = outermost(ownerOf(piece));

  return ts.isArrayLiteralExpression(owner.parent) ? owner.parent : owner;
};

/**
 * The text of a literal, a template literal or an array of them joined by
 * newlines, with `undefined` where a substitution or an element that is not
 * a literal goes.
 */
const fragmentsOf = (node: ts.Node): readonly (string | undefined)[] => {
  const inner = innermost(node);

  if (ts.isStringLiteral(inner) || ts.isNoSubstitutionTemplateLiteral(inner)) {
    return [inner.text];
  }

  if (ts.isTemplateExpression(inner)) {
    return Arr.toUnshifted(inner.head.text)(
      inner.templateSpans.flatMap((span) => [undefined, span.literal.text]),
    );
  }

  if (ts.isArrayLiteralExpression(inner)) {
    return inner.elements.flatMap((element, index) => [
      ...(index === 0 ? [] : ['\n']),
      ...fragmentsOf(element),
    ]);
  }

  return [undefined];
};

const render = (node: ts.Node): string =>
  fragmentsOf(node)
    .map((fragment) => fragment ?? '…')
    .join('');

/** The GraphQL in one file, once for each array or literal it is written in. */
const queriesIn = (
  fileName: string,
  sourceText: string,
): readonly SourceQuery[] => {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  return Arr.uniqBy(
    literalPiecesIn(sourceFile)
      .filter(marksQuery)
      .map((piece) => ({
        owner: ownerOf(piece),
        construct: constructOf(piece),
      })),
    ({ construct }) => `${construct.pos}-${construct.end}`,
  ).map(({ owner, construct }) => {
    const lines = render(owner).split('\n');

    const index = Math.max(
      0,
      lines.findIndex((line) => line.trim() !== ''),
    );

    return {
      line:
        sourceFile.getLineAndCharacterOfPosition(owner.getStart(sourceFile))
          .line +
        index +
        1,
      firstLine: (lines[index] ?? '').trim(),
      pieces: fragmentsOf(construct)
        .map((fragment) =>
          fragment === undefined ? '\0' : withoutWhitespace(fragment),
        )
        .join('')
        .split('\0')
        .filter((text) => text !== ''),
    };
  });
};

/** The source files under `srcDir`, as `/`-separated relative paths. */
const sourceFilesIn = (srcDir: string): readonly string[] => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const entries = fs.readdirSync(srcDir, {
    recursive: true,
    encoding: 'utf8',
  });

  return Arr.toSorted(
    entries
      .map((file) => file.replaceAll(path.sep, '/'))
      .filter(
        (file) =>
          /\.(?:mts|tsx?)$/u.test(file) && !/\.(?:test|d)\.[^./]+$/u.test(file),
      ),
    (a, b) => a.localeCompare(b),
  );
};
