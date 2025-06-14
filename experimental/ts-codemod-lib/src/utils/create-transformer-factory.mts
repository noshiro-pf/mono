import * as ts from 'typescript';
import { IGNORE_FILE_COMMENT_TEXT } from '../constants/index.mjs';

export const createTransformerFactory =
  (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    genVisitor: (context: ts.TransformationContext) => ts.Visitor,
  ): ts.TransformerFactory<ts.SourceFile> =>
  (context) =>
  // return a transformer
  (rootNode) =>
    rootNode.getFullText().includes(IGNORE_FILE_COMMENT_TEXT)
      ? rootNode
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ts.visitNode(rootNode, genVisitor(context), ts.isSourceFile)!;
