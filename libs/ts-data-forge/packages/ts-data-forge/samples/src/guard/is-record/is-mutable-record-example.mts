/* eslint-disable vitest/expect-expect */
// Example: src/guard/is-record.mts (isMutableRecord)
import { isMutableRecord } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const obj: unknown = { foo: 1 } as const;

    if (isMutableRecord(obj)) {
      obj['bar'] = 2; // Safe: obj is now known to be a mutable record
    }

    // embed-sample-code-ignore-below
  });
}
