// Example: src/guard/is-record.mts (isRecord)
import { isRecord } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const entries: readonly unknown[] = [{ id: 1 }, 'str', 0, null] as const;

    const records = entries.filter(isRecord);

    assert.deepStrictEqual(records, [{ id: 1 }]);

    // embed-sample-code-ignore-below
  });
}
