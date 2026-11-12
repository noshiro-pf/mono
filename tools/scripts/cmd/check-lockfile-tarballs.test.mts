import {
  findUnregisteredResolutions,
  judgeLockfile,
} from './check-lockfile-tarballs.mjs';

const lockfileOf = (...resolutions: readonly string[]): string =>
  [
    'packages:',
    '',
    ...resolutions.flatMap((resolution, i) => [
      `  pkg-${i.toString()}@1.0.0:`,
      `    resolution: ${resolution}`,
      '',
    ]),
  ].join('\n');

describe(findUnregisteredResolutions, () => {
  test.each([
    ['the registry', '{integrity: sha512-abc==}'],
    [
      'a directory inside the repository',
      '{directory: strict-lib/v7.0/output/lib/libs/es5, type: directory}',
    ],
  ])('%s is allowed', (_, resolution) => {
    expect(findUnregisteredResolutions(lockfileOf(resolution))).toStrictEqual(
      [],
    );
  });

  test.each([
    [
      'a git dependency',
      '{commit: ac90975b49694524e9ff472fbdba8769a558e21e, repo: https://example.com/x.git, type: git}',
    ],
    ['a tarball URL', '{tarball: https://example.com/x.tgz}'],
    [
      'a tarball with integrity',
      '{integrity: sha512-abc, tarball: https://example.com/x.tgz}',
    ],
    [
      'a directory leaving the repository',
      '{directory: ../x, type: directory}',
    ],
    ['an absolute directory', '{directory: /abs, type: directory}'],
    ['a block-style resolution', ''],
  ])('%s is reported with its line', (_, resolution) => {
    expect(
      findUnregisteredResolutions(
        lockfileOf('{integrity: sha512-ok==}', resolution),
      ),
    ).toStrictEqual([{ lineNumber: 7, resolution }]);
  });
});

describe(judgeLockfile, () => {
  test('passes with the number of resolutions read', () => {
    expect(
      judgeLockfile(
        lockfileOf('{integrity: sha512-a==}', '{integrity: sha512-b==}'),
      ),
    ).toStrictEqual({ ok: true, count: 2 });
  });

  test('a lockfile with no resolution line is an error, not a pass', () => {
    const judged = judgeLockfile('lockfileVersion: 9.0\n');

    assert.isFalse(judged.ok);

    expect(judged.message).toContain('no `resolution:` line');
  });

  test('an offender is an error naming its line', () => {
    const judged = judgeLockfile(
      lockfileOf('{tarball: https://example.com/x.tgz}'),
    );

    assert.isFalse(judged.ok);

    expect(judged.message).toContain(
      'pnpm-lock.yaml:4  {tarball: https://example.com/x.tgz}',
    );
  });
});
