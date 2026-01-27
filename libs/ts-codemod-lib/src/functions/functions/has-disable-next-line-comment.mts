import * as tsm from 'ts-morph';
import { IGNORE_LINE_COMMENT_PREFIX } from '../constants/index.mjs';

/**
 * Checks if a given ts-morph Node is immediately preceded by a
 * '// transformer-ignore-next-line' comment, optionally filtered by transformer name(s).
 *
 * @param node - The ts-morph Node to check.
 * @param transformerName - Optional transformer name to check for specific ignore directive.
 *                          If provided, only ignores if the comment specifies this transformer.
 *                          Supports ESLint-style syntax like:
 *                          - `// transformer-ignore-next-line` (ignores all transformers)
 *                          - `// transformer-ignore-next-line append-as-const` (specific transformer)
 *                          - `// transformer-ignore-next-line append-as-const, replace-any-with-unknown` (multiple transformers)
 * @returns True if the node is preceded by the ignore comment on the immediately previous line, false otherwise.
 */
export const hasDisableNextLineComment = (
  node: tsm.Node,
  transformerName?: string,
): boolean => {
  const nodeStartLine = node.getStartLineNumber();

  // Cannot be ignored if it's on the first line
  if (nodeStartLine <= 1) {
    return false;
  }

  const sourceFile = node.getSourceFile(); // Get the SourceFile

  const leadingCommentRanges = node.getLeadingCommentRanges();

  // Iterate backwards through comments as the closest one is most relevant
  for (let mut_i = leadingCommentRanges.length - 1; mut_i >= 0; mut_i--) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const commentRange = leadingCommentRanges[mut_i]!;

    // Get the end position and convert it to line number
    const commentEndPos = commentRange.getEnd();

    const commentEndLine = sourceFile.getLineAndColumnAtPos(commentEndPos).line;

    // Check if the comment is on the immediately preceding line
    if (nodeStartLine === commentEndLine + 1) {
      // Check if it's a single-line comment containing the specific ignore text
      if (commentRange.getKind() === tsm.SyntaxKind.SingleLineCommentTrivia) {
        const commentText = commentRange.getText().trim();

        if (commentText.includes(IGNORE_LINE_COMMENT_PREFIX)) {
          // Extract the part after the prefix
          const afterPrefix = commentText
            .slice(commentText.indexOf(IGNORE_LINE_COMMENT_PREFIX))
            .replace(IGNORE_LINE_COMMENT_PREFIX, '')
            .trim();

          // If no transformer name specified, check if comment applies to all transformers
          if (transformerName === undefined) {
            return true;
          }

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
