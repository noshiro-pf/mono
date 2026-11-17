import { Arr } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import type { TsMorphTransformer } from './types.mjs';

const fileIgnorePrefixes = [
  'transformer-ignore',
  'ts-codemod-ignore',
  'codemod-ignore',
  'transform-ignore',
] as const;

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

  applyTransformers(sourceAst, transformers, debug);

  return sourceAst.getFullText();
};

/**
 * Returns a function that transforms files of the project `tsConfigFilePath`
 * describes, each checked as part of that project rather than on its own as
 * {@link transformSourceCode} checks it: a type imported from another module
 * resolves, under the project's own compiler options.
 *
 * The returned function takes a file's path and current text and returns the
 * transformed text. Nothing is written to disk. The project keeps each file as
 * transformed, so that a file transformed later is checked against what the
 * earlier ones have become. A path outside the project is added to it.
 *
 * One project is loaded per call to this function, when the first file is
 * transformed, and each edit invalidates its program, so transforming a file
 * costs a fresh type check of what that file depends on.
 */
export const createProjectTransformer = (
  tsConfigFilePath: string,
  transformers: readonly TsMorphTransformer[],
  debug: boolean = false,
): ((filePath: string, code: string) => string) => {
  // Loaded with the first file, so that a run with nothing to transform does
  // not pay for it.
  let mut_project: tsm.Project | undefined = undefined;

  return (filePath, code) => {
    mut_project ??= new tsm.Project({ tsConfigFilePath });

    const project = mut_project;

    const existing = project.getSourceFile(filePath);

    const sourceAst =
      existing ?? project.createSourceFile(filePath, code, { overwrite: true });

    if (sourceAst.getFullText() !== code) {
      sourceAst.replaceWithText(code);
    }

    try {
      applyTransformers(sourceAst, transformers, debug);
    } catch (error) {
      // The caller keeps the file as it was, and so does the project: a later
      // file is checked against what is on disk, not a half-made edit.
      sourceAst.replaceWithText(code);

      throw error;
    }

    return sourceAst.getFullText();
  };
};

/**
 * Wraps a search returning the first index at or after `from` (or -1), reusing
 * the previous answer while it still holds for a later `from`.
 */
const createForwardSearch = (
  search: (from: number) => number,
): ((from: number) => number) => {
  let mut_from = Number.POSITIVE_INFINITY;

  let mut_found = -1;

  return (from) => {
    if (from < mut_from || (mut_found !== -1 && from > mut_found)) {
      mut_from = from;

      mut_found = search(from);
    }

    return mut_found;
  };
};

const createLastValueCache = (
  fn: (arg: number) => number,
): ((arg: number) => number) => {
  let mut_arg: number | undefined = undefined;

  let mut_value = 0;

  return (arg) => {
    if (arg !== mut_arg) {
      mut_arg = arg;

      mut_value = fn(arg);
    }

    return mut_value;
  };
};

// Same set as `\s` and `String.prototype.trim`
const isWhitespace = (char: string | undefined): boolean =>
  char !== undefined && /^\s$/u.test(char);

const skipWhitespace = (code: string, from: number): number => {
  let mut_index = from;

  while (mut_index < code.length && isWhitespace(code[mut_index])) {
    mut_index += 1;
  }

  return mut_index;
};

const skipWhitespaceBackward = (code: string, end: number): number => {
  let mut_index = end;

  while (mut_index > 0 && isWhitespace(code[mut_index - 1])) {
    mut_index -= 1;
  }

  return mut_index;
};

// The characters `.` does not match
const isLineTerminator = (char: string | undefined): boolean =>
  char !== undefined && /^[\n\r\u{2028}\u{2029}]$/u.test(char);

const indexOfLineTerminator = (code: string, from: number): number => {
  let mut_index = from;

  while (mut_index < code.length && !isLineTerminator(code[mut_index])) {
    mut_index += 1;
  }

  return mut_index < code.length ? mut_index : -1;
};

const findFileIgnoreComment = (
  code: string,
  prefix: string,
): readonly string[] | undefined => {
  // Queries into these searches only move forward, so each part of `code` is
  // scanned a bounded number of times.
  const findCommentEnd = createForwardSearch((from) =>
    code.indexOf('*/', from),
  );

  const findLineTerminator = createForwardSearch((from) =>
    indexOfLineTerminator(code, from),
  );

  const trimEndBefore = createLastValueCache((commentEnd: number) =>
    skipWhitespaceBackward(code, commentEnd),
  );

  for (
    let mut_open = code.indexOf('/*');
    mut_open !== -1;
    mut_open = code.indexOf('/*', mut_open + 2)
  ) {
    const prefixStart = skipWhitespace(code, mut_open + 2);

    if (!code.startsWith(prefix, prefixStart)) {
      continue;
    }

    const namesStart = skipWhitespace(code, prefixStart + prefix.length);

    const commentEnd = findCommentEnd(namesStart);

    // Nothing after this point is closed, so no later comment can match.
    if (commentEnd === -1) {
      return undefined;
    }

    const namesEnd = Math.max(namesStart, trimEndBefore(commentEnd));

    const lineTerminator = findLineTerminator(namesStart);

    if (lineTerminator === -1 || lineTerminator >= namesEnd) {
      const names = code.slice(namesStart, namesEnd);

      // Empty means ignore all transformers; otherwise parse comma-separated
      // transformer names
      return names === '' ? [] : names.split(',').map((name) => name.trim());
    }
  }

  return undefined;
};

/**
 * Finds the file-level ignore comment `/* <prefix> name, name *\/` and returns
 * the transformer names it lists (empty for all transformers), or `undefined`
 * when the file has none. Whitespace, line breaks included, may surround the
 * prefix and the names, but the names themselves must stay on one line. The
 * prefixes are tried in order, each against the whole file.
 *
 * The scan runs in time linear in the length of `code`, whatever it contains.
 */
const findFileIgnoreTransformers = (
  code: string,
): readonly string[] | undefined => {
  for (const prefix of fileIgnorePrefixes) {
    const names = findFileIgnoreComment(code, prefix);

    if (names !== undefined) {
      return names;
    }
  }

  return undefined;
};

const shouldSkipFile = (
  ignoredTransformers: readonly string[] | undefined,
  transformerName: string,
): boolean =>
  ignoredTransformers !== undefined &&
  // Empty array means ignore all transformers (file-level ignore without
  // specific transformers); otherwise check if the transformer is in the ignore
  // list
  (Arr.isEmpty(ignoredTransformers) ||
    ignoredTransformers.includes(transformerName));

const applyTransformers = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceAst: tsm.SourceFile,
  transformers: readonly TsMorphTransformer[],
  debug: boolean,
): void => {
  const ignoredTransformers = findFileIgnoreTransformers(
    sourceAst.getFullText(),
  );

  for (const transformer of transformers) {
    const transformerName = transformer.name;

    if (shouldSkipFile(ignoredTransformers, transformerName)) {
      if (debug) {
        console.debug(
          `skipped by ignore-file comment for transformer: ${transformerName}`,
        );
      }

      continue;
    }

    transformer.transform(sourceAst);
  }
};
