import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when `CLAUDE.md` grows past its line budget.
 *
 * `CLAUDE.md` states its own admission test ("What belongs in this file"), and
 * the test alone has not kept it small: each addition passes it on its own
 * merits, and the file had to be cut back from four digits by several pull
 * requests in a row. What was missing was not a better rule but a moment at
 * which growth is noticed. This check is that moment.
 *
 * The budget is a tripwire, not a target. It sits a little above the file's
 * size when it was set, so that an ordinary edit passes and a steady
 * accumulation does not. When it trips, the intended fix is to move a rule
 * out — into a comment in the file it is about, or that area's README — and
 * leave a pointer behind. Raising {@link LINE_BUDGET} is allowed, and is the
 * point of keeping it here: it becomes an edit that shows in a diff, with its
 * reason in the commit message, rather than something that happens by
 * default.
 *
 * Lines rather than words, because Prettier wraps the file at 80 columns, so
 * a line is a stable unit of prose and one that `wc -l` agrees with.
 */
export const checkClaudeMdSize = (
  claudeMd: string,
  budget: number = LINE_BUDGET,
): Result<number, string> => {
  const lines = countLines(claudeMd);

  return lines <= budget
    ? Result.ok(lines)
    : Result.err(
        [
          `${CLAUDE_MD} is ${lines} lines, ${lines - budget} over its budget of ${budget}.`,
          '',
          'Move a rule out rather than compressing one: into a comment in the',
          'file it is about, or into the README of that area, leaving a pointer',
          `here (${CLAUDE_MD}, "What belongs in this file"). A rule that a check`,
          'now enforces with a clear error can simply go.',
          '',
          'If the budget itself is what should change, raise LINE_BUDGET in',
          'tools/scripts/cmd/check-claude-md-size.mts and say why in the commit.',
        ].join('\n'),
      );
};

/** Lines as `wc -l` counts them: a trailing newline ends a line, not starts one. */
export const countLines = (text: string): number =>
  text === '' ? 0 : text.replace(TRAILING_NEWLINE, '').split('\n').length;

/**
 * The most lines `CLAUDE.md` may have. Raising it is a decision: say why in
 * the commit that does it.
 */
const LINE_BUDGET = 550;

const CLAUDE_MD = 'CLAUDE.md';

const TRAILING_NEWLINE = /\n$/u;

if (isDirectlyExecuted(import.meta.url)) {
  const claudeMd = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.resolve(projectRootPath, CLAUDE_MD), 'utf8'),
  );

  const result = Result.isErr(claudeMd)
    ? Result.err(
        `Failed to read ${CLAUDE_MD}: ${unknownToString(claudeMd.value)}`,
      )
    : checkClaudeMdSize(claudeMd.value);

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${CLAUDE_MD} is ${result.value} lines, within its budget of ${LINE_BUDGET}.`,
  );
}
