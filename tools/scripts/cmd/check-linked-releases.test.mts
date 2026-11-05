import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { readReleaseConfig, type ChangesetFile } from '../lib/changesets.mjs';
import { checkLinkedReleases } from './check-linked-releases.mjs';

describe('checkLinkedReleases', () => {
  test('passes a group no breaking release is pending in', () => {
    const result = checkLinkedReleases({
      changesets: [changeset({ core: 'minor', wrapper: 'patch' })],
      linked: [GROUP],
      versions: VERSIONS,
    });

    assert.deepStrictEqual(result, Result.ok(1));
  });

  test('passes a breaking release that names every member', () => {
    const result = checkLinkedReleases({
      changesets: [
        changeset({ core: 'major' }, 'core'),
        changeset({ wrapper: 'major' }, 'wrapper'),
      ],
      linked: [GROUP],
      versions: VERSIONS,
    });

    assert.isTrue(Result.isOk(result));
  });

  test('fails a breaking release of the core alone, naming the wrapper', () => {
    const result = checkLinkedReleases({
      changesets: [changeset({ core: 'major', wrapper: 'patch' })],
      linked: [GROUP],
      versions: VERSIONS,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, '  - .changeset/change.md gives core "major"');

    assert.include(
      result.value,
      'members of it are given no breaking bump:\n\n  - wrapper',
    );
  });

  test('fails a breaking release of a wrapper alone', () => {
    const result = checkLinkedReleases({
      changesets: [changeset({ wrapper: 'major' })],
      linked: [GROUP],
      versions: VERSIONS,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'given no breaking bump:\n\n  - core');
  });

  test('treats a minor bump of a 0.x member as breaking', () => {
    const result = checkLinkedReleases({
      changesets: [changeset({ core: 'major', young: 'minor' })],
      linked: [['core', 'young']],
      versions: VERSIONS,
    });

    assert.isTrue(Result.isOk(result));
  });

  test('leaves packages outside every group alone', () => {
    const result = checkLinkedReleases({
      changesets: [changeset({ young: 'minor' })],
      linked: [GROUP],
      versions: VERSIONS,
    });

    assert.isTrue(Result.isOk(result));
  });

  // #3309: read as check:prose:dependent-releases reads it, the glob expanded,
  // rather than refused as a name no package has.
  test('reads a glob member of a linked group as changesets does', () => {
    const config = readReleaseConfig(
      { linked: [['core', 'wrap*']] },
      Array.from(VERSIONS, ([name, version]) => ({ name, version })),
    );

    assert.isTrue(Result.isOk(config));

    assert.deepStrictEqual(config.value.linked, [['core', 'wrapper']]);

    const result = checkLinkedReleases({
      changesets: [changeset({ core: 'major' })],
      linked: config.value.linked,
      versions: VERSIONS,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, '  - wrapper');
  });

  test('refuses a config naming what is not a workspace package', () => {
    assert.isTrue(
      Result.isErr(
        readReleaseConfig(
          { linked: [['core', 'missing']] },
          Array.from(VERSIONS, ([name, version]) => ({ name, version })),
        ),
      ),
    );
  });
});

const GROUP = ['core', 'wrapper'] as const;

const VERSIONS: ReadonlyMap<string, string> = new Map<string, string>([
  ['core', '3.1.0'],
  ['wrapper', '2.1.0'],
  ['young', '0.4.0'],
]);

const changeset = (
  bumps: ReadonlyRecord<string, string>,
  name = 'change',
): ChangesetFile =>
  ({
    file: `.changeset/${name}.md`,
    content: [
      '---',
      ...Object.entries(bumps).map(([pkg, bump]) => `'${pkg}': ${bump}`),
      '---',
      '',
      'Something.',
      '',
    ].join('\n'),
  }) as const;
