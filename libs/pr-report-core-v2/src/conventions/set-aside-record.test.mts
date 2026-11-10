import {
  moveSetAsideBase,
  parseSetAsideComment,
  writeResolvedSetAsideComment,
  writeSetAsideComment,
  type SetAsideRecord,
} from './set-aside-record.mjs';

const HEAD = 'c'.repeat(40);

const BASE = 'a'.repeat(40);

const SET_ASIDE: SetAsideRecord = {
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
      { kind: 'standing', record: SET_ASIDE, retry: false },
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
        record: SET_ASIDE,
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
      record: SET_ASIDE,
      retry: false,
    });
  });

  test('reads a comment GitHub gave back with CRLF line ends', () => {
    const body = writeSetAsideComment(SET_ASIDE, 'prose')
      .replace('- [ ] Retry:', '- [x] Retry:')
      .replaceAll('\n', '\r\n');

    assert.deepStrictEqual(parseSetAsideComment(body), {
      kind: 'standing',
      record: SET_ASIDE,
      retry: true,
    });
  });

  test('reads a resolved one', () => {
    assert.deepStrictEqual(
      parseSetAsideComment(
        writeResolvedSetAsideComment('Resolved: the branch was pushed.'),
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

describe(moveSetAsideBase, () => {
  test('changes the base it records, and nothing else', () => {
    const moved = 'b'.repeat(40);

    const body = writeSetAsideComment(
      { reason: 'rebase-failed', headSha: HEAD, baseSha: BASE },
      'It conflicts.',
    ).replace('- [ ]', '- [x]');

    const after = moveSetAsideBase(body, moved);

    assert.deepStrictEqual(parseSetAsideComment(after), {
      kind: 'standing',
      record: { reason: 'rebase-failed', headSha: HEAD, baseSha: moved },
      retry: true,
    });

    assert.strictEqual(
      after.slice(after.indexOf('\n')),
      body.slice(body.indexOf('\n')),
    );
  });

  test('leaves a comment that records nothing as it is', () => {
    const resolved = writeResolvedSetAsideComment('Resolved.');

    assert.strictEqual(moveSetAsideBase(resolved, BASE), resolved);

    assert.strictEqual(moveSetAsideBase('not ours', BASE), 'not ours');
  });
});
