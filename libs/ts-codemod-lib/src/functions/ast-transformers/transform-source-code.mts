import * as tsm from 'ts-morph';
import { type TsMorphTransformer } from './types.mjs';

const extractFileIgnoreTransformers = (code: string): readonly string[] => {
  const match = /\/\*\s*transformer-ignore\s*(.*?)\s*\*\//u.exec(code);

  if (match === null) {
    return [];
  }

  const targetTransformers = match[1]?.trim() ?? '';

  // Empty means ignore all transformers
  if (targetTransformers === '') {
    return [];
  }

  // Parse comma-separated transformer names
  return targetTransformers.split(',').map((name) => name.trim());
};

const shouldSkipFile = (
  code: string,
  transformerName: string | undefined,
): boolean => {
  const ignoredTransformers = extractFileIgnoreTransformers(code);

  // If no file-level ignore comment found, don't skip
  if (
    ignoredTransformers.length === 0 &&
    !/\/\*\s*transformer-ignore\s*.*?\s*\*\//u.test(code)
  ) {
    return false;
  }

  // Empty array means ignore all transformers (file-level ignore without specific transformers)
  if (ignoredTransformers.length === 0) {
    return true;
  }

  // If transformer name is not specified, don't skip
  if (transformerName === undefined) {
    return false;
  }

  // Check if the transformer is in the ignore list
  return ignoredTransformers.includes(transformerName);
};

export const transformSourceCode = (
  code: string,
  isTsx: boolean,
  transformers: readonly TsMorphTransformer[],
  debug: boolean = false,
): string => {
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
    const transformerName = transformer.name;

    if (shouldSkipFile(code, transformerName)) {
      if (debug) {
        console.debug(
          `skipped by ignore-file comment for transformer: ${transformerName}`,
        );
      }

      continue;
    }

    transformer.transform(sourceAst);
  }

  return sourceAst.getFullText();
};
