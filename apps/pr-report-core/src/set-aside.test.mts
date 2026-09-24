import {
  describeSetAside,
  parseSetAside,
  SET_ASIDE_DESCRIPTION_LIMIT,
  setAsideStillApplies,
} from './set-aside.mjs';

const BASE = 'a'.repeat(40);

describe(describeSetAside, () => {
  test('says why and against which base, in a form it can read back', () => {
    const description = describeSetAside({
      reason: 'rebase-failed',
      baseSha: BASE,
      detail: 'rebase conflicts: CONFLICT (content): Merge conflict in a.mts',
    });

    assert.deepStrictEqual(parseSetAside(description), {
      reason: 'rebase-failed',
      baseSha: BASE,
      detail: 'rebase conflicts: CONFLICT (content): Merge conflict in a.mts',
    });
  });

  test('keeps within the length GitHub accepts, cutting the detail', () => {
    const description = describeSetAside({
      reason: 'rebase-failed',
      baseSha: BASE,
      detail: 'x'.repeat(500),
    });

    assert.isTrue(description.length <= SET_ASIDE_DESCRIPTION_LIMIT);

    assert.isTrue(description.endsWith('…'));

    assert.strictEqual(parseSetAside(description)?.baseSha, BASE);
  });

  test('puts the detail on one line', () => {
    assert.strictEqual(
      parseSetAside(
        describeSetAside({
          reason: 'push-failed',
          baseSha: BASE,
          detail: 'first line\nsecond line',
        }),
      )?.detail,
      'first line second line',
    );
  });
});

describe(parseSetAside, () => {
  test('is undefined for a description it did not write', () => {
    assert.isUndefined(parseSetAside(''));

    assert.isUndefined(parseSetAside('All checks passed'));

    assert.isUndefined(parseSetAside(`rebase-failed at ${'a'.repeat(7)}: x`));
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
