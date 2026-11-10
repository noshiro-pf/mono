import { Result } from 'ts-data-forge';
import { parseRepoRef, repoOfUrl, resolveRepo } from './repository.mjs';

describe(repoOfUrl, () => {
  test('every form git and a manifest write', () => {
    for (const url of [
      'https://github.com/o/n',
      'https://github.com/o/n.git',
      'git@github.com:o/n.git',
      'org-123@github.com:o/n.git',
      'github.com:o/n',
      'git@GitHub.com:o/n.git',
      'ssh://git@github.com/o/n.git',
      'git+https://github.com/o/n.git',
      'https://x-access-token:secret@github.com/o/n.git',
      'https://me@github.com/o/n',
      'http://github.com/o/n',
    ]) {
      assert.deepStrictEqual(repoOfUrl(url), { owner: 'o', name: 'n' });
    }
  });

  test('a dotted name keeps its dots; another host names none', () => {
    assert.deepStrictEqual(repoOfUrl('https://github.com/o/a.b.git'), {
      owner: 'o',
      name: 'a.b',
    });

    assert.isUndefined(repoOfUrl('http://127.0.0.1:1234/git/o/n'));

    assert.isUndefined(repoOfUrl('git@gitlab.com:o/n.git'));
  });

  test('a dot segment names none', () => {
    assert.isUndefined(repoOfUrl('git@github.com:o/...git'));

    assert.isUndefined(repoOfUrl('git@github.com:./n'));
  });
});

describe(parseRepoRef, () => {
  test('owner/name and nothing else', () => {
    assert.deepStrictEqual(
      parseRepoRef('o/n'),
      Result.ok({ owner: 'o', name: 'n' }),
    );

    assert.isTrue(Result.isErr(parseRepoRef('o/n/x')));

    assert.isTrue(Result.isErr(parseRepoRef('n')));

    assert.isTrue(Result.isErr(parseRepoRef('o/..')));
  });
});

const never = (): Promise<string | undefined> => {
  throw new Error('not to be read');
};

describe(resolveRepo, () => {
  test('--repo first, reading nothing else', async () => {
    assert.deepStrictEqual(
      await resolveRepo('o/n', { originUrl: never, manifestUrl: never }),
      Result.ok({ owner: 'o', name: 'n' }),
    );
  });

  test('origin before the manifest; the manifest when origin is no GitHub remote', async () => {
    assert.deepStrictEqual(
      await resolveRepo(undefined, {
        originUrl: () => Promise.resolve('git@github.com:fork/n.git'),
        manifestUrl: never,
      }),
      Result.ok({ owner: 'fork', name: 'n' }),
    );

    assert.deepStrictEqual(
      await resolveRepo(undefined, {
        originUrl: () => Promise.resolve('http://127.0.0.1:1234/git/o/n'),
        manifestUrl: () => Promise.resolve('git+https://github.com/up/n.git'),
      }),
      Result.ok({ owner: 'up', name: 'n' }),
    );
  });

  test('neither names one', async () => {
    const result = await resolveRepo(undefined, {
      originUrl: () => Promise.resolve(undefined),
      manifestUrl: () => Promise.resolve(undefined),
    });

    assert.isTrue(Result.isErr(result));
  });
});
