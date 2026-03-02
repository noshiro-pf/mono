import { Arr } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import { type TsMorphTransformer } from './types.mjs';

const extractFileIgnoreTransformers = (code: string): readonly string[] => {
  // Try to find any of the supported file-level ignore comment prefixes
  const patterns = [
    {
      prefix: 'transformer-ignore',
      regex: /\/\*\s*transformer-ignore\s*(.*?)\s*\*\//u,
    },
    {
      prefix: 'ts-codemod-ignore',
      regex: /\/\*\s*ts-codemod-ignore\s*(.*?)\s*\*\//u,
    },
    {
      prefix: 'codemod-ignore',
      regex: /\/\*\s*codemod-ignore\s*(.*?)\s*\*\//u,
    },
    {
      prefix: 'transform-ignore',
      regex: /\/\*\s*transform-ignore\s*(.*?)\s*\*\//u,
    },
  ] as const;

  for (const { regex } of patterns) {
    const match = regex.exec(code);

    if (match !== null) {
      const targetTransformers = match[1]?.trim() ?? '';

      // Empty means ignore all transformers
      if (targetTransformers === '') {
        return [];
      }

      // Parse comma-separated transformer names
      return targetTransformers.split(',').map((name) => name.trim());
    }
  }

  return [];
};

const shouldSkipFile = (
  code: string,
  transformerName: string | undefined,
): boolean => {
  const ignoredTransformers = extractFileIgnoreTransformers(code);

  // If no file-level ignore comment found, don't skip
  const patterns = [
    /\/\*\s*transformer-ignore\s*.*?\s*\*\//u,
    /\/\*\s*ts-codemod-ignore\s*.*?\s*\*\//u,
    /\/\*\s*codemod-ignore\s*.*?\s*\*\//u,
    /\/\*\s*transform-ignore\s*.*?\s*\*\//u,
  ] as const;

  const hasFileIgnoreComment = patterns.some((regex) => regex.test(code));

  if (Arr.isArrayOfLength(ignoredTransformers, 0) && !hasFileIgnoreComment) {
    return false;
  }

  // Empty array means ignore all transformers (file-level ignore without specific transformers)
  if (Arr.isArrayOfLength(ignoredTransformers, 0)) {
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
