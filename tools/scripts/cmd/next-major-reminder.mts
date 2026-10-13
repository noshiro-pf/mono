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
 * breaking release has undecided `NEXT_MAJOR.md` items, or an empty file when
 * there is none.
 *
 * `check:prose:next-major` lets such a release through and lists the
 * candidates in its log, which nobody opens. The version pull request is
 * where the release is decided — adding `merge-queued` to it is the decision
 * — so that is where they are listed. A comment, not the body: the body is
 * rewritten by `changesets/action` on every push to `main`.
 *
 * Run it on a checkout of `main`, before `changeset version` has consumed
 * `.changeset/`. It writes a file and nothing else: the job running it holds
 * no key, and the job posting the comment runs nothing from the tree.
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
        // One line: a comment renders each line break.
        [
          'A breaking release in this pull request leaves `NEXT_MAJOR.md` candidates undecided.',
          'They do not hold it; decide each before adding `merge-queued`:',
          'move it above the "Undecided" heading to make it with this release,',
          'delete it if it will not be made, or leave it for a later major.',
        ].join(' '),
        ...reminders.flatMap(
          ({ file, name, version, changeset, bump, items }) => [
            '',
            `**\`${name}@${version}\`**, given \`${bump}\` by \`${changeset}\`; in \`${file}\`:`,
            '',
            ...items.map((text) => `- ${text}`),
          ],
        ),
        '',
      ].join('\n')
    : undefined;

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
    result.value ??
      'No breaking release has undecided candidates; wrote an empty file.',
  );
}
