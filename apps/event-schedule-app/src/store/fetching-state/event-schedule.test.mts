import { EventSchedule } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { Result } from 'ts-data-forge';
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
      store.eventSchedule$.getSnapshot().value,
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

    const result = store.result$.getSnapshot().value;

    assert.isDefined(result);

    assert.isTrue(Result.isErr(result));

    assert.isUndefined(store.eventSchedule$.getSnapshot().value);
  });

  test('drops a read still out when the store stops', async () => {
    const { store } = setup('abc');

    const stopEventSchedule = store.start();

    stopEventSchedule();

    await settle(0);

    assert.isUndefined(store.result$.getSnapshot().value);
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

const settle = async (ms: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};
