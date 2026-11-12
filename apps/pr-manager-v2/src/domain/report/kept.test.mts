import { Result } from 'ts-data-forge';
import { failed, issue, pull, snapshot } from '../../../test/index.mjs';
import { failuresOf, keptSnapshot } from './kept.mjs';

describe(keptSnapshot, () => {
  test('keeps the last answer of a part that failed', () => {
    const before = snapshot([pull(1)]);

    const after = snapshot([pull(1)], [], {
      merged: failed('the merged pull requests'),
      pullRequests: failed('the open pull requests'),
    });

    const kept = keptSnapshot(before, after);

    assert.deepStrictEqual(kept.pullRequests, before.pullRequests);

    assert.deepStrictEqual(kept.merged, before.merged);
  });

  test('leaves failed a part never read', () => {
    const after = snapshot([], [], { merged: failed('the merged') });

    assert.isTrue(Result.isErr(keptSnapshot(undefined, after).merged));
  });

  test('keeps a head’s checks only while the head is the same', () => {
    const before = snapshot([pull(1), pull(2)]);

    const after = snapshot([
      pull(1, { checks: failed('the checks of #1') }),
      pull(2, { headSha: 'a'.repeat(40), checks: failed('the checks of #2') }),
    ]);

    const kept = Result.unwrapThrow(keptSnapshot(before, after).pullRequests);

    assert.isTrue(Result.isOk(kept[0]?.checks ?? failed('')));

    assert.isTrue(Result.isErr(kept[1]?.checks ?? Result.ok(1)));
  });

  test('keeps a comparison only while the base is the same', () => {
    const before = snapshot([pull(1), pull(2)]);

    const after = snapshot([
      pull(1, { comparison: failed('the comparison of #1') }),
      pull(2, { baseRef: 'main2', comparison: failed('the comparison of #2') }),
    ]);

    const kept = Result.unwrapThrow(keptSnapshot(before, after).pullRequests);

    assert.isTrue(Result.isOk(kept[0]?.comparison ?? failed('')));

    assert.isTrue(Result.isErr(kept[1]?.comparison ?? Result.ok(1)));
  });

  test('keeps an issue’s comments by its number', () => {
    const before = snapshot([], [issue(5)]);

    const after = snapshot(
      [],
      [issue(5, { comments: failed('the comments of #5') })],
    );

    const issues = Result.unwrapThrow(keptSnapshot(before, after).openIssues);

    assert.isTrue(Result.isOk(issues.issues[0]?.comments ?? failed('')));
  });
});

describe(failuresOf, () => {
  test('sorts failures by the block that draws them, skipping what was skipped', () => {
    const failures = failuresOf(
      snapshot([pull(1, { checks: failed('the checks of #1') })], [], {
        merged: failed('the merged pull requests'),
        references: Result.err({
          kind: 'skipped',
          what: 'the references',
          message: 'not offered',
        }),
      }),
    );

    assert.deepStrictEqual(
      failures.report.map(({ what }) => what),
      ['the checks of #1'],
    );

    assert.deepStrictEqual(
      failures.merged.map(({ what }) => what),
      ['the merged pull requests'],
    );

    assert.deepStrictEqual(failures.issues, []);
  });
});
