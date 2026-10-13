import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  checkLinkedReleases,
  parseLinkedGroups,
} from './check-linked-releases.mjs';
import type { ChangesetFile } from './check-next-major.mjs';

describe('parseLinkedGroups', () => {
  test('reads the groups', () => {
    assert.deepStrictEqual(
      parseLinkedGroups('{ "linked": [["a", "b"], ["c"]] }'),
      Result.ok([['a', 'b'], ['c']]),
    );
  });

  test('reads no group from a config without the key', () => {
    assert.deepStrictEqual(parseLinkedGroups('{}'), Result.ok([]));
  });

  test('rejects a key of another shape', () => {
    assert.isTrue(Result.isErr(parseLinkedGroups('{ "linked": ["a", "b"] }')));
  });
});

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
      'members of it are given none:\n\n  - wrapper',
    );
  });

  test('fails a breaking release of a wrapper alone', () => {
    const result = checkLinkedReleases({
      changesets: [changeset({ wrapper: 'major' })],
      linked: [GROUP],
      versions: VERSIONS,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'given none:\n\n  - core');
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

  test('fails a group naming what is not a workspace package', () => {
    const result = checkLinkedReleases({
      changesets: [],
      linked: [['core', 'wrapper-*']],
      versions: VERSIONS,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'without a glob:\n\n  - wrapper-*');
  });
});

const GROUP = ['core', 'wrapper'] as const;

const VERSIONS: ReadonlyMap<string, string> = new Map([
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
