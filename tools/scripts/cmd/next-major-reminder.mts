import * as fs from 'node:fs/promises';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  listReminders,
  readChangesets,
  readStocks,
  type Reminder,
} from './check-next-major.mjs';

/**
 * Writes the comment `release.yml` keeps on the version pull request while a
 * breaking release has `NEXT_MAJOR.md` items open, or an empty file when there
 * is none.
 *
 * The decided items hold the version pull request — `check:prose:next-major`
 * fails on it — and are listed from the moment the breaking changeset lands, so
 * that what the release waits for is in sight before anyone queues it. The
 * undecided ones hold nothing, and the version pull request is where the
 * release is decided — adding `merge-queued` to it is the decision — so that is
 * where they are listed. A comment, not the body: the body is rewritten by
 * `changesets/action` on every push to `main`.
 *
 * Run it on a checkout of `main`, before `changeset version` has consumed
 * `.changeset/`. It writes a file and nothing else: the job running it holds no
 * key, and the job posting the comment runs nothing from the tree.
 *
 * Usage: `pnpm run z:next-major-reminder <output path>`.
 */
export const formatReminderComment = (
  reminders: readonly Reminder[],
): string | undefined =>
  Arr.isNonEmpty(reminders)
    ? [
        REMINDER_MARKER,
        '',
        'A breaking release in this pull request has `NEXT_MAJOR.md` items open.',
        ...reminders.flatMap(
          ({ file, name, version, changeset, bump, decided, undecided }) => [
            '',
            `**\`${name}@${version}\`**, given \`${bump}\` by \`${changeset}\`; in \`${file}\`:`,
            ...itemLines(DECIDED_LINE, decided),
            ...itemLines(UNDECIDED_LINE, undecided),
          ],
        ),
        '',
      ].join('\n')
    : undefined;

const itemLines = (
  lead: string,
  items: readonly string[],
): readonly string[] =>
  Arr.isNonEmpty(items)
    ? (['', lead, '', ...items.map((text) => `- ${text}`)] as const)
    : ([] as const);

// One line each: a comment renders each line break.
const DECIDED_LINE = [
  'Decided, and holding this pull request: `check:prose:next-major` fails on it',
  'until each change is made and its item deleted.',
  'Moving an item under the "Undecided" heading releases without it.',
].join(' ');

const UNDECIDED_LINE = [
  'Undecided, and not holding it: decide each before adding `merge-queued` —',
  'move it above the "Undecided" heading to make it with this release,',
  'delete it if it will not be made, or leave it for a later major.',
].join(' ');

/**
 * The first line of the comment, by which `release.yml` finds the one it
 * posted. Keep the two in step.
 */
export const REMINDER_MARKER = '<!-- next-major:reminder -->';

if (isDirectlyExecuted(import.meta.url)) {
  const output = process.argv[2];

  if (output === undefined) {
    console.error('Usage: next-major-reminder.mts <output path>');

    process.exit(1);
  }

  const result = await Promise.all([readChangesets(), readStocks()])
    .then(([changesets, stocks]) =>
      Result.ok(formatReminderComment(listReminders({ changesets, stocks }))),
    )
    .catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(output, result.value ?? '');

  console.info(
    result.value ?? 'No breaking release has items open; wrote an empty file.',
  );
}
