import { EventSchedule } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { Optional, Result } from 'ts-data-forge';
import type { Api } from '../../api/index.mjs';
import {
  createEventScheduleStore,
  type EventScheduleFetcher,
} from './event-schedule.mjs';

describe(createEventScheduleStore, () => {
  test('reads the event the page shows once started', async () => {
    const { store, reads } = setup('abc');

    assert.deepStrictEqual(reads, []);

    store.start();

    assert.deepStrictEqual(reads, ['abc']);

    await settle(0);

    assert.deepStrictEqual(
      Optional.unwrap(store.eventSchedule$.getSnapshot()),
      eventFixture,
    );
  });

  test('reads nothing while the page names no event', () => {
    const { store, reads } = setup(undefined);

    store.start();

    store.fetchEventSchedule();

    assert.deepStrictEqual(reads, []);
  });

  test('drops a request made within the throttle of the last, such as the one the page makes as it mounts', async () => {
    const { store, reads } = setup('abc');

    store.start();

    store.fetchEventSchedule();

    assert.deepStrictEqual(reads, ['abc']);

    await settle(throttleMs * 5);

    store.fetchEventSchedule();

    assert.deepStrictEqual(reads, ['abc', 'abc']);
  });

  test('reads again after a write, throttle or not', () => {
    const { store, reads } = setup('abc');

    store.start();

    store.refetchEventScheduleAfterWrite();

    assert.deepStrictEqual(reads, ['abc', 'abc']);
  });

  test('reads the next event when the page moves to it', () => {
    const { store, reads, setEventId } = setup('abc');

    store.start();

    setEventId('def');

    assert.deepStrictEqual(reads, ['abc', 'def']);
  });

  test('keeps a failed read as the result, with no event, and logs it', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const { store } = setup('abc', () =>
      Promise.resolve(Result.err({ type: 'not-found', message: '' } as const)),
    );

    store.start();

    await settle(0);

    const errorsLogged = consoleError.mock.calls.length;

    consoleError.mockRestore();

    assert.strictEqual(errorsLogged, 1);

    const result = Optional.unwrap(store.result$.getSnapshot());

    assert.isDefined(result);

    assert.isTrue(Result.isErr(result));

    assert.isUndefined(Optional.unwrap(store.eventSchedule$.getSnapshot()));
  });

  test('drops a read still out when the store stops', async () => {
    const { store } = setup('abc');

    const stopEventSchedule = store.start();

    stopEventSchedule();

    await settle(0);

    assert.isUndefined(Optional.unwrap(store.result$.getSnapshot()));
  });

  test('a read that comes back after a later one does not replace it', async () => {
    const { answer, resolve } = deferredReads();

    const { store, setEventId } = setup('A', answer);

    store.start();

    setEventId('B');

    resolve('B');

    await settle(0);

    assert.strictEqual(titleOf(store), 'event B');

    resolve('A');

    await settle(0);

    assert.strictEqual(titleOf(store), 'event B');
  });

  test('has no event from the moment the page moves to another until its read comes back', async () => {
    const { answer, resolve } = deferredReads();

    const { store, setEventId } = setup('A', answer);

    store.start();

    resolve('A');

    await settle(0);

    assert.strictEqual(titleOf(store), 'event A');

    setEventId('C');

    assert.isUndefined(Optional.unwrap(store.result$.getSnapshot()));

    assert.isUndefined(Optional.unwrap(store.eventSchedule$.getSnapshot()));

    resolve('C');

    await settle(0);

    assert.strictEqual(titleOf(store), 'event C');
  });

  test('has no event while the page names none', async () => {
    const { answer, resolve } = deferredReads();

    const { store, setEventId } = setup('A', answer);

    store.start();

    resolve('A');

    await settle(0);

    setEventId(undefined);

    assert.isUndefined(Optional.unwrap(store.result$.getSnapshot()));

    assert.isUndefined(Optional.unwrap(store.eventSchedule$.getSnapshot()));
  });

  test('stop ends the reading', () => {
    const { store, reads, setEventId } = setup('abc');

    const stopEventSchedule = store.start();

    stopEventSchedule();

    setEventId('def');

    store.refetchEventScheduleAfterWrite();

    assert.deepStrictEqual(reads, ['abc']);
  });
});

const throttleMs = 20;

const eventFixture: EventSchedule = EventSchedule.fill({ title: 'event' });

type Setup = Readonly<{
  store: EventScheduleFetcher;
  reads: readonly string[];
  setEventId: (eventId: string | undefined) => void;
}>;

const setup = (
  initialEventId: string | undefined,
  answer: Api['event']['fetch'] = () =>
    Promise.resolve(Result.ok(eventFixture)),
): Setup => {
  const [eventId$, setEventId] = createState<string | undefined>(
    initialEventId,
  );

  const mut_reads: string[] = [];

  const store = createEventScheduleStore({
    fetchEventSchedule: (eventId) => {
      mut_reads.push(eventId);

      return answer(eventId);
    },
    eventId$,
    throttleMs,
  });

  return { store, reads: mut_reads, setEventId } as const;
};

const titleOf = (store: EventScheduleFetcher): string | undefined =>
  Optional.unwrap(store.eventSchedule$.getSnapshot())?.title;

/**
 * Reads the test answers by hand, each with an event titled after the id it was
 * for, in whatever order the test resolves them.
 */
const deferredReads = (): Readonly<{
  answer: Api['event']['fetch'];
  resolve: (eventId: string) => void;
}> => {
  const mut_pending = new Map<string, () => void>();

  return {
    answer: async (eventId) =>
      new Promise((resolve) => {
        mut_pending.set(eventId, () => {
          resolve(Result.ok(EventSchedule.fill({ title: `event ${eventId}` })));
        });
      }),
    resolve: (eventId) => {
      mut_pending.get(eventId)?.();

      mut_pending.delete(eventId);
    },
  };
};

const settle = async (ms: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};
