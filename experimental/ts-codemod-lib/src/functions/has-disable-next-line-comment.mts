import { toSafeInt } from '@noshiro/ts-utils';
import * as ts from 'typescript';
import { IGNORE_LINE_COMMENT_TEXT } from '../constants/index.mjs';

export const hasDisableNextLineComment = (node: ts.Node): boolean => {
  // --- Logic to determine if skipping is needed ---

  const sourceFileAndSourceText = getSourceFileAndSourceText(node);
  if (sourceFileAndSourceText === undefined) {
    return false;
  }
  const [sourceFile, sourceText] = sourceFileAndSourceText;

  try {
    const nodePos = node.getStart(sourceFile); // Start position of the node body

    const nodeLine = ts.getLineAndCharacterOfPosition(sourceFile, nodePos).line; // 0-based line number

    // If not on the first line (line 0), check comments on the previous line
    if (nodeLine > 0) {
      // Get leading comments for the node (use getFullStart to include trivia)
      const commentRanges = ts.getLeadingCommentRanges(
        sourceText,
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
            sourceFile,
            commentRange.end,
          ).line;

          // Does the comment end on the line immediately preceding the node?
          if (commentEndLine === nodeLine - 1) {
            // Check the comment's content
            if (commentRange.kind === ts.SyntaxKind.SingleLineCommentTrivia) {
              const commentText = sourceText.slice(
                toSafeInt(commentRange.pos),
                toSafeInt(commentRange.end),
              );
              if (commentText.includes(IGNORE_LINE_COMMENT_TEXT)) {
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

const getSourceFileAndSourceText = (
  node: ts.Node,
): readonly [ts.SourceFile, string] | undefined => {
  let mut_sourceFile: ts.SourceFile | undefined;
  let mut_sourceText: string | undefined;

  try {
    mut_sourceFile = node.getSourceFile();
    mut_sourceText = mut_sourceFile.getFullText();
  } catch {
    // console.debug(error);
    // Error handling because some nodes might not have a SourceFile
    // console.debug(
    //   'Could not get SourceFile for node:',
    //   ts.SyntaxKind[node.kind],
    // );
    // In this case, proceed without checking for skips (continue with normal transformation)
    return undefined;
  }

  return [mut_sourceFile, mut_sourceText];
};
