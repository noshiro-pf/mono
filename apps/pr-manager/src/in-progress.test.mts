import { isInProgressShown } from './in-progress.mjs';

describe(isInProgressShown, () => {
  test('by default, what is in progress and what is not are both shown', () => {
    const filter = { hideInProgress: false, onlyInProgress: false } as const;

    assert.isTrue(isInProgressShown(true, filter));

    assert.isTrue(isInProgressShown(false, filter));
  });

  test('switched off, what is in progress is hidden; picked, what is not is', () => {
    assert.isFalse(
      isInProgressShown(true, { hideInProgress: true, onlyInProgress: false }),
    );

    assert.isTrue(
      isInProgressShown(false, { hideInProgress: true, onlyInProgress: false }),
    );

    assert.isTrue(
      isInProgressShown(true, { hideInProgress: false, onlyInProgress: true }),
    );

    assert.isFalse(
      isInProgressShown(false, { hideInProgress: false, onlyInProgress: true }),
    );
  });
});
