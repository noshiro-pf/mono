import type { ReadonlyRecord } from 'ts-type-forge';
import { listChangesetBumps } from '../lib/changesets.mjs';
import {
  findFixedReleaseProblems,
  strictLibBundles,
} from './check-fixed-releases.mjs';

const group = ['h-1-source', 'h-2-source', 'h-3-source'] as const;

const bundles: ReadonlySet<string> = new Set<string>(['h-1', 'h-2', 'h-3']);

const changeset = (
  file: string,
  releases: ReadonlyRecord<string, string>,
): Readonly<{ file: string; content: string }> =>
  ({
    file: `.changeset/${file}`,
    content: [
      '---',
      ...Object.entries(releases).map(([name, bump]) => `'${name}': ${bump}`),
      '---',
      '',
      'A change.',
      '',
    ].join('\n'),
  }) as const;

const problemsOf = (
  ...changesets: readonly Readonly<{ file: string; content: string }>[]
): readonly string[] =>
  findFixedReleaseProblems({
    bumps: listChangesetBumps(changesets),
    fixed: [group],
    bundles,
  });

describe(findFixedReleaseProblems, () => {
  test('a changeset naming every member of the group passes', () => {
    expect(
      problemsOf(
        changeset('a.md', {
          'h-1-source': 'patch',
          'h-2-source': 'patch',
          'h-3-source': 'patch',
        }),
      ),
    ).toStrictEqual([]);
  });

  test('one naming all but one is reported, naming the one left out', () => {
    const problems = problemsOf(
      changeset('a.md', { 'h-1-source': 'patch', 'h-2-source': 'patch' }),
    );

    expect(problems).toHaveLength(1);

    expect(problems[0]).toContain('.changeset/a.md names 2 of the 3');

    expect(problems[0]).toContain('h-3-source');
  });

  test('one naming a bundle is reported', () => {
    const problems = problemsOf(changeset('a.md', { 'h-2': 'minor' }));

    expect(problems).toHaveLength(1);

    expect(problems[0]).toContain('.changeset/a.md names h-2,');
  });

  test('one naming a bundle and every harness still reports the bundle', () => {
    const problems = problemsOf(
      changeset('a.md', {
        'h-1': 'patch',
        'h-1-source': 'patch',
        'h-2-source': 'patch',
        'h-3-source': 'patch',
      }),
    );

    expect(problems).toHaveLength(1);

    expect(problems[0]).toContain('names h-1,');
  });

  test('one naming no member of the group passes', () => {
    expect(
      problemsOf(changeset('a.md', { 'ts-data-forge': 'patch' })),
    ).toStrictEqual([]);
  });

  test('a member named with none counts as named', () => {
    expect(
      problemsOf(
        changeset('a.md', {
          'h-1-source': 'patch',
          'h-2-source': 'patch',
          'h-3-source': 'none',
        }),
      ),
    ).toStrictEqual([]);
  });

  test('two changesets each naming part of the group are both reported', () => {
    const problems = problemsOf(
      changeset('a.md', { 'h-1-source': 'patch' }),
      changeset('b.md', { 'h-2-source': 'patch', 'h-3-source': 'patch' }),
    );

    expect(problems).toHaveLength(2);

    expect(problems[0]).toContain('.changeset/a.md');

    expect(problems[1]).toContain('.changeset/b.md');
  });
});

describe(strictLibBundles, () => {
  test('the published strict-lib packages outside every fixed group', () => {
    expect(
      strictLibBundles(
        [
          { name: 'h-1', dir: 'strict-lib/v1.0/output/lib', isPrivate: false },
          { name: 'h-1-source', dir: 'strict-lib/v1.0', isPrivate: false },
          {
            name: 'lib-es5',
            dir: 'strict-lib/v1.0/output/lib/libs/es5',
            isPrivate: true,
          },
          {
            name: 'ts-data-forge',
            dir: 'libs/ts-data-forge',
            isPrivate: false,
          },
        ],
        [['h-1-source']],
      ),
    ).toStrictEqual(new Set<string>(['h-1']));
  });
});
