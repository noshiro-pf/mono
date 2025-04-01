import * as prettier from 'prettier';
import { Project } from 'ts-morph';
import { type SourceFile } from '../types.mjs';

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
  const sourceFile = project.createSourceFile('__tempfile__.ts', source);

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
