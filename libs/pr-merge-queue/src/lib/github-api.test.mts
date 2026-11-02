import { Arr, asUint32, Result } from 'ts-data-forge';
import { collectPages, parseRepoRef, repoOfUrl } from './github-api.mjs';

/** A server holding `all`, answering page `page` of `perPage`. */
const pages =
  (all: readonly number[], perPage: number) =>
  (page: number): Promise<Result<readonly number[], string>> =>
    Promise.resolve(Result.ok(all.slice((page - 1) * perPage, page * perPage)));

describe(collectPages, () => {
  test('reads every page until one comes back short', async () => {
    const all = Arr.seq(asUint32(250));

    const read = await collectPages(pages(all, 100), 100);

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(read.value, all);
  });

  test('stops after an empty page when the total is a multiple of the page size', async () => {
    const mut_asked: number[] = [];

    const read = await collectPages((page) => {
      mut_asked.push(page);

      return pages(Arr.seq(asUint32(200)), 100)(page);
    }, 100);

    assert.isTrue(Result.isOk(read));

    assert.lengthOf(read.value, 200);

    assert.deepStrictEqual(mut_asked, [1, 2, 3]);
  });

  test('returns the first error', async () => {
    const read = await collectPages(
      (page) =>
        Promise.resolve(
          page === 2 ? Result.err('boom') : Result.ok(Arr.seq(asUint32(100))),
        ),
      100,
    );

    assert.deepStrictEqual(read, Result.err('boom'));
  });
});

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
