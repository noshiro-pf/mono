import { Arr } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import {
  IGNORE_FILE_COMMENT_PREFIXES,
  IGNORE_LINE_COMMENT_PREFIXES,
} from '../constants/index.mjs';
import { type TsMorphTransformer } from './types.mjs';

const CANONICAL_LINE_PREFIX = IGNORE_LINE_COMMENT_PREFIXES[0];

const CANONICAL_FILE_PREFIX = IGNORE_FILE_COMMENT_PREFIXES[0];

type IgnoreCommentLevel = 'file' | 'line';

type IgnoreComment = Readonly<{
  level: IgnoreCommentLevel;
  pos: number;
  end: number;
  /** Parsed transformer names. An empty array means "applies to all transformers". */
  names: readonly string[];
}>;

/** Runs the given transformers on `code` and returns the resulting source text. */
type RunTransformers = (
  code: string,
  transformers: readonly TsMorphTransformer[],
) => string;

const splitNames = (rest: string): readonly string[] => {
  const trimmed = rest.trim();

  if (trimmed === '') {
    return [];
  }

  return trimmed
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name !== '');
};

/**
 * Parses a single-line comment such as `// transformer-ignore-next-line a, b`.
 * Returns the listed transformer names, or `undefined` when the comment is not an
 * ignore directive.
 */
const parseLineComment = (text: string): readonly string[] | undefined => {
  const prefix = IGNORE_LINE_COMMENT_PREFIXES.find((p) => text.includes(p));

  if (prefix === undefined) {
    return undefined;
  }

  return splitNames(text.slice(text.indexOf(prefix) + prefix.length));
};

/**
 * Parses a block comment such as the file-level `transformer-ignore` directive.
 * Returns the listed transformer names, or `undefined` when it is not one.
 */
const parseFileComment = (text: string): readonly string[] | undefined => {
  const inner = text.replace(/^\/\*/u, '').replace(/\*\/$/u, '');

  const prefix = IGNORE_FILE_COMMENT_PREFIXES.find((p) => inner.includes(p));

  if (prefix === undefined) {
    return undefined;
  }

  return splitNames(inner.slice(inner.indexOf(prefix) + prefix.length));
};

const toIgnoreComment = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  range: tsm.CommentRange,
): readonly IgnoreComment[] => {
  const text = range.getText();

  const pos = range.getPos();

  const end = range.getEnd();

  if (range.getKind() === tsm.SyntaxKind.SingleLineCommentTrivia) {
    const names = parseLineComment(text);

    return names === undefined ? [] : [{ level: 'line', pos, end, names }];
  }

  if (range.getKind() === tsm.SyntaxKind.MultiLineCommentTrivia) {
    const names = parseFileComment(text);

    return names === undefined ? [] : [{ level: 'file', pos, end, names }];
  }

  return [];
};

const collectIgnoreComments = (
  code: string,
  isTsx: boolean,
): readonly IgnoreComment[] => {
  const project = new tsm.Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      jsx: isTsx ? tsm.ts.JsxEmit.React : undefined,
      target: tsm.ts.ScriptTarget.ESNext,
      module: tsm.ts.ModuleKind.ESNext,
    },
  });

  const sourceFile = project.createSourceFile(
    `source.${isTsx ? 'tsx' : 'ts'}`,
    code,
  );

  const ranges = [sourceFile, ...sourceFile.getDescendants()].flatMap(
    (node) => [
      ...node.getLeadingCommentRanges(),
      ...node.getTrailingCommentRanges(),
    ],
  );

  // Dedupe ranges shared between adjacent nodes (a Map keeps the last per position).
  const uniqueRanges = Array.from(
    new Map(ranges.map((range) => [range.getPos(), range])).values(),
  );

  return uniqueRanges
    .flatMap(toIgnoreComment)
    .toSorted((a, b) => a.pos - b.pos);
};

// Built only from the hard-coded ignore-comment prefixes, so this is safe.
// eslint-disable-next-line security/detect-non-literal-regexp
const IGNORE_COMMENT_STRIP_REGEX = new RegExp(
  [
    String.raw`//\s*(?:${IGNORE_LINE_COMMENT_PREFIXES.join('|')})[^\n]*`,
    String.raw`/\*\s*(?:${IGNORE_FILE_COMMENT_PREFIXES.join('|')})[\s\S]*?\*/`,
  ].join('|'),
  'gu',
);

/**
 * Normalizes source text for comparison: strips ignore comments and collapses all
 * whitespace. Two snippets share a signature iff they differ only in ignore
 * comments and formatting — i.e. the actual transformed code is identical.
 */
const codeSignature = (code: string): string =>
  code.replaceAll(IGNORE_COMMENT_STRIP_REGEX, ' ').replaceAll(/\s+/gu, ' ').trim();

/** Replaces a span with equal-length spaces, neutralizing it without shifting positions. */
const blankSpan = (code: string, start: number, end: number): string =>
  code.slice(0, start) + ' '.repeat(end - start) + code.slice(end);

/**
 * Determines whether removing this comment would change `transformer`'s output for
 * the code it protects. If not, the comment (or the relevant name in it) is
 * redundant.
 */
const isCommentNecessary = (
  code: string,
  comment: IgnoreComment,
  transformer: TsMorphTransformer,
  run: RunTransformers,
): boolean => {
  const withComment = codeSignature(run(code, [transformer]));

  const withoutComment = codeSignature(
    run(blankSpan(code, comment.pos, comment.end), [transformer]),
  );

  return withComment !== withoutComment;
};

const buildCanonicalComment = (
  level: IgnoreCommentLevel,
  names: readonly string[],
): string =>
  level === 'line'
    ? `// ${CANONICAL_LINE_PREFIX} ${names.join(', ')}`
    : `/* ${CANONICAL_FILE_PREFIX} ${names.join(', ')} */`;

/** Removes a comment span, dropping the whole line when the comment stands alone. */
const removeCommentSpan = (code: string, pos: number, end: number): string => {
  const lineStart = code.lastIndexOf('\n', pos - 1) + 1;

  const before = code.slice(lineStart, pos);

  if (before.trim() === '') {
    const newlineIndex = code.indexOf('\n', end);

    const lineEnd = newlineIndex === -1 ? code.length : newlineIndex + 1;

    return code.slice(0, lineStart) + code.slice(lineEnd);
  }

  // Trailing comment: drop the comment and the whitespace separating it from code.
  const keepBefore = before.replace(/\s+$/u, '');

  return code.slice(0, lineStart + keepBefore.length) + code.slice(end);
};

type CommentEdit = Readonly<
  | { type: 'remove'; pos: number; end: number }
  | { type: 'replace'; pos: number; end: number; text: string }
>;

const planEdit = (
  code: string,
  comment: IgnoreComment,
  transformerByName: ReadonlyMap<string, TsMorphTransformer>,
  run: RunTransformers,
): readonly CommentEdit[] => {
  // "Apply to all" comments cannot be safely evaluated against a partial
  // transformer set, so they are left untouched.
  if (Arr.isArrayOfLength(comment.names, 0)) {
    return [];
  }

  const keptNames = Arr.uniq(
    comment.names.filter((name) => {
      const transformer = transformerByName.get(name);

      // Names for transformers outside this run are preserved as-is.
      return (
        transformer === undefined ||
        isCommentNecessary(code, comment, transformer, run)
      );
    }),
  );

  if (Arr.isArrayOfLength(keptNames, 0)) {
    return [{ type: 'remove', pos: comment.pos, end: comment.end }];
  }

  const canonical = buildCanonicalComment(comment.level, keptNames);

  return canonical === code.slice(comment.pos, comment.end)
    ? []
    : [{ type: 'replace', pos: comment.pos, end: comment.end, text: canonical }];
};

const applyEdit = (code: string, edit: CommentEdit): string =>
  edit.type === 'remove'
    ? removeCommentSpan(code, edit.pos, edit.end)
    : code.slice(0, edit.pos) + edit.text + code.slice(edit.end);

/**
 * Removes ignore comments that no longer suppress anything and normalizes the rest
 * (drops redundant transformer names, canonicalizes the prefix).
 *
 * Only transformer names present in `transformers` are evaluated; names referencing
 * transformers outside the current run, and "apply to all" comments with no names,
 * are left untouched because their necessity cannot be determined here.
 */
export const pruneIgnoreComments = (
  code: string,
  isTsx: boolean,
  transformers: readonly TsMorphTransformer[],
  run: RunTransformers,
): string => {
  const hasAnyPrefix =
    IGNORE_LINE_COMMENT_PREFIXES.some((p) => code.includes(p)) ||
    IGNORE_FILE_COMMENT_PREFIXES.some((p) => code.includes(p));

  if (!hasAnyPrefix) {
    return code;
  }

  const comments = collectIgnoreComments(code, isTsx);

  if (Arr.isArrayOfLength(comments, 0)) {
    return code;
  }

  const transformerByName = new Map(
    transformers.map((transformer) => [transformer.name, transformer] as const),
  );

  const edits = comments.flatMap((comment) =>
    planEdit(code, comment, transformerByName, run),
  );

  // Apply right-to-left so earlier positions remain valid.
  return edits.toSorted((a, b) => b.pos - a.pos).reduce(applyEdit, code);
};
