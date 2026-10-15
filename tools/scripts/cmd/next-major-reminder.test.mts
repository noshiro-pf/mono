import dedent from 'dedent';
import type { NonEmptyTuple } from 'ts-type-forge';
import {
  listReminders,
  type ChangesetFile,
  type Reminder,
  type StockFile,
} from './check-next-major.mjs';
import {
  formatReminderComment,
  REMINDER_MARKER,
} from './next-major-reminder.mjs';

describe('formatReminderComment', () => {
  test('is nothing while no breaking release has candidates', () => {
    assert.isUndefined(formatReminderComment([]));
  });

  test('lists each package with its changeset and its candidates', () => {
    const comment = formatReminderComment([
      reminder('pkg', ['Drop the `baz` re-export.', 'Rename `qux`.']),
      reminder('other', ['Require Node 24.']),
    ]);

    assert.strictEqual(
      comment,
      `${dedent`
        <!-- next-major:reminder -->

        A breaking release in this pull request leaves \`NEXT_MAJOR.md\` candidates undecided. They do not hold it; decide each before adding \`merge-queued\`: move it above the "Undecided" heading to make it with this release, delete it if it will not be made, or leave it for a later major.

        **\`pkg@1.2.3\`**, given \`major\` by \`.changeset/major.md\`; in \`libs/pkg/NEXT_MAJOR.md\`:

        - Drop the \`baz\` re-export.
        - Rename \`qux\`.

        **\`other@1.2.3\`**, given \`major\` by \`.changeset/major.md\`; in \`libs/other/NEXT_MAJOR.md\`:

        - Require Node 24.
      `}\n`,
    );
  });

  test('starts with the marker release.yml looks for', () => {
    const comment = formatReminderComment([reminder('pkg', ['x'])]);

    assert.isTrue(comment?.startsWith(`${REMINDER_MARKER}\n`) === true);
  });

  test('is the same text for the same candidates', () => {
    const candidates = [reminder('pkg', ['x'])] as const;

    assert.strictEqual(
      formatReminderComment(candidates),
      formatReminderComment(candidates),
    );
  });
});

describe('listReminders', () => {
  test('lists the candidates even when decided items fail the check', () => {
    const reminders = listReminders({
      changesets: [changeset],
      stocks: [
        stock(dedent`
          # Next major

          - Rename \`foo\` to \`bar\`.

          ## Undecided

          - Drop the \`baz\` re-export.
        `),
      ],
    });

    assert.deepStrictEqual(
      reminders.map(({ items }) => items),
      [['Drop the `baz` re-export.']],
    );
  });

  test('lists nothing for a package with no breaking release pending', () => {
    const reminders = listReminders({
      changesets: [],
      stocks: [stock('# Next major\n\n## Undecided\n\n- a candidate\n')],
    });

    assert.deepStrictEqual(reminders, []);
  });
});

const reminder = (name: string, items: NonEmptyTuple<string>): Reminder =>
  ({
    file: `libs/${name}/NEXT_MAJOR.md`,
    name,
    version: '1.2.3',
    changeset: '.changeset/major.md',
    bump: 'major',
    items,
  }) as const;

const stock = (content: string): StockFile =>
  ({
    file: 'libs/pkg/NEXT_MAJOR.md',
    content,
    manifest: { name: 'pkg', version: '1.2.3' },
  }) as const;

const changeset: ChangesetFile = {
  file: '.changeset/major.md',
  content: "---\n'pkg': major\n---\n\nSomething.\n",
} as const;
