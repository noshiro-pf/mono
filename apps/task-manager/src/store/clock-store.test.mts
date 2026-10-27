import { createState, source } from 'synstate';
import {
  asMilestoneId,
  createMilestone,
  type DomainState,
} from '../domain/index.mjs';
import { createClockStore, type ClockStore } from './clock-store.mjs';

describe(createClockStore, () => {
  test('ticks when the next change is due, and not before', () => {
    const { store, clock } = setup(withDateAt(6000));

    clock.advance(4999);

    assert.strictEqual(store.now.getSnapshot().value, 1000);

    clock.advance(1);

    assert.strictEqual(store.now.getSnapshot().value, 6000);
  });

  test('ticks at least every maxDelayMs', () => {
    const { store, clock } = setup(withDateAt(1_000_000));

    clock.advance(60_000);

    assert.strictEqual(store.now.getSnapshot().value, 61_000);

    clock.advance(60_000);

    assert.strictEqual(store.now.getSnapshot().value, 121_000);
  });

  test('reads the clock again when the state changes', () => {
    const { store, clock, setState } = setup(withDateAt(1_000_000));

    clock.jump(3000);

    setState(withDateAt(5000));

    assert.strictEqual(store.now.getSnapshot().value, 3000);

    clock.advance(2000);

    assert.strictEqual(store.now.getSnapshot().value, 5000);
  });

  test('reads the clock again when the page wakes', () => {
    const { store, clock, wake } = setup(withDateAt(1_000_000));

    clock.jump(40_000);

    wake.next(undefined);

    assert.strictEqual(store.now.getSnapshot().value, 40_000);
  });

  test('keeps one timer at a time, and none once stopped', () => {
    const { clock, setState, stopClock } = setup(withDateAt(6000));

    setState(withDateAt(7000));

    assert.strictEqual(clock.pending(), 1);

    stopClock();

    assert.strictEqual(clock.pending(), 0);
  });
});

const withDateAt = (date: number): DomainState =>
  ({
    tasks: [],
    milestones: [
      createMilestone({ id: asMilestoneId('m'), title: 'M', now: 0, date }),
    ],
  }) as const;

/**
 * A clock and timers that move only when told to: `advance` runs the timers
 * that come due on the way, `jump` moves the time without running any.
 */
const createFakeClock = (): FakeClock => {
  let mut_now = 1000;

  let mut_nextId = 0;

  const mut_timers = new Map<number, { at: number; callback: () => void }>();

  return {
    now: () => mut_now,
    setTimer: (callback: () => void, delayMs: number): number => {
      mut_nextId += 1;

      mut_timers.set(mut_nextId, { at: mut_now + delayMs, callback });

      return mut_nextId;
    },
    clearTimer: (id: number): void => {
      mut_timers.delete(id);
    },
    advance: (ms: number): void => {
      const until = mut_now + ms;

      for (;;) {
        const due = Array.from(mut_timers)
          .filter(([, { at }]) => at <= until)
          .toSorted(([, x], [, y]) => x.at - y.at)[0];

        if (due === undefined) {
          break;
        }

        const [id, { at: dueAt, callback }] = due;

        mut_timers.delete(id);

        mut_now = dueAt;

        callback();
      }

      mut_now = until;
    },
    jump: (to: number): void => {
      mut_now = to;
    },
    pending: (): number => mut_timers.size,
  };
};

type FakeClock = Readonly<{
  now: () => number;
  setTimer: (callback: () => void, delayMs: number) => number;
  clearTimer: (id: number) => void;
  advance: (ms: number) => void;
  jump: (to: number) => void;
  pending: () => number;
}>;

const setup = (
  initial: DomainState,
): Readonly<{
  store: ClockStore;
  clock: FakeClock;
  setState: (next: DomainState) => void;
  wake: ReturnType<typeof source<undefined>>;
  stopClock: () => void;
}> => {
  const [state, setState] = createState(initial);

  const wake = source<undefined>();

  const clock = createFakeClock();

  const store = createClockStore({
    state,
    now: clock.now,
    maxDelayMs: 60_000,
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer,
    wake,
  });

  const stopClock = store.start();

  return {
    store,
    clock,
    setState: (next) => {
      setState(next);
    },
    wake,
    stopClock,
  };
};
