import {
  parseSetAsideComment,
  setAsideApplies,
  setAsideStillApplies,
  writeResolvedComment,
  writeSetAsideComment,
  type SetAside,
} from './set-aside.mjs';

const HEAD = 'c'.repeat(40);

const BASE = 'a'.repeat(40);

const SET_ASIDE: SetAside = {
  reason: 'rebase-failed',
  headSha: HEAD,
  baseSha: BASE,
} as const;

describe(writeSetAsideComment, () => {
  test('says why and at which head and base, in a form it can read back', () => {
    assert.deepStrictEqual(
      parseSetAsideComment(
        writeSetAsideComment(SET_ASIDE, 'Conflicts with main in `a.mts`.'),
      ),
      { kind: 'standing', setAside: SET_ASIDE, retry: false },
    );
  });

  test('keeps the record out of the prose', () => {
    const body = writeSetAsideComment(SET_ASIDE, 'Conflicts with main.');

    const lines = body.split('\n');

    assert.match(lines[0] ?? '', /^<!--.*-->$/u);

    assert.strictEqual(lines[2], 'Conflicts with main.');

    assert.match(lines.at(-1) ?? '', /^- \[ \] Retry:/u);
  });
});

describe(parseSetAsideComment, () => {
  test('reads the retry box a person ticked', () => {
    for (const mark of ['x', 'X']) {
      const ticked = writeSetAsideComment(SET_ASIDE, 'prose').replace(
        '- [ ] Retry:',
        () => `- [${mark}] Retry:`,
      );

      assert.deepStrictEqual(parseSetAsideComment(ticked), {
        kind: 'standing',
        setAside: SET_ASIDE,
        retry: true,
      });
    }
  });

  test('reads only the box on the last line', () => {
    // What a command printed can hold anything, a ticked box included.
    const body = writeSetAsideComment(
      SET_ASIDE,
      ['```text', '- [x] Retry: not this one', '```'].join('\n'),
    );

    assert.deepStrictEqual(parseSetAsideComment(body), {
      kind: 'standing',
      setAside: SET_ASIDE,
      retry: false,
    });
  });

  test('reads a comment GitHub gave back with CRLF line ends', () => {
    const body = writeSetAsideComment(SET_ASIDE, 'prose')
      .replace('- [ ] Retry:', '- [x] Retry:')
      .replaceAll('\n', '\r\n');

    assert.deepStrictEqual(parseSetAsideComment(body), {
      kind: 'standing',
      setAside: SET_ASIDE,
      retry: true,
    });
  });

  test('reads a resolved one', () => {
    assert.deepStrictEqual(
      parseSetAsideComment(
        writeResolvedComment('Resolved: the branch was pushed.'),
      ),
      { kind: 'resolved' },
    );
  });

  test('is undefined for a comment it did not write', () => {
    assert.isUndefined(parseSetAsideComment(''));

    assert.isUndefined(parseSetAsideComment('LGTM'));

    // The marker somewhere other than the first line.
    assert.isUndefined(
      parseSetAsideComment(`quoting:\n${writeSetAsideComment(SET_ASIDE, 'x')}`),
    );

    assert.isUndefined(
      parseSetAsideComment(
        `<!-- unblock-prs:set-aside reason=rebase-failed head=${'c'.repeat(7)} base=${BASE} -->`,
      ),
    );
  });
});

describe(setAsideApplies, () => {
  test('lasts while the head and the base are where they were', () => {
    assert.isTrue(setAsideApplies(SET_ASIDE, HEAD, BASE));

    assert.isFalse(setAsideApplies(SET_ASIDE, 'd'.repeat(40), BASE));

    assert.isFalse(setAsideApplies(SET_ASIDE, HEAD, 'b'.repeat(40)));
  });

  test('outlives a moved base, but not a push, when the checks failed', () => {
    const failed = { ...SET_ASIDE, reason: 'checks-failed' } as const;

    assert.isTrue(setAsideApplies(failed, HEAD, 'b'.repeat(40)));

    assert.isFalse(setAsideApplies(failed, 'd'.repeat(40), BASE));
  });
});

describe(setAsideStillApplies, () => {
  test('lasts while the base is where it was', () => {
    assert.isTrue(
      setAsideStillApplies({ reason: 'rebase-failed', baseSha: BASE }, BASE),
    );

    assert.isFalse(
      setAsideStillApplies(
        { reason: 'rebase-failed', baseSha: BASE },
        'b'.repeat(40),
      ),
    );
  });

  test('outlives a moved base when the checks failed', () => {
    assert.isTrue(
      setAsideStillApplies(
        { reason: 'checks-failed', baseSha: BASE },
        'b'.repeat(40),
      ),
    );
  });
});
