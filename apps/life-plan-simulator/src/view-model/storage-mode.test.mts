import { isMemoryStorageRequested } from './storage-mode.mjs';

describe(isMemoryStorageRequested, () => {
  test('is asked for with ?storage=memory', () => {
    assert.isTrue(isMemoryStorageRequested('?storage=memory'));

    assert.isTrue(isMemoryStorageRequested('?tab=salary&storage=memory'));
  });

  test('is not asked for otherwise', () => {
    assert.isFalse(isMemoryStorageRequested(''));

    assert.isFalse(isMemoryStorageRequested('?storage=firestore'));

    assert.isFalse(isMemoryStorageRequested('?storage=Memory'));
  });
});
