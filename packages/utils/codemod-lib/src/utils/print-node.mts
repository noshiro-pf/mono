import * as ts from 'typescript';

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

export const printNode = (newNode: ts.Node): string =>
  printer.printNode(ts.EmitHint.Unspecified, newNode, newNode.getSourceFile());
