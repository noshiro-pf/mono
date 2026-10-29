import type { Label } from 'pr-report-core';
import { isPending, isPendingShown } from './pending.mjs';

describe(isPending, () => {
  test('reads the pending label, and nothing like it', () => {
    assert.isTrue(isPending([label('bug'), label('pending')]));

    assert.isFalse(isPending([label('Pending'), label('pending-review')]));

    assert.isFalse(isPending([]));
  });
});

describe(isPendingShown, () => {
  test('by default, what is pending and what is not are both shown', () => {
    const filter = { hidePending: false, onlyPending: false } as const;

    assert.isTrue(isPendingShown(true, filter));

    assert.isTrue(isPendingShown(false, filter));
  });

  test('switched off, what is pending is hidden; picked, what is not is', () => {
    assert.isFalse(
      isPendingShown(true, { hidePending: true, onlyPending: false }),
    );

    assert.isTrue(
      isPendingShown(false, { hidePending: true, onlyPending: false }),
    );

    assert.isTrue(
      isPendingShown(true, { hidePending: false, onlyPending: true }),
    );

    assert.isFalse(
      isPendingShown(false, { hidePending: false, onlyPending: true }),
    );
  });
});

const label = (labelName: string): Label =>
  ({ name: labelName, color: 'ededed', description: '' }) as const;
