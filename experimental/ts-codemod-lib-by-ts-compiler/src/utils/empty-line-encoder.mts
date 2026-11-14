// https://github.com/Serj-Tm/ts-empty-line-encoder/blob/master/encoder.ts
// https://stackoverflow.com/a/58382419

// Hack to preserve empty line

// NOTE: This marker may appear within other multi-line comments, but it is OK to replace with line comments.
const emptyLineMarker = '//--empty-line--4c6654a3-456f-49b8-b1ca-720d17638f04';

const newLine = '\n';

export const encodeEmptyLines = (text: string): string => {
  const lines = text.split(/\r?\n/u);

  const commentedLines = lines.map((line) =>
    line.trim() === '' ? emptyLineMarker : line,
  );

  return commentedLines.join(newLine);
};

export const decodeEmptyLines = (text: string): string => {
  const lines = text.split(/\r?\n/u);

  const uncommentedLines = lines.map((line) =>
    line.trim() === emptyLineMarker ? '' : line,
  );

  return uncommentedLines.join(newLine);
};

// export const addLeadingEmptyLineMarker = <T extends ts.Node>(node: T): T =>
//   ts.addSyntheticLeadingComment(
//     node,
//     ts.SyntaxKind.MultiLineCommentTrivia,
//     emptyLineMarker,
//     /* hasTrailingNewLine */ true,
//   );
