import { parseRepo, repoFromSearch, repoUrl, searchWithRepo } from './repo.mjs';

describe(parseRepo, () => {
  test.each([
    ['owner/name', { owner: 'owner', name: 'name' }],
    [' owner/name ', { owner: 'owner', name: 'name' }],
    ['https://github.com/owner/name', { owner: 'owner', name: 'name' }],
    ['github.com/owner/name/pulls?q=1', { owner: 'owner', name: 'name' }],
    [
      'https://www.GitHub.com/Owner/na.me.git',
      { owner: 'Owner', name: 'na.me' },
    ],
  ] as const)('reads %s', (value, expected) => {
    assert.deepStrictEqual(parseRepo(value), expected);
  });

  test.each([
    'owner',
    'owner/..',
    '-owner/name',
    'gitlab.com/owner/name',
    'https://github.com/owner',
    'a/b/c',
  ])('refuses %s', (value) => {
    assert.isUndefined(parseRepo(value));
  });
});

describe(repoFromSearch, () => {
  test('is undefined without the parameter or with a bad one', () => {
    assert.isUndefined(repoFromSearch(''));

    assert.isUndefined(repoFromSearch('?repo=nope'));
  });

  test('reads the parameter', () => {
    assert.deepStrictEqual(repoFromSearch('?repo=a/b&cols=2'), {
      owner: 'a',
      name: 'b',
    });
  });
});

describe(searchWithRepo, () => {
  test('keeps every other parameter', () => {
    assert.strictEqual(
      searchWithRepo('?repo=a/b&cols=2', { owner: 'c', name: 'd' }),
      '?repo=c/d&cols=2',
    );
  });
});

test(repoUrl, () => {
  assert.strictEqual(
    repoUrl({ owner: 'a', name: 'b' }),
    'https://github.com/a/b',
  );
});
