import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as prettier from 'prettier';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { describeFailure, runFile } from '../../lib/child-process.mjs';
import { resolveDiffBase } from '../../lib/diff-base.mjs';
import { parseAddedLines } from '../../lib/diff-lines.mjs';
import { isRepositoryProse } from '../../lib/repo-files.mjs';
import { projectRootPath } from '../../project-root-path.mjs';
import { applyRefills, type Refill, unfilledRuns } from './paragraphs.mjs';

/**
 * Reports, or with `fix` refills, the Markdown paragraphs a change touched that
 * are not filled to the print width. See `README.md`.
 */
export const checkMarkdownWrap = async (
  options: Readonly<{ fix?: boolean }> = {},
): Promise<Result<CheckSummary, string>> => {
  const { fix = false } = options;

  const changed = await changedLines(
    await resolveDiffBase('read the change from'),
  );

  if (Result.isErr(changed)) {
    return changed;
  }

  const mut_reports: string[] = [];

  let mut_files = 0;

  for (const [file, isTouched] of changed.value) {
    const absolutePath = path.resolve(projectRootPath, file);

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path git listed as changed
    const text = await fs.readFile(absolutePath, 'utf8');

    // As the Prettier CLI resolves it, which reads `.editorconfig`; the API
    // does only when asked.
    const config = await prettier.resolveConfig(absolutePath, {
      editorconfig: true,
    });

    const printWidth = config?.printWidth ?? DEFAULT_PRINT_WIDTH;

    mut_files += 1;

    // `max_line_length = off`: no width to fill to.
    if (!Number.isFinite(printWidth)) {
      continue;
    }

    const refills = unfilledRuns(text, isTouched, printWidth);

    if (!Arr.isNonEmpty(refills)) {
      continue;
    }

    if (fix) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the same file
      await fs.writeFile(absolutePath, applyRefills(text, refills));
    }

    mut_reports.push(...refills.map((refill) => reportOf(file, refill)));
  }

  return fix || !Arr.isNonEmpty(mut_reports)
    ? Result.ok({ files: mut_files, refilled: mut_reports.length })
    : Result.err(
        [
          ...mut_reports,
          '',
          `${mut_reports.length} paragraph run(s) not filled to the print width, in the paragraphs this change touched.`,
          'Refill them with `pnpm run fix:markdown-wrap`, or break the line where a sentence ends.',
        ].join('\n'),
      );
};

type CheckSummary = Readonly<{
  /** The changed Markdown files read. */
  files: number;
  /** The runs refilled, with `fix`. */
  refilled: number;
}>;

/** Prettier's default, which the root `.prettierrc` keeps. */
const DEFAULT_PRINT_WIDTH = 80;

const reportOf = (file: string, refill: Refill): string =>
  `${file}:${refill.reportLine}: not filled to the print width; refilled it reads:\n${refill.lines.map((l) => `    ${l}`).join('\n')}` as const;

const git = async (
  args: readonly string[],
): Promise<Result<string, string>> => {
  const result = await runFile('git', args, {
    cwd: projectRootPath,
    maxBuffer: 256 * 1024 * 1024,
  });

  return result.status === 0
    ? Result.ok(result.stdout)
    : Result.err(`git ${args.join(' ')} failed: ${describeFailure(result)}`);
};

/**
 * The lines the change from `base` added or changed, or removed lines next to,
 * by repository document: the diff of the working tree against `base`, and
 * every line of an untracked one.
 */
const changedLines = async (
  base: string,
): Promise<Result<ReadonlyMap<string, (line: number) => boolean>, string>> => {
  const diff = await git([
    'diff',
    // Whatever path prefixes the user's git config asks diffs for, the parser
    // reads `+++ b/…`.
    '--src-prefix=a/',
    '--dst-prefix=b/',
    '-U0',
    // A moved document is read for what the move changed, not as new.
    '--find-renames',
    '--no-color',
    base,
    '--',
    ...MARKDOWN_PATHSPECS,
  ]);

  if (Result.isErr(diff)) {
    return diff;
  }

  const untracked = await git([
    'ls-files',
    '--others',
    '--exclude-standard',
    '-z',
    '--',
    ...MARKDOWN_PATHSPECS,
  ]);

  if (Result.isErr(untracked)) {
    return untracked;
  }

  return Result.ok(
    new Map<string, (line: number) => boolean>(
      [
        ...Array.from(
          parseAddedLines(diff.value, { deletionPoints: true }),
          ([file, lines]) => {
            const added = new Set(lines);

            return [file, (line: number) => added.has(line)] as const;
          },
        ),
        ...untracked.value
          .split('\0')
          .filter((file) => file !== '')
          .map((file) => [file, () => true] as const),
      ].filter(([file]) => isRepositoryProse(file)),
    ),
  );
};

const MARKDOWN_PATHSPECS = ['*.md', '*.mdx'] as const;

if (isDirectlyExecuted(import.meta.url)) {
  const fix = process.argv.includes('--fix');

  const result = await checkMarkdownWrap({ fix }).catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    fix
      ? `Refilled ${result.value.refilled} paragraph run(s) across the ${result.value.files} changed Markdown files.`
      : `The paragraphs this change touched are filled (${result.value.files} changed Markdown files read).`,
  );
}
