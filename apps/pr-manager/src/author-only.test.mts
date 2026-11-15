import type { Label } from 'pr-report-core';
import { isAuthorOnly, isAuthorOnlyShown } from './author-only.mjs';

describe(isAuthorOnly, () => {
  test('reads the author-only label', () => {
    assert.isTrue(isAuthorOnly([label('priority:A'), label('author-only')]));

    assert.isFalse(isAuthorOnly([label('priority:A')]));

    assert.isFalse(isAuthorOnly([]));

    // GitHub's label names are case-insensitive, as the resolver reads them.
    assert.isTrue(isAuthorOnly([label('Author-Only')]));
  });
});

describe(isAuthorOnlyShown, () => {
  test('by default, what only the author can do and the rest are both shown', () => {
    const filter = { hideAuthorOnly: false, onlyAuthorOnly: false } as const;

    assert.isTrue(isAuthorOnlyShown(true, filter));

    assert.isTrue(isAuthorOnlyShown(false, filter));
  });

  test('switched off, what only the author can do is hidden; picked, the rest is', () => {
    assert.isFalse(
      isAuthorOnlyShown(true, { hideAuthorOnly: true, onlyAuthorOnly: false }),
    );

    assert.isTrue(
      isAuthorOnlyShown(false, { hideAuthorOnly: true, onlyAuthorOnly: false }),
    );

    assert.isTrue(
      isAuthorOnlyShown(true, { hideAuthorOnly: false, onlyAuthorOnly: true }),
    );

    assert.isFalse(
      isAuthorOnlyShown(false, { hideAuthorOnly: false, onlyAuthorOnly: true }),
    );
  });
});

const label = (name: string): Label =>
  ({ name, color: '', description: '' }) as const;
