/**
 * The `run-issue-resolver` record (`spec/conventions.md`): the issues its
 * sessions left, each with its `updatedAt` then, or `null` where that was not
 * read. A file of this machine's, under `~/.local/state/unblock-prs/`.
 */

import * as path from 'node:path';
import type { RepoRef } from 'pr-report-core-v2';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';

/** Where the record of `repo` is, under the state directory `root`. */
export const attemptedPath = (root: string, repo: RepoRef): string =>
  path.join(root, 'run-issue-resolver', repo.owner, `${repo.name}.json`);

/**
 * The record `text` holds, read from `file`; none when there is no file
 * (`undefined`). A key that is no issue number is not one the command wrote,
 * and is skipped.
 */
export const parseAttempted = (
  text: string | undefined,
  file: string,
): Result<ReadonlyMap<number, string | undefined>, string> => {
  if (text === undefined) {
    return Result.ok(new Map<number, string | undefined>());
  }

  const parsed = Result.fromThrowable((): unknown => JSON.parse(text));

  if (Result.isErr(parsed)) {
    return Result.err(
      `${file} does not parse (${unknownToString(parsed.value)}); remove it to hand every issue on once more`,
    );
  }

  const record = AttemptedSchema.validate(parsed.value);

  if (Result.isErr(record)) {
    return Result.err(
      `${file} does not parse (${t.validationErrorsToMessages(record.value).join('; ')}); remove it to hand every issue on once more`,
    );
  }

  return Result.ok(
    new Map<number, string | undefined>(
      Arr.generate(function* () {
        for (const [key, at] of Object.entries(record.value.attempted)) {
          const number = Num.safeParseFloat(key);

          if (ISSUE_NUMBER.test(key) && Result.isOk(number)) {
            yield [number.value, at ?? undefined] as const;
          }
        }
      }),
    ),
  );
};

/**
 * The record `attempted` as its file holds it: each issue by its number, with
 * its `updatedAt` or `null`.
 */
export const serializeAttempted = (
  attempted: ReadonlyMap<number, string | undefined>,
): string =>
  `${JSON.stringify(
    {
      attempted: Object.fromEntries(
        Array.from(attempted, ([number, at]) => [
          number.toString(),
          at ?? null,
        ]),
      ),
    },
    undefined,
    2,
  )}\n` as const;

const ISSUE_NUMBER = /^[1-9]\d*$/u;

const AttemptedSchema = t.record({
  attempted: t.keyValueRecord(t.string(), t.union([t.string(), t.nullType])),
});
