import { describeUnreadableChecks } from './checks-unreadable.mjs';

describe(describeUnreadableChecks, () => {
  test('is nothing when every read succeeded', () => {
    assert.isUndefined(describeUnreadableChecks([]));
  });

  test('names each pull request and what failed', () => {
    const described = describeUnreadableChecks([
      { number: 12, error: 'check runs: HTTP 502' },
      { number: 34, error: 'it has more than 1000 check runs' },
    ]);

    assert.isDefined(described);

    assert.include(described, '#12: check runs: HTTP 502');

    assert.include(described, '#34: it has more than 1000 check runs');

    // What the report would have shown in its place.
    assert.include(described, 'missing');
  });
});
