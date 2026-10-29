import { Answer } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { Result } from 'ts-data-forge';
import { createAnswersStore, type AnswersFetcher } from './answers.mjs';

describe(createAnswersStore, () => {
  test('reads the answers to the event the page shows once started', async () => {
    const { store, reads } = setup('abc');

    assert.deepStrictEqual(reads, []);

    store.start();

    assert.deepStrictEqual(reads, ['abc']);

    await settle(0);

    assert.deepStrictEqual(store.answers$.getSnapshot().value, answers);
  });

  test('drops a request made within the throttle of the last', async () => {
    const { store, reads } = setup('abc');

    store.start();

    store.fetchAnswers();

    assert.deepStrictEqual(reads, ['abc']);

    await settle(throttleMs * 5);

    store.fetchAnswers();

    assert.deepStrictEqual(reads, ['abc', 'abc']);
  });

  test('reads again after a write, throttle or not, and for the next event', () => {
    const { store, reads, setEventId } = setup('abc');

    store.start();

    store.refetchAnswersAfterWrite();

    setEventId('def');

    assert.deepStrictEqual(reads, ['abc', 'abc', 'def']);
  });

  test('the refresh button reads the event too, and is loading until the answers come back', async () => {
    const { store, reads, eventScheduleReads } = setup('abc');

    store.start();

    await settle(throttleMs * 5);

    store.refreshAnswers();

    assert.strictEqual(eventScheduleReads(), 1);

    assert.deepStrictEqual(reads, ['abc', 'abc']);

    assert.isTrue(store.refreshButtonIsLoading$.getSnapshot().value);

    await settle(0);

    assert.isFalse(store.refreshButtonIsLoading$.getSnapshot().value);
  });

  test('the refresh button is disabled for the throttle after each read it asks for', async () => {
    const { store } = setup('abc');

    store.start();

    assert.isTrue(store.refreshButtonIsDisabled$.getSnapshot().value);

    await settle(throttleMs * 5);

    assert.isFalse(store.refreshButtonIsDisabled$.getSnapshot().value);
  });

  test('stop ends the reading', () => {
    const { store, reads, setEventId } = setup('abc');

    const stopAnswers = store.start();

    stopAnswers();

    setEventId('def');

    assert.deepStrictEqual(reads, ['abc']);
  });
});

const throttleMs = 20;

const answers: readonly Answer[] = [Answer.fill({ id: 'a1' })] as const;

type Setup = Readonly<{
  store: AnswersFetcher;
  reads: readonly string[];
  eventScheduleReads: () => number;
  setEventId: (eventId: string | undefined) => void;
}>;

const setup = (initialEventId: string | undefined): Setup => {
  const [eventId$, setEventId] = createState<string | undefined>(
    initialEventId,
  );

  const mut_reads: string[] = [];

  const mut_eventSchedule = { reads: 0 };

  const store = createAnswersStore({
    fetchAnswers: (eventId) => {
      mut_reads.push(eventId);

      return Promise.resolve(Result.ok(answers));
    },
    eventId$,
    fetchEventSchedule: () => {
      mut_eventSchedule.reads += 1;
    },
    throttleMs,
  });

  return {
    store,
    reads: mut_reads,
    eventScheduleReads: () => mut_eventSchedule.reads,
    setEventId,
  } as const;
};

const settle = async (ms: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};
