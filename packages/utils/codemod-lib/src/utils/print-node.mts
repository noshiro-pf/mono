import * as ts from 'typescript';

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

export const printNode = (
  newNode: ts.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  originalSourceFile: ts.SourceFile,
): string =>
  printer.printNode(
    ts.EmitHint.Unspecified, // ヒント
    newNode, // 作成したノード
    originalSourceFile, // ★ SourceFile を渡す
  );
