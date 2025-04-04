import * as prettier from 'prettier';
import * as ts from 'typescript';
import { wrapSource } from './wrap-transformer.mjs';

export const testPreprocess = async (
  transformerFactory: ts.TransformerFactory<ts.SourceFile>,
  source: string,
  expected: string,
  debug: boolean,
): Promise<Readonly<{ result: string; expectedFormatted: string }>> => {
  if (!debug) {
    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  }

  const sourceFile = ts.createSourceFile(
    '__tempfile__.ts', // ファイル名は変換に影響しないことが多いが、必須
    wrapSource(source),
    ts.ScriptTarget.ESNext, // 対象とする ECMAScript バージョン
    true, // setParentNodes: true - ノード間の親子関係を維持 (重要)
  );

  // 3. ts.transform を使って AST を変換する
  const transformationResult = ts.transform(sourceFile, [transformerFactory]);

  // 変換された AST (SourceFile) を取得
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const transformedSourceFile = transformationResult.transformed[0]!;

  // 4. 変換された AST をプリンターで文字列に戻す
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed, // 必要に応じて改行コードなどを設定
    removeComments: false, // コメントを保持するかどうか
  });

  const resultCode = printer.printFile(transformedSourceFile);

  const resultFormatted = await prettier.format(
    resultCode.replaceAll('\n', ' '),
    { parser: 'typescript' },
  );

  const expectedFormatted = await prettier.format(
    expected.replaceAll('\n', ' '),
    { parser: 'typescript' },
  );

  return {
    expectedFormatted: expectedFormatted.trimEnd(),
    result: resultFormatted.trimEnd(),
  };
};
