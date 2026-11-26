import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { listTrackedFiles, readRepositoryFile } from '../lib/repo-files.mjs';

/**
 * Fails on Japanese in a JSDoc comment of the published strict standard
 * library: the declaration files under `strict-lib/v*\/output/lib/`.
 *
 * An editor shows those comments to every consumer on hover, so they are
 * English. Japanese may stay in a line or plain block comment, which no hover
 * shows. The converter writes them (`strict-lib/scripts-common/`), so the fix
 * is there, then `strict-lib:gen:with-codemod-fixed`.
 */
export const checkStrictLibEnglishJsdoc = async (): Promise<
  Result<number, string>
> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(`❌ ${tracked.value}`);
  }

  const files = tracked.value.filter(isPublishedStrictLib);

  const mut_problems: string[] = [];

  for (const file of files) {
    const text = await readRepositoryFile(file);

    if (Result.isErr(text)) {
      return Result.err(`❌ ${text.value}`);
    }

    for (const { line, text: lineText } of findJapaneseInJsdoc(text.value)) {
      mut_problems.push(`${file}:${line.toString()}: ${lineText}`);
    }
  }

  return Arr.isNonEmpty(mut_problems)
    ? Result.err(
        [
          `❌ ${mut_problems.length.toString()} JSDoc line(s) with Japanese in the published strict lib:`,
          '',
          ...mut_problems.map((problem) => `  ${problem}`),
          '',
          'Write the JSDoc in English in the converter (strict-lib/scripts-common/);',
          'Japanese may stay there as a line comment. Then run',
          'pnpm run strict-lib:gen:with-codemod-fixed.',
        ].join('\n'),
      )
    : Result.ok(files.length);
};

/**
 * Each line of a JSDoc comment (`/** … *\/`) in `text` with Hiragana,
 * Katakana or a kanji in it, 1-based, trimmed.
 *
 * A text scan, not a parse: the declaration files it reads hold no string that
 * spells a comment.
 */
export const findJapaneseInJsdoc = (text: string): readonly JapaneseLine[] => {
  const lines = text.split('\n');

  const lineOf = lineFinder(text);

  const mut_found: JapaneseLine[] = [];

  for (const match of text.matchAll(jsdocComment)) {
    const startLine = lineOf(match.index);

    const endLine = lineOf(match.index + match[0].length);

    for (const [index, lineText] of lines
      .slice(startLine - 1, endLine)
      .entries()) {
      if (japanese.test(lineText)) {
        mut_found.push({ line: startLine + index, text: lineText.trim() });
      }
    }
  }

  return mut_found;
};

/**
 * Whether the tracked file `relativePath` is a declaration file of a published
 * strict-lib bundle (`strict-lib/v<version>/output/lib/`).
 */
export const isPublishedStrictLib = (relativePath: string): boolean =>
  /^strict-lib\/v[^/]+\/output\/lib\/.+\.d\.ts$/u.test(relativePath);

/** `/**` opening a comment — not `/**\/` — up to its first `*\/`. */
const jsdocComment = /\/\*\*(?!\/)[\s\S]*?\*\//gu;

const japanese = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;

/**
 * The 1-based line of an offset in `text`, for offsets asked in increasing
 * order, as the comments are found: each call counts on from the last.
 */
const lineFinder = (text: string): ((offset: number) => number) => {
  const mut_state = { offset: 0, line: 1 };

  return (offset) => {
    mut_state.line +=
      text.slice(mut_state.offset, offset).split('\n').length - 1;

    mut_state.offset = offset;

    return mut_state.line;
  };
};

type JapaneseLine = Readonly<{
  /** 1-based. */
  line: number;
  text: string;
}>;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkStrictLibEnglishJsdoc().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value.toString()} published strict-lib declaration file(s) read; their JSDoc is in English.`,
  );
}
