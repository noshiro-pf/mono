import * as tsm from 'ts-morph';
import { IGNORE_FILE_COMMENT_TEXT } from '../constants/index.mjs';
import { type TsMorphTransformer } from './types.mjs';

export const transformSourceCode = (
  code: string,
  isTsx: boolean,
  transformers: readonly TsMorphTransformer[],
): string => {
  if (code.includes(IGNORE_FILE_COMMENT_TEXT)) {
    console.debug('skipped by ignore-file comment');
    return code;
  }

  const project = new tsm.Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      jsx: isTsx ? tsm.ts.JsxEmit.React : undefined,
      target: tsm.ts.ScriptTarget.ESNext,
      module: tsm.ts.ModuleKind.ESNext,
    },
  });

  const sourceAst = project.createSourceFile(
    `source.${isTsx ? 'tsx' : 'ts'}`,
    code,
  );

  for (const transformer of transformers) {
    transformer(sourceAst);
  }

  return sourceAst.getFullText();
};
