import dedent from 'dedent';
import {
  isBreaking,
  isBreakingRelease,
  listChangesetBumps,
  parseChangesetBumps,
  type Bump,
} from './changesets.mjs';

describe('parseChangesetBumps', () => {
  test('reads every quoting style the front matter is written in', () => {
    const bumps = parseChangesetBumps(dedent`
      ---
      'ts-data-forge': major
      "ts-fortress": minor
      synstate: patch
      ---

      Body: with a colon.
    `);

    assert.deepStrictEqual(
      bumps,
      new Map<string, Bump>([
        ['ts-data-forge', 'major'],
        ['ts-fortress', 'minor'],
        ['synstate', 'patch'],
      ]),
    );
  });

  test('names nothing for a file without front matter', () => {
    assert.strictEqual(
      parseChangesetBumps('# Changesets\n\nfoo: major\n').size,
      0,
    );
  });
});

describe('listChangesetBumps', () => {
  test('lists every named package with the file naming it, in order', () => {
    assert.deepStrictEqual(
      listChangesetBumps([
        {
          file: '.changeset/a.md',
          content: dedent`
            ---
            'ts-data-forge': major
            synstate: patch
            ---

            A.
          `,
        },
        { file: '.changeset/README.md', content: '# Changesets' },
        {
          file: '.changeset/b.md',
          content: dedent`
            ---
            "ts-data-forge": minor
            ---

            B.
          `,
        },
      ]),
      [
        { file: '.changeset/a.md', name: 'ts-data-forge', bump: 'major' },
        { file: '.changeset/a.md', name: 'synstate', bump: 'patch' },
        { file: '.changeset/b.md', name: 'ts-data-forge', bump: 'minor' },
      ],
    );
  });
});

describe('isBreaking', () => {
  test('is a major at any version', () => {
    assert.isTrue(isBreaking('major', '1.2.3'));

    assert.isTrue(isBreaking('major', '0.5.1'));
  });

  test('is a minor of a 0.x package only', () => {
    assert.isTrue(isBreaking('minor', '0.5.1'));

    assert.isFalse(isBreaking('minor', '1.2.3'));
  });

  test('is never a patch', () => {
    assert.isFalse(isBreaking('patch', '0.5.1'));

    assert.isFalse(isBreaking('patch', '1.2.3'));
  });
});

describe('isBreakingRelease', () => {
  test('is a release that raises the major', () => {
    assert.isTrue(isBreakingRelease('1.2.3', '2.0.0'));

    assert.isTrue(isBreakingRelease('0.5.1', '1.0.0'));
  });

  test('is a release that raises the minor of a 0.x package', () => {
    assert.isTrue(isBreakingRelease('0.5.1', '0.6.0'));
  });

  test('is not a minor or patch release of a 1.x package', () => {
    assert.isFalse(isBreakingRelease('1.2.3', '1.3.0'));

    assert.isFalse(isBreakingRelease('1.2.3', '1.2.4'));
  });

  test('is not a patch release of a 0.x package', () => {
    assert.isFalse(isBreakingRelease('0.5.1', '0.5.2'));
  });

  test('is not an unchanged or lowered version', () => {
    assert.isFalse(isBreakingRelease('1.2.3', '1.2.3'));

    assert.isFalse(isBreakingRelease('2.0.0', '1.2.3'));
  });

  test('is not a version it cannot read', () => {
    assert.isFalse(isBreakingRelease('1.2.3', 'next'));
  });
});
