import * as ts from 'typescript';
import { DISABLE_COMMENT_TEXT } from './constants.js';

export const hasDisableNextLineComment = (node: ts.Node): boolean => {
  // --- Logic to determine if skipping is needed ---
  let mut_sourceFile: ts.SourceFile | undefined;
  let mut_sourceText: string | undefined;

  try {
    mut_sourceFile = node.getSourceFile();
    mut_sourceText = mut_sourceFile.getFullText();
  } catch (error) {
    console.error(error);
    // Error handling because some nodes might not have a SourceFile
    // console.warn("Could not get SourceFile for node:", node.kind);
    // In this case, proceed without checking for skips (continue with normal transformation)
    return false;
  }

  try {
    const nodePos = node.getStart(mut_sourceFile); // Start position of the node body

    const nodeLine = ts.getLineAndCharacterOfPosition(
      mut_sourceFile,
      nodePos,
    ).line; // 0-based line number

    // If not on the first line (line 0), check comments on the previous line
    if (nodeLine > 0) {
      // Get leading comments for the node (use getFullStart to include trivia)
      const commentRanges = ts.getLeadingCommentRanges(
        mut_sourceText,
        node.getFullStart(),
      );

      if (commentRanges !== undefined && commentRanges.length > 0) {
        // Check comments starting from the end (closest to the node)
        for (let mut_i = commentRanges.length - 1; mut_i >= 0; mut_i--) {
          const commentRange = commentRanges[mut_i];

          if (commentRange === undefined) {
            continue;
          }

          const commentEndLine = ts.getLineAndCharacterOfPosition(
            mut_sourceFile,
            commentRange.end,
          ).line;

          // Does the comment end on the line immediately preceding the node?
          if (commentEndLine === nodeLine - 1) {
            // Check the comment's content
            if (commentRange.kind === ts.SyntaxKind.SingleLineCommentTrivia) {
              const commentText = mut_sourceText.slice(
                // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                commentRange.pos as NumberType.StringSizeArg,
                // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                commentRange.end as NumberType.StringSizeArg,
              );
              if (commentText.includes(DISABLE_COMMENT_TEXT)) {
                return true; // Found the disable comment, skip transformation
              }
            }
            // If a comment was found on the preceding line but it wasn't the disable comment,
            // we likely don't need to check earlier comments, so break.
            break;
          }

          // Performance consideration: If the comment is more than one line before the node, subsequent comments are irrelevant.
          if (commentEndLine < nodeLine - 1) {
            break;
          }
        }
      }
    }
  } catch (error) {
    // Consider that getLineAndCharacterOfPosition etc. might fail
    console.error('Error during disable comment check:', error);
    // To be safe, don't skip if an error occurs
  }

  return false;
};
