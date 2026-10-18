import dedent from 'dedent';
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
  test('is nothing while no breaking release has items open', () => {
    assert.isUndefined(formatReminderComment([]));
  });

  test('lists each package with its changeset and its candidates', () => {
    const comment = formatReminderComment([
      reminder('pkg', [], ['Drop the `baz` re-export.', 'Rename `qux`.']),
      reminder('other', [], ['Require Node 24.']),
    ]);

    assert.strictEqual(
      comment,
      `${dedent`
        <!-- next-major:reminder -->

        A breaking release in this pull request has \`NEXT_MAJOR.md\` items open.

        **\`pkg@1.2.3\`**, given \`major\` by \`.changeset/major.md\`; in \`libs/pkg/NEXT_MAJOR.md\`:

        ${UNDECIDED_LINE}

        - Drop the \`baz\` re-export.
        - Rename \`qux\`.

        **\`other@1.2.3\`**, given \`major\` by \`.changeset/major.md\`; in \`libs/other/NEXT_MAJOR.md\`:

        ${UNDECIDED_LINE}

        - Require Node 24.
      `}\n`,
    );
  });

  test('lists the decided items as holding the pull request, before the candidates', () => {
    const comment = formatReminderComment([
      reminder(
        'pkg',
        ['Rename `foo` to `bar`.'],
        ['Drop the `baz` re-export.'],
      ),
    ]);

    assert.strictEqual(
      comment,
      `${dedent`
        <!-- next-major:reminder -->

        A breaking release in this pull request has \`NEXT_MAJOR.md\` items open.

        **\`pkg@1.2.3\`**, given \`major\` by \`.changeset/major.md\`; in \`libs/pkg/NEXT_MAJOR.md\`:

        ${DECIDED_LINE}

        - Rename \`foo\` to \`bar\`.

        ${UNDECIDED_LINE}

        - Drop the \`baz\` re-export.
      `}\n`,
    );
  });

  test('starts with the marker release.yml looks for', () => {
    const comment = formatReminderComment([reminder('pkg', [], ['x'])]);

    assert.isTrue(comment?.startsWith(`${REMINDER_MARKER}\n`) === true);
  });

  test('is the same text for the same items', () => {
    const items = [reminder('pkg', ['y'], ['x'])] as const;

    assert.strictEqual(
      formatReminderComment(items),
      formatReminderComment(items),
    );
  });
});

describe('listReminders', () => {
  test('lists the decided items and the candidates apart', () => {
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
      reminders.map(({ decided, undecided }) => ({ decided, undecided })),
      [
        {
          decided: ['Rename `foo` to `bar`.'],
          undecided: ['Drop the `baz` re-export.'],
        },
      ],
    );
  });

  test('lists a package whose items are all decided', () => {
    const reminders = listReminders({
      changesets: [changeset],
      stocks: [stock('# Next major\n\n- Rename `foo` to `bar`.\n')],
    });

    assert.deepStrictEqual(
      reminders.map(({ decided, undecided }) => ({ decided, undecided })),
      [{ decided: ['Rename `foo` to `bar`.'], undecided: [] }],
    );
  });

  test('lists nothing for a package with no breaking release pending', () => {
    const reminders = listReminders({
      changesets: [],
      stocks: [
        stock('# Next major\n\n- decided\n\n## Undecided\n\n- a candidate\n'),
      ],
    });

    assert.deepStrictEqual(reminders, []);
  });
});

const reminder = (
  name: string,
  decided: readonly string[],
  undecided: readonly string[],
): Reminder =>
  ({
    file: `libs/${name}/NEXT_MAJOR.md`,
    name,
    version: '1.2.3',
    changeset: '.changeset/major.md',
    bump: 'major',
    decided,
    undecided,
  }) as const;

const DECIDED_LINE =
  'Decided, and holding this pull request: `check:prose:next-major` fails on it until each change is made and its item deleted. Moving an item under the "Undecided" heading releases without it.';

const UNDECIDED_LINE =
  'Undecided, and not holding it: decide each before adding `merge-queued` — move it above the "Undecided" heading to make it with this release, delete it if it will not be made, or leave it for a later major.';

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
