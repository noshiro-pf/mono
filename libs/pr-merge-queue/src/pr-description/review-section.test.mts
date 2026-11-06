import { deferralReasonOf } from './review-section.mjs';

describe(deferralReasonOf, () => {
  test.each([
    ['(predates) a (#1).', 'predates'],
    ['(another change) a', 'another change'],
    ['(too large)', 'too large'],
    ['**(predates)** a', 'predates'],
    ['(predates): a', 'predates'],
    ['(Too Large) a', 'too large'],
    ['*(another change)* a', 'another change'],
  ] as const)('reads the reason %j opens with', (text, reason) => {
    assert.isTrue(deferralReasonOf(text) === reason);
  });

  test.each(['a (predates)', '(round 3) a', '(too large)a'])(
    'reads no reason from %j',
    (text) => {
      assert.isUndefined(deferralReasonOf(text));
    },
  );
});
