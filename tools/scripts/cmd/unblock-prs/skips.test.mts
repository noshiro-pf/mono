import { newSkips, withSkip } from './skips.mjs';
import { type SkipRecord, type SkipRecords } from './types.mjs';

describe(newSkips, () => {
  const none: SkipRecords = new Map();

  test('reports a pull request set aside for the first time', () => {
    assert.deepStrictEqual(newSkips(none, withSkip(none, skip())), [skip()]);
  });

  test('does not report a record that is still standing', () => {
    const standing = withSkip(none, skip());

    assert.deepStrictEqual(newSkips(standing, standing), []);

    // The detail is prose, and prose that changed is not a new state.
    assert.deepStrictEqual(
      newSkips(standing, withSkip(none, skip({ detail: 'reworded' }))),
      [],
    );
  });

  test('reports it again once the state it was reached in has changed', () => {
    const standing = withSkip(none, skip());

    for (const changed of [
      skip({ headSha: 'pushed' }),
      skip({ baseSha: 'moved' }),
      skip({ reason: 'push-failed' }),
    ]) {
      assert.deepStrictEqual(newSkips(standing, withSkip(none, changed)), [
        changed,
      ]);
    }
  });
});

const skip = (overrides: Partial<SkipRecord> = {}): SkipRecord =>
  ({
    number: 7,
    headSha: 'head',
    baseSha: 'base',
    reason: 'rebase-failed',
    detail: 'rebase conflicts',
    ...overrides,
  }) as const;
