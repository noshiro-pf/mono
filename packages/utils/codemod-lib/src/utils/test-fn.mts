import * as prettier from 'prettier';
import { Project } from 'ts-morph';
import { type SourceFile } from '../types.mjs';
import { wrapSource } from './wrap-transformer.mjs';

export const testFn = async (
  fn: (srcFile: SourceFile) => void,
  source: string,
  expected: string,
  debug: boolean,
): Promise<Readonly<{ result: string; expectedFormatted: string }>> => {
  if (!debug) {
    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  }

  const project = new Project();

  // ファイル先頭のコメント行が消えてしまうのでダミーの `;`行を追加している（prettier.format で削除される）
  const sourceFile = project.createSourceFile(
    '__tempfile__.ts',
    wrapSource(source),
  );

  fn(sourceFile);

  const result = await prettier.format(sourceFile.getText(), {
    parser: 'typescript',
  });

  sourceFile.delete();

  const expectedFormatted = await prettier.format(expected, {
    parser: 'typescript',
  });

  return {
    expectedFormatted: expectedFormatted.trimEnd(),
    result: result.trimEnd(),
  };
};
