import type { Label } from 'pr-report-core';
import { isPending } from './pending.mjs';

describe(isPending, () => {
  test('reads the pending label, and nothing like it', () => {
    assert.isTrue(isPending([label('bug'), label('pending')]));

    assert.isFalse(isPending([label('Pending'), label('pending-review')]));

    assert.isFalse(isPending([]));
  });
});

const label = (labelName: string): Label =>
  ({ name: labelName, color: 'ededed', description: '' }) as const;
