import { isSameRepo } from './repo-settings.mjs';

describe(isSameRepo, () => {
  test('is the same repository whatever the case', () => {
    assert.isTrue(
      isSameRepo(
        { owner: 'Example-Org', name: 'Hello' },
        { owner: 'example-org', name: 'hello' },
      ),
    );
  });

  // `pr-report --repo` run in another repository's checkout must not judge the
  // pull requests by that checkout's ruleset.
  test('is not another repository', () => {
    assert.isFalse(
      isSameRepo(
        { owner: 'example-org', name: 'hello' },
        { owner: 'example-org', name: 'world' },
      ),
    );

    assert.isFalse(
      isSameRepo(
        { owner: 'example-org', name: 'hello' },
        { owner: 'other-org', name: 'hello' },
      ),
    );
  });
});
