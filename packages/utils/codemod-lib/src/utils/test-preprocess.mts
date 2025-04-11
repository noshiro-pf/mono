import { pipe } from '@noshiro/ts-utils';
import * as ts from 'typescript';

export const testPreprocess = (
  transformerFactory: ts.TransformerFactory<ts.SourceFile>,
  source: string,
  expected: string,
  debug: boolean,
): Readonly<{ result: string; expectedFormatted: string }> => {
  if (!debug) {
    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  }

  const sourceAst = ts.createSourceFile(
    'source.ts',
    source,
    ts.ScriptTarget.ESNext, // 対象とする ECMAScript バージョン
    true, // setParentNodes: true - ノード間の親子関係を維持 (重要)
  );

  const expectedAst = ts.createSourceFile(
    'expected.ts',
    expected,
    ts.ScriptTarget.ESNext, // 対象とする ECMAScript バージョン
    true, // setParentNodes: true - ノード間の親子関係を維持 (重要)
  );

  // 変換された AST (SourceFile) を取得
  const transformedAst = pipe(
    ts.transform(sourceAst, [transformerFactory]),
  ).chain(
    (transformationResult) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      transformationResult.transformed[0]!,
  ).value;

  // 変換された AST をプリンターで文字列に戻す
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed, // 必要に応じて改行コードなどを設定
    removeComments: false, // コメントを保持するかどうか
  });

  const printedTransformed = printer.printFile(transformedAst);
  const printedExpected = printer.printFile(expectedAst);

  return {
    expectedFormatted: printedExpected,
    result: printedTransformed,
  };
};
