import dedent from 'dedent';
import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import { projectRootPath } from '../project-root-path.mjs';
import {
  isBreaking,
  isBreakingRelease,
  isChangesetFileName,
  isChangesetPath,
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

  test('reads a quoted bump', () => {
    assert.deepStrictEqual(
      parseChangesetBumps("---\n'ts-data-forge': 'major'\n---\n\nBody.\n"),
      new Map<string, Bump>([['ts-data-forge', 'major']]),
    );
  });

  test('reads a bump followed by a comment', () => {
    assert.deepStrictEqual(
      parseChangesetBumps(
        '---\nts-data-forge: major # drops X\n---\n\nBody.\n',
      ),
      new Map<string, Bump>([['ts-data-forge', 'major']]),
    );
  });

  test('reads front matter after leading blank lines', () => {
    assert.deepStrictEqual(
      parseChangesetBumps('\n\n---\nts-data-forge: major\n---\n\nBody.\n'),
      new Map<string, Bump>([['ts-data-forge', 'major']]),
    );
  });

  test('reads `none`, which names a package without releasing it', () => {
    assert.deepStrictEqual(
      parseChangesetBumps('---\nts-data-forge: none\n---\n\nBody.\n'),
      new Map<string, Bump>([['ts-data-forge', 'none']]),
    );
  });

  test('names nothing for empty front matter', () => {
    assert.strictEqual(parseChangesetBumps('---\n---\n\nBody.\n').size, 0);
  });

  test('throws on what changesets refuses', () => {
    assert.throws(
      () => parseChangesetBumps('# Changesets\n\nfoo: major\n'),
      /missing or invalid frontmatter/u,
    );

    assert.throws(
      () => parseChangesetBumps('---\nts-data-forge: mayor\n---\n'),
      /invalid version type/u,
    );

    assert.throws(
      () => parseChangesetBumps('---\nts-data-forge: [major\n---\n'),
      /invalid YAML/u,
    );
  });
});

describe('isChangesetFileName', () => {
  test.each([
    ['.changeset/brave-cats-sing.md', true],
    ['/abs/.changeset/pre/x.md', true],
    ['.changeset/README.md', false],
    ['.changeset/readme.md', false],
    ['.changeset/AGENTS.md', false],
    ['.changeset/CLAUDE.md', false],
    ['.changeset/GEMINI.md', false],
    ['.changeset/.hidden.md', false],
    ['.changeset/config.json', false],
  ] as const)('%s → %s', (file, expected) => {
    assert.strictEqual(isChangesetFileName(file), expected);
  });
});

describe('isChangesetPath', () => {
  test.each([
    ['.changeset/brave-cats-sing.md', true],
    ['.changeset/pre/brave-cats-sing.md', true],
    ['.changeset/README.md', false],
    ['.changeset/notes/plan.md', false],
    ['.changeset/config.json', false],
    ['libs/x/.changeset/a.md', false],
  ] as const)('%s → %s', (file, expected) => {
    assert.strictEqual(isChangesetPath(file), expected);
  });
});

describe('the changesets packages the guards read with', () => {
  // The guards read changesets with these root devDependencies, and are right
  // only while each is the copy `changeset version` uses.
  const fromRoot = createRequire(path.resolve(projectRootPath, 'package.json'));

  const fromCli = createRequire(
    fromRoot.resolve('@changesets/cli/package.json'),
  );

  const fromRead = createRequire(
    fromCli.resolve('@changesets/read/package.json'),
  );

  // pnpm links one copy per version, so one version is one real path.
  test.each([
    ['@changesets/parse', fromRead],
    ['@changesets/assemble-release-plan', fromCli],
    ['@changesets/config', fromCli],
    ['@changesets/types', fromCli],
  ] as const)('%s is the copy `@changesets/cli` uses', (name, from) => {
    assert.strictEqual(
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.realpathSync(fromRoot.resolve(`${name}/package.json`)),
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.realpathSync(from.resolve(`${name}/package.json`)),
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
        { file: '.changeset/config.json', content: '{}' },
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

  test('names the file changesets would refuse', () => {
    assert.throws(
      () =>
        listChangesetBumps([
          { file: '.changeset/bad.md', content: 'no front matter\n' },
        ]),
      /^\.changeset\/bad\.md: could not parse changeset/u,
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

  test('is never a none', () => {
    assert.isFalse(isBreaking('none', '0.5.1'));

    assert.isFalse(isBreaking('none', '1.2.3'));
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
