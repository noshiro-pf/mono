import { armsOnPick } from './auto-merge.mjs';
import { type TimelineEvent } from './types.mjs';

const queued: TimelineEvent = { kind: 'queued' } as const;

const disarmedByHand: TimelineEvent = {
  kind: 'auto-merge-disabled',
  manually: true,
} as const;

describe(armsOnPick, () => {
  test('arms a queued pull request nobody has disarmed', () => {
    assert.isTrue(armsOnPick([queued]));
  });

  test('arms one whose timeline no longer reaches back to the label', () => {
    // A long-lived pull request can have more events than are read; the
    // label is on it now, which is what the survey already established.
    assert.isTrue(armsOnPick([]));
  });

  test('does not arm one a person disarmed after queueing it', () => {
    assert.isFalse(armsOnPick([queued, disarmedByHand]));
  });

  test('arms it again once it is queued again', () => {
    // Taking `merge-queued` off and putting it back is how the author says
    // "land it after all".
    assert.isTrue(armsOnPick([queued, disarmedByHand, queued]));
  });

  test('ignores a disarm from before it was queued', () => {
    assert.isTrue(armsOnPick([disarmedByHand, queued]));
  });

  test('ignores a disarm GitHub made on its own', () => {
    // A base change or a push from someone without write access disarms it;
    // neither is the author changing their mind.
    assert.isTrue(
      armsOnPick([queued, { kind: 'auto-merge-disabled', manually: false }]),
    );
  });

  test('reads a disarm with no label event in reach as a person saying no', () => {
    assert.isFalse(armsOnPick([disarmedByHand]));
  });
});
