import { parseSetAsideComment } from 'pr-report-core';
import {
  resolvedCommentBody,
  setAsideCommentBody,
} from './set-aside-comment.mjs';
import type { SkipRecord } from './types.mjs';

describe(setAsideCommentBody, () => {
  test('writes a record the script and the page read back', () => {
    assert.deepStrictEqual(
      parseSetAsideComment(setAsideCommentBody(skip(), 'main')),
      {
        kind: 'standing',
        setAside: { reason: 'rebase-failed', headSha: HEAD, baseSha: BASE },
        retry: false,
      },
    );
  });

  test('says why, and what takes it off', () => {
    const body = setAsideCommentBody(skip(), 'main');

    assert.include(
      body,
      '(`rebase-failed`): conflicts with origin/main in a\\_b.mts',
    );

    assert.include(
      body,
      'It stays aside until the branch is pushed again, or until `main` moves and it no longer conflicts.',
    );

    assert.notInclude(body, '<details>');
  });

  test('links each failed check, and says a moved base does not clear it', () => {
    const body = setAsideCommentBody(
      skip({
        reason: 'checks-failed',
        detail: 'failed: code-check-result / result, no-skip-ci-label',
        failedChecks: [
          {
            name: 'code-check-result / result',
            link: 'https://example.test/run/1',
          },
          { name: 'no-skip-ci-label', link: '' },
        ],
      }),
      'main',
    );

    assert.include(
      body,
      '- [code-check-result / result](https://example.test/run/1)\n- no-skip-ci-label',
    );

    assert.include(body, 'until the branch is pushed again: rebasing it');
  });

  test('asks for a bypass merge of a green one, and says a moved base does not clear it', () => {
    const body = setAsideCommentBody(
      skip({
        reason: 'awaiting-bypass',
        detail:
          'every required check is green; @owner is the only owner of .github/workflows/ci.yml and its author, who may not approve it',
      }),
      'main',
    );

    assert.include(body, '(`awaiting-bypass`): every required check is green');

    assert.include(
      body,
      "Nothing but a ruleset bypass merges it, which is a person's to do; auto-merge was left off.",
    );

    assert.include(
      body,
      'It stays aside until the branch is pushed again: rebasing it would only put the same checks through again. Tick the retry box to have it rebased and checked on the current `main`.',
    );
  });

  test('says a retry at the same head starts nothing, and what does', () => {
    const body = setAsideCommentBody(
      skip({
        reason: 'checks-not-started',
        detail:
          'nothing ran on its head for 5 min and code-check-result / result never reported: GitHub started no run for them',
      }),
      'main',
    );

    assert.include(
      body,
      'It stays aside until the branch is pushed again or `main` moves, which rebases it onto a new head. A retry while it is still up to date only watches the same head again; push a new commit to have GitHub start its checks now.',
    );
  });

  test('folds what the command printed away, in a fence nothing inside closes', () => {
    const body = setAsideCommentBody(
      skip({ output: 'CONFLICT (content): ```\nhint: @someone' }),
      'main',
    );

    assert.include(
      body,
      '<details><summary>What the command printed</summary>\n\n````text\nCONFLICT (content): ```\nhint: @someone\n````\n\n</details>',
    );
  });

  test('keeps the end of a long output', () => {
    const body = setAsideCommentBody(
      skip({
        output: Array.from({ length: 100 }, (_, i) => `line ${i}`).join('\n'),
      }),
      'main',
    );

    assert.include(body, '```text\n…\nline 40\n');

    assert.include(body, 'line 99\n```');

    assert.notInclude(body, 'line 39\n');
  });

  test('keeps a mention in the detail from mentioning anyone', () => {
    assert.include(
      setAsideCommentBody(skip({ detail: 'refused by @someone' }), 'main'),
      String.raw`refused by \@someone`,
    );
  });
});

describe(resolvedCommentBody, () => {
  test('is one line saying what ended it and when, read back as resolved', () => {
    const body = resolvedCommentBody(
      { reason: 'rebase-failed', headSha: HEAD, baseSha: BASE },
      'base-moved',
      'main',
      Date.parse('2026-09-29T01:02:03.456Z'),
    );

    assert.deepStrictEqual(parseSetAsideComment(body), { kind: 'resolved' });

    assert.strictEqual(
      body.split('\n').at(-1),
      'Resolved at 2026-09-29T01:02:03Z: no longer set aside (`rebase-failed` at `cccccccccc`) — `main` moved.',
    );
  });

  test('keeps what the set-aside said under a fold, without its record or its box', () => {
    const body = resolvedCommentBody(
      { reason: 'checks-failed', headSha: HEAD, baseSha: BASE },
      'pushed',
      'main',
      Date.parse('2026-09-29T01:02:03.456Z'),
      setAsideCommentBody(
        skip({
          reason: 'checks-failed',
          detail: 'failed: code-check-result / result',
          failedChecks: [{ name: 'code-check (lint)', link: 'https://x/1' }],
        }),
        'main',
      ),
    );

    assert.deepStrictEqual(parseSetAsideComment(body), { kind: 'resolved' });

    const lines = body.split('\n');

    assert.strictEqual(
      lines[2],
      'Resolved at 2026-09-29T01:02:03Z: no longer set aside (`checks-failed` at `cccccccccc`) — the branch was pushed.',
    );

    assert.include(body, '<details><summary>What it said</summary>');

    assert.include(body, '- [code-check (lint)](https://x/1)');

    assert.notInclude(body, 'unblock-prs:set-aside reason=');

    assert.notInclude(body, '- [ ] ');
  });
});

const HEAD = 'c'.repeat(40);

const BASE = 'a'.repeat(40);

const skip = (overrides: Partial<SkipRecord> = {}): SkipRecord =>
  ({
    number: 7,
    headSha: HEAD,
    baseSha: BASE,
    reason: 'rebase-failed',
    detail: 'conflicts with origin/main in a_b.mts',
    ...overrides,
  }) as const;
