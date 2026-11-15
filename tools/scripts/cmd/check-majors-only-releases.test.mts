import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { ChangesetFile } from '../lib/changesets.mjs';
import { checkMajorsOnlyReleases } from './check-majors-only-releases.mjs';

describe('checkMajorsOnlyReleases', () => {
  test('passes a major of a majors-only package', () => {
    const result = checkMajorsOnlyReleases({
      changesets: [changeset({ keys: 'major', other: 'patch' })],
      majorsOnly: MAJORS_ONLY,
    });

    assert.deepStrictEqual(result, Result.ok(1));
  });

  test('passes a none, which releases nothing', () => {
    const result = checkMajorsOnlyReleases({
      changesets: [changeset({ keys: 'none' })],
      majorsOnly: MAJORS_ONLY,
    });

    assert.isTrue(Result.isOk(result));
  });

  test('passes a minor or a patch of any other package', () => {
    const result = checkMajorsOnlyReleases({
      changesets: [changeset({ other: 'minor', another: 'patch' })],
      majorsOnly: MAJORS_ONLY,
    });

    assert.isTrue(Result.isOk(result));
  });

  test('fails a patch of a majors-only package, naming the file', () => {
    const result = checkMajorsOnlyReleases({
      changesets: [changeset({ other: 'patch', keys: 'patch' })],
      majorsOnly: MAJORS_ONLY,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '  - .changeset/change.md gives keys "patch" (keys/README.md)',
    );

    assert.notInclude(result.value, 'gives other');
  });

  test('fails a minor of a majors-only package', () => {
    const result = checkMajorsOnlyReleases({
      changesets: [changeset({ keys: 'minor' }, 'feature')],
      majorsOnly: MAJORS_ONLY,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, '.changeset/feature.md gives keys "minor"');
  });

  test('skips the README of .changeset/', () => {
    const result = checkMajorsOnlyReleases({
      changesets: [
        { file: '.changeset/README.md', content: '# Changesets\n' } as const,
      ],
      majorsOnly: MAJORS_ONLY,
    });

    assert.isTrue(Result.isOk(result));
  });
});

const MAJORS_ONLY: ReadonlyMap<string, string> = new Map<string, string>([
  ['keys', 'keys/README.md'],
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
