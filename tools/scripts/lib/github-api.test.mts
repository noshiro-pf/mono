import { Result } from 'ts-data-forge';
import { parseRepoRef, repoOfUrl } from './github-api.mjs';

describe(parseRepoRef, () => {
  test('reads `owner/name`', () => {
    assert.deepStrictEqual(
      parseRepoRef('noshiro-pf/mono'),
      Result.ok({ owner: 'noshiro-pf', name: 'mono' }),
    );
  });

  test.each(['mono', 'noshiro-pf/', '/mono', 'a/b/c'])('refuses %j', (raw) => {
    assert.deepStrictEqual(
      parseRepoRef(raw),
      Result.err(`expected owner/name, got ${JSON.stringify(raw)}`),
    );
  });
});

describe(repoOfUrl, () => {
  test.each([
    'https://github.com/noshiro-pf/mono',
    'https://github.com/noshiro-pf/mono.git',
    'git+https://github.com/noshiro-pf/mono.git',
    'git@github.com:noshiro-pf/mono.git',
  ])('reads the repository out of %j', (url) => {
    assert.deepStrictEqual(repoOfUrl(url), {
      owner: 'noshiro-pf',
      name: 'mono',
    });
  });

  test.each([
    'http://local_proxy@127.0.0.1:41234/git/noshiro-pf/mono',
    'https://gitlab.com/noshiro-pf/mono.git',
    '',
  ])('names no GitHub repository in %j', (url) => {
    assert.isUndefined(repoOfUrl(url));
  });
});
