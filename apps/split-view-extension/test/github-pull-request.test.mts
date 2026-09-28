import {
  asGitHubMessage,
  githubMessageTag,
  issueUrlOf,
  pullRequestOf,
  pullRequestSplitViewSearch,
  pullRequestTitleOf,
} from '../src/index.mjs';

describe('pullRequestOf', () => {
  test('reads the conversation tab', () => {
    assert.deepStrictEqual(
      pullRequestOf('https://github.com/noshiro-pf/mono/pull/2085'),
      {
        number: 2085,
        url: 'https://github.com/noshiro-pf/mono/pull/2085',
      },
    );
  });

  test('reads every tab below it, and drops the query and the fragment', () => {
    for (const address of [
      'https://github.com/noshiro-pf/mono/pull/2085/files',
      'https://github.com/noshiro-pf/mono/pull/2085/files?w=1#diff-abc',
      'https://github.com/noshiro-pf/mono/pull/2085/changes',
      'https://github.com/noshiro-pf/mono/pull/2085/commits/0123abc',
      'https://github.com/noshiro-pf/mono/pull/2085/',
      'https://github.com/noshiro-pf/mono/pull/2085#issuecomment-1',
    ]) {
      assert.deepStrictEqual(pullRequestOf(address), {
        number: 2085,
        url: 'https://github.com/noshiro-pf/mono/pull/2085',
      });
    }
  });

  test('accepts the characters GitHub allows in an owner and a repository', () => {
    assert.deepStrictEqual(
      pullRequestOf('https://github.com/some-org/my.repo_name-2/pull/7'),
      {
        number: 7,
        url: 'https://github.com/some-org/my.repo_name-2/pull/7',
      },
    );
  });

  test('refuses what is not a pull request', () => {
    for (const address of [
      'https://github.com/noshiro-pf/mono',
      'https://github.com/noshiro-pf/mono/pulls',
      'https://github.com/noshiro-pf/mono/pull/new/main',
      'https://github.com/noshiro-pf/mono/pull/12abc',
      'https://github.com/noshiro-pf/mono/issues/2079',
      'https://gist.github.com/noshiro-pf/mono/pull/1',
      'http://github.com/noshiro-pf/mono/pull/1',
      'https://github.com.example.com/noshiro-pf/mono/pull/1',
      'not a url',
    ]) {
      assert.isUndefined(pullRequestOf(address));
    }
  });
});

describe('issueUrlOf', () => {
  test('reads an issue, in this repository or another', () => {
    assert.deepStrictEqual(
      issueUrlOf('https://github.com/noshiro-pf/mono/issues/2079'),
      'https://github.com/noshiro-pf/mono/issues/2079',
    );

    assert.deepStrictEqual(
      issueUrlOf('https://github.com/other/repo/issues/3#issuecomment-9'),
      'https://github.com/other/repo/issues/3',
    );
  });

  test('refuses what is not an issue on GitHub', () => {
    for (const address of [
      'https://github.com/noshiro-pf/mono/pull/2079',
      'https://github.com/noshiro-pf/mono/issues',
      'https://example.com/noshiro-pf/mono/issues/1',
      'mailto:someone@example.com',
      '',
    ]) {
      assert.isUndefined(issueUrlOf(address));
    }
  });
});

describe('pullRequestTitleOf', () => {
  test("takes the title out of GitHub's tab title", () => {
    assert.deepStrictEqual(
      pullRequestTitleOf(
        "feat(unblock-prs): stamp log lines with the machine's local time by noshiro-pf · Pull Request #2085 · noshiro-pf/mono · GitHub",
      ),
      "feat(unblock-prs): stamp log lines with the machine's local time",
    );
  });

  test('keeps a " by " that is part of the title', () => {
    assert.deepStrictEqual(
      pullRequestTitleOf(
        'Sort by date by someone · Pull Request #1 · owner/repo · GitHub',
      ),
      'Sort by date',
    );
  });

  test('reads it with the number another extension put in front', () => {
    assert.deepStrictEqual(
      pullRequestTitleOf(
        '#2085 Fix the thing by noshiro-pf · Pull Request #2085 · noshiro-pf/mono · GitHub',
      ),
      'Fix the thing',
    );
  });

  test('reads it without the trailing site name', () => {
    assert.deepStrictEqual(
      pullRequestTitleOf(
        'Fix the thing by noshiro-pf · Pull Request #2085 · noshiro-pf/mono',
      ),
      'Fix the thing',
    );
  });

  test('gives up on a title of another shape', () => {
    assert.isUndefined(pullRequestTitleOf('GitHub'));

    assert.isUndefined(
      pullRequestTitleOf('Issue title · Issue #1 · owner/repo · GitHub'),
    );
  });
});

describe('pullRequestSplitViewSearch', () => {
  const pullRequest = {
    number: 2085,
    url: 'https://github.com/noshiro-pf/mono/pull/2085',
  } as const;

  const diff =
    'https://github.com/noshiro-pf/mono/pull/2085/files?w=1&show-viewed-files=false';

  const conversation = 'https://github.com/noshiro-pf/mono/pull/2085';

  const issue = 'https://github.com/noshiro-pf/mono/issues/2079';

  test('puts the diff beside the conversation at 7:3, both at 100%', () => {
    assert.deepStrictEqual(
      read(
        pullRequestSplitViewSearch({
          pullRequest,
          title: 'Fix the thing',
          issueUrl: undefined,
        }),
      ),
      {
        ws: 'github-pull-request',
        name: 'GitHub pull request',
        title: '#2085 Fix the thing',
        layout: 'r70pp',
        url: [diff, conversation],
        zoom: ['1', '1'],
      },
    );
  });

  test('shares the right half with the issue the pull request closes', () => {
    assert.deepStrictEqual(
      read(
        pullRequestSplitViewSearch({
          pullRequest,
          title: 'Fix the thing',
          issueUrl: issue,
        }),
      ),
      {
        ws: 'github-pull-request',
        name: 'GitHub pull request',
        title: '#2085 Fix the thing',
        layout: 'rprpp',
        url: [diff, conversation, issue],
        zoom: ['1', '0.75', '0.75'],
      },
    );
  });

  test('titles the tab with the number alone when the title is unknown', () => {
    const params = new URLSearchParams(
      pullRequestSplitViewSearch({
        pullRequest,
        title: undefined,
        issueUrl: undefined,
      }),
    );

    assert.deepStrictEqual(params.get('title'), '#2085');
  });

  test('escapes each address whole, so its own query stays in its pane', () => {
    const search = pullRequestSplitViewSearch({
      pullRequest,
      title: 'A & B',
      issueUrl: undefined,
    });

    assert.isFalse(search.includes('&w=1'));

    assert.isFalse(search.includes('&show-viewed-files'));

    assert.isFalse(search.includes('& B'));
  });
});

describe('asGitHubMessage', () => {
  test('accepts a request to open a pull request', () => {
    assert.deepStrictEqual(
      asGitHubMessage({
        tag: githubMessageTag,
        kind: 'open',
        url: 'https://github.com/noshiro-pf/mono/pull/2085',
        title: 'Fix the thing',
        issueUrl: 'https://github.com/noshiro-pf/mono/issues/2079',
        active: false,
        extra: true,
      }),
      {
        tag: githubMessageTag,
        kind: 'open',
        url: 'https://github.com/noshiro-pf/mono/pull/2085',
        title: 'Fix the thing',
        issueUrl: 'https://github.com/noshiro-pf/mono/issues/2079',
        active: false,
      },
    );
  });

  test('reads a missing title or issue as unknown', () => {
    assert.deepStrictEqual(
      asGitHubMessage({
        tag: githubMessageTag,
        kind: 'open',
        url: 'https://github.com/noshiro-pf/mono/pull/2085',
        active: true,
      }),
      {
        tag: githubMessageTag,
        kind: 'open',
        url: 'https://github.com/noshiro-pf/mono/pull/2085',
        title: undefined,
        issueUrl: undefined,
        active: true,
      },
    );
  });

  test('accepts a request to look a pull request up first', () => {
    assert.deepStrictEqual(
      asGitHubMessage({
        tag: githubMessageTag,
        kind: 'look-up',
        url: 'https://github.com/noshiro-pf/mono/pull/2085',
      }),
      {
        tag: githubMessageTag,
        kind: 'look-up',
        url: 'https://github.com/noshiro-pf/mono/pull/2085',
      },
    );
  });

  test('refuses anything else', () => {
    for (const value of [
      undefined,
      'open',
      { tag: 'other', kind: 'open', url: 'x', active: true },
      { tag: githubMessageTag, kind: 'open', url: 1, active: true },
      { tag: githubMessageTag, kind: 'open', url: 'x' },
      { tag: githubMessageTag, kind: 'open', url: 'x', active: true, title: 1 },
      { tag: githubMessageTag, kind: 'close', url: 'x' },
    ]) {
      assert.isUndefined(asGitHubMessage(value));
    }
  });
});

/** What `split.html` reads back out of the query. */
const read = (search: string): unknown => {
  const params = new URLSearchParams(search);

  return {
    ws: params.get('ws'),
    name: params.get('name'),
    title: params.get('title'),
    layout: params.get('layout'),
    url: params.getAll('url'),
    zoom: params.getAll('zoom'),
  };
};
