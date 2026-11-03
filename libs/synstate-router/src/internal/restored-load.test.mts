import { isRestoredLoad } from './restored-load.mjs';

/** A `performance` whose navigation entry is of `type`. */
const timing = (type: string): unknown =>
  ({
    getEntriesByType: (entryType: string) =>
      entryType === 'navigation' ? ([{ type }] as const) : ([] as const),
  }) as const;

describe(isRestoredLoad, () => {
  test('is true of a reload and of back or forward', () => {
    assert.isTrue(isRestoredLoad(timing('reload')));

    assert.isTrue(isRestoredLoad(timing('back_forward')));
  });

  test('is false of a load by a link or the address bar', () => {
    assert.isFalse(isRestoredLoad(timing('navigate')));
  });

  test('reads no performance, or none with navigation timing, as a plain load', () => {
    assert.isFalse(isRestoredLoad(undefined));

    assert.isFalse(isRestoredLoad({}));

    assert.isFalse(isRestoredLoad({ getEntriesByType: () => [] }));
  });
});
