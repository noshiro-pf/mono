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
      'It stays aside until the branch is pushed again or `main` moves.',
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
      Temporal.Instant.from('2026-09-29T01:02:03.456Z'),
    );

    assert.deepStrictEqual(parseSetAsideComment(body), { kind: 'resolved' });

    assert.strictEqual(
      body.split('\n').at(-1),
      'Resolved at 2026-09-29T01:02:03Z: no longer set aside (`rebase-failed` at `cccccccccc`) — `main` moved.',
    );
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
