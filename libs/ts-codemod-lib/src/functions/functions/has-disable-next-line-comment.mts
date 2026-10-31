import { Arr } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import { IGNORE_LINE_COMMENT_PREFIXES } from '../constants/index.mjs';

/**
 * Checks if a given ts-morph Node is immediately preceded by an ignore-next-line comment,
 * optionally filtered by transformer name(s).
 *
 * @param node - The ts-morph Node to check.
 * @param transformerName - Optional transformer name to check for specific ignore directive.
 *                          If provided, only ignores if the comment specifies this transformer.
 *                          Supports ESLint-style syntax like:
 *                          - `// transformer-ignore-next-line` (ignores all transformers)
 *                          - `// transformer-ignore-next-line append-as-const` (specific transformer)
 *                          - `// transformer-ignore-next-line append-as-const, replace-any-with-unknown` (multiple transformers)
 *                          - Also accepts `ts-codemod-ignore-next-line`, `codemod-ignore-next-line`, `transform-ignore-next-line`
 * @returns True if the node is preceded by the ignore comment on the immediately previous line, false otherwise.
 */
export const hasDisableNextLineComment = (
  node: tsm.Node,
  transformerName?: string,
): boolean => {
  // Most nodes have no leading comment, and then nothing below can match.
  // Asking first spares them the line numbers, the costly part.
  const leadingCommentRanges = node.getLeadingCommentRanges();

  if (Arr.isEmpty(leadingCommentRanges)) {
    return false;
  }

  const lineNumberAt = lineNumberLookup(node.getSourceFile().compilerNode);

  const nodeStartLine = lineNumberAt(node.getStart());

  // Cannot be ignored if it's on the first line
  if (nodeStartLine <= 1) {
    return false;
  }

  // Iterate backwards through comments as the closest one is most relevant
  for (let mut_i = leadingCommentRanges.length - 1; mut_i >= 0; mut_i--) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const commentRange = leadingCommentRanges[mut_i]!;

    // Get the end position and convert it to line number
    const commentEndPos = commentRange.getEnd();

    const commentEndLine = lineNumberAt(commentEndPos);

    // Check if the comment is on the immediately preceding line
    if (nodeStartLine === commentEndLine + 1) {
      // Check if it's a single-line comment containing the specific ignore text
      if (commentRange.getKind() === tsm.SyntaxKind.SingleLineCommentTrivia) {
        const commentText = commentRange.getText().trim();

        // Check if the comment contains any of the supported ignore prefixes
        const matchedPrefix = IGNORE_LINE_COMMENT_PREFIXES.find((prefix) =>
          commentText.includes(prefix),
        );

        if (matchedPrefix !== undefined) {
          // If no transformer name specified, check if comment applies to all transformers
          if (transformerName === undefined) {
            return true;
          }

          // Extract the part after the prefix
          const afterPrefix = commentText
            .slice(commentText.indexOf(matchedPrefix))
            .replace(matchedPrefix, '')
            .trim();

          // If no specific transformers listed in comment, it applies to all
          if (afterPrefix === '') {
            return true;
          }

          // Check if the transformer name is in the comma-separated list
          const targetTransformers = afterPrefix
            .split(',')
            .map((name) => name.trim());

          return targetTransformers.includes(transformerName);
        }
      }

      // If we found *any* comment on the preceding line, but it wasn't
      // the correct ignore comment, then the node is not ignored by
      // a comment on the *immediately* preceding line. Stop checking further back.
      return false;
    }

    // If the comment ends before the preceding line, stop checking further back.
    if (commentEndLine < nodeStartLine - 1) {
      break;
    }
  }

  return false;
};

const newlinePositionsOf = (text: string): readonly number[] => {
  const mut_positions: number[] = [];

  for (
    let mut_index = text.indexOf('\n');
    mut_index !== -1;
    mut_index = text.indexOf('\n', mut_index + 1)
  ) {
    mut_positions.push(mut_index);
  }

  return mut_positions;
};

/** The number of elements of the ascending `sorted` that are below `value`. */
const countLessThan = (sorted: readonly number[], value: number): number => {
  let mut_low = 0;

  let mut_high = sorted.length;

  while (mut_low < mut_high) {
    const mid = Math.floor((mut_low + mut_high) / 2);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (sorted[mid]! < value) {
      mut_low = mid + 1;
    } else {
      mut_high = mid;
    }
  }

  return mut_low;
};

/**
 * The 1-based line number of a position in `sourceFile`, counted the way
 * ts-morph's `getStartLineNumber` and `getLineAndColumnAtPos` count it: one
 * plus the number of `\n` before the position (a lone `\r` starts no line,
 * unlike in the compiler's own line map).
 *
 * ts-morph scans the text from its start on every call, which made this
 * check, asked of every node a transformer visits, quadratic in the size of
 * the file. The newline positions are collected once per compiler source file
 * instead. ts-morph replaces that object whenever the file is edited, so an
 * entry never outlives the text it was collected from.
 */
const lineNumberLookup = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.ts.SourceFile,
): ((pos: number) => number) => {
  const cached = newlinePositionsCache.get(sourceFile);

  const newlinePositions = cached ?? newlinePositionsOf(sourceFile.text);

  if (cached === undefined) {
    newlinePositionsCache.set(sourceFile, newlinePositions);
  }

  return (pos) => countLessThan(newlinePositions, pos) + 1;
};

const newlinePositionsCache = new WeakMap<
  tsm.ts.SourceFile,
  readonly number[]
>();
