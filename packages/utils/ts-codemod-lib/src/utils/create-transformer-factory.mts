import * as ts from 'typescript';

export const createTransformerFactory =
  (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    genVisitor: (context: ts.TransformationContext) => ts.Visitor,
  ): ts.TransformerFactory<ts.SourceFile> =>
  (context) =>
  (rootNode) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ts.visitNode(rootNode, genVisitor(context), ts.isSourceFile)!;
