import { Arr } from 'ts-data-forge';
import {
  FRAME_BUDGET_AVERAGE_MS,
  FRAME_BUDGET_FRAMES_BEFORE_AVERAGE,
  FRAME_BUDGET_SINGLE_MS,
  isOverFrameBudget,
  recordFrame,
  startFrameBudget,
  type FrameBudget,
} from './frame-budget.mjs';

/** The budget after frames at each of `times`, started at 0. */
const after = (times: readonly number[]): FrameBudget =>
  times.reduce(recordFrame, startFrameBudget(0));

/** Frames `interval` apart after a first one at `first`. */
const steady = (
  first: number,
  interval: number,
  count: number,
): readonly number[] =>
  Array.from({ length: count }, (_, index) => first + index * interval);

describe('the frame budget', () => {
  test('is the thresholds of about 30 fps', () => {
    assert.strictEqual(FRAME_BUDGET_AVERAGE_MS, 34);

    assert.strictEqual(FRAME_BUDGET_SINGLE_MS, 100);

    assert.strictEqual(FRAME_BUDGET_FRAMES_BEFORE_AVERAGE, 3);
  });

  test('is kept at 60 fps', () => {
    assert.isFalse(isOverFrameBudget(after(steady(16, 16.7, 40))));
  });

  test('is kept at a steady 30 fps', () => {
    assert.isFalse(isOverFrameBudget(after(steady(33, 33, 20))));
  });

  test('ignores a slow first frame, which includes the setup', () => {
    assert.isFalse(isOverFrameBudget(after([400])));

    assert.isFalse(isOverFrameBudget(after(steady(400, 16, 10))));
  });

  test('is exceeded by frames slower than about 30 fps on average', () => {
    assert.isTrue(isOverFrameBudget(after(steady(16, 40, 3))));
  });

  test('does not judge the average before the third frame', () => {
    // One interval counted, slow but under the single-frame limit.
    assert.isFalse(isOverFrameBudget(after([16, 16 + 60])));

    assert.isTrue(isOverFrameBudget(after([16, 16 + 60, 16 + 120])));
  });

  test('allows a slower frame among fast ones', () => {
    assert.isFalse(
      isOverFrameBudget(after([16, 32, 48, 64, 80, 96, 150, 166, 182, 198])),
    );
  });

  test('is exceeded by any single frame over the limit, at once', () => {
    assert.isTrue(isOverFrameBudget(after([16, 16 + 101])));

    assert.isTrue(
      isOverFrameBudget(
        after(Arr.toPushed(steady(16, 16, 20), 16 + 19 * 16 + 120)),
      ),
    );

    assert.isFalse(isOverFrameBudget(after([16, 16 + 100])));
  });
});
