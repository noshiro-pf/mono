import { Arr, Optional } from 'ts-data-forge';
import { createState } from '../../utils/index.mjs';
import { switchMap } from '../operators/index.mjs';
import { empty } from './empty.mjs';

describe(empty, () => {
  test('holds no value and is already completed', () => {
    const nothing$ = empty<number>();

    assert.isTrue(nothing$.isCompleted);

    assert.isTrue(Optional.isNone(nothing$.getSnapshot()));
  });

  test('passes nothing on to a subscriber, and completes it at once', () => {
    const nothing$ = empty<number>();

    const mut_seen: number[] = [];

    const mut_completed = { value: false };

    nothing$.subscribe(
      (value) => {
        mut_seen.push(value);
      },
      () => {
        mut_completed.value = true;
      },
    );

    assert.deepStrictEqual(mut_seen, []);

    assert.isTrue(mut_completed.value);
  });

  test('switched to, it passes nothing on, and switchMap goes on', () => {
    const [on$, setOn] = createState(true);

    const [count$, setCount] = createState(0);

    const followed$ = on$.pipe(
      switchMap((isOn) => (isOn ? count$ : empty<number>())),
    );

    const mut_seen: number[] = [];

    followed$.subscribe((value) => {
      mut_seen.push(value);
    });

    setOn(false);

    const seenBefore = Arr.length(mut_seen);

    setCount(1);

    assert.strictEqual(Arr.length(mut_seen), seenBefore);

    setOn(true);

    assert.deepStrictEqual(Arr.last(mut_seen), Optional.some(1));

    assert.isFalse(followed$.isCompleted);
  });
});
