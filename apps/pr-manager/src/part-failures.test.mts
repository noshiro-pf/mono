import {
  checksFailureOf,
  failureNotes,
  isUnread,
  OPEN_PARTS,
} from './part-failures.mjs';

describe(failureNotes, () => {
  test('says nothing when every part answered', () => {
    assert.deepStrictEqual(failureNotes({}, OPEN_PARTS), []);
  });

  test('says each failed part of the panel, and whether it is the last read', () => {
    assert.deepStrictEqual(
      failureNotes(
        {
          checks: { message: 'Timed out.', kept: true },
          comparisons: { message: 'Refused.', kept: false },
          issues: { message: 'Not this panel.', kept: false },
        },
        OPEN_PARTS,
      ),
      [
        'Could not read the check results, so this shows the last read of it. Timed out.',
        'Could not read how far each branch is from its base. Refused.',
      ],
    );
  });

  test('says each part that failed on its own, even with the same words', () => {
    assert.deepStrictEqual(
      failureNotes(
        {
          checks: { message: 'GitHub answered 502.', kept: true },
          details: { message: 'GitHub answered 502.', kept: false },
        },
        OPEN_PARTS,
      ),
      [
        'Could not read the check results, so this shows the last read of it. GitHub answered 502.',
        'Could not read the reviews and set-aside records. GitHub answered 502.',
      ],
    );
  });

  test('says the pull requests failing once, not again for what is asked from them', () => {
    assert.deepStrictEqual(
      failureNotes(
        {
          pulls: { message: 'Timed out.', kept: false },
          rules: { message: 'Timed out.', kept: false },
          comparisons: { message: 'Timed out.', kept: false },
        },
        OPEN_PARTS,
      ),
      ['Could not read the open pull requests. Timed out.'],
    );
  });
});

describe(checksFailureOf, () => {
  test('is the rules with none kept, before the checks', () => {
    const rules = { message: 'rules', kept: false } as const;

    const checks = { message: 'checks', kept: true } as const;

    assert.strictEqual(checksFailureOf({ rules, checks }), rules);

    assert.strictEqual(
      checksFailureOf({ rules: { ...rules, kept: true }, checks }),
      checks,
    );

    assert.isUndefined(checksFailureOf({ rules: { ...rules, kept: true } }));
  });
});

describe(isUnread, () => {
  test('is a failure with nothing kept', () => {
    assert.isTrue(
      isUnread({ merged: { message: 'x', kept: false } }, 'merged'),
    );

    assert.isFalse(
      isUnread({ merged: { message: 'x', kept: true } }, 'merged'),
    );

    assert.isFalse(isUnread({}, 'merged'));
  });
});
