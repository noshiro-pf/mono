import { Answer } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { Optional, Result } from 'ts-data-forge';
import type { Api } from '../../api/index.mjs';
import { createAnswersStore, type AnswersFetcher } from './answers.mjs';

describe(createAnswersStore, () => {
  test('reads the answers to the event the page shows once started', async () => {
    const { store, reads } = setup('abc');

    assert.deepStrictEqual(reads, []);

    store.start();

    assert.deepStrictEqual(reads, ['abc']);

    await settle(0);

    assert.deepStrictEqual(
      Optional.unwrap(store.answers$.getSnapshot()),
      answers,
    );
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

    assert.isTrue(Optional.unwrap(store.refreshButtonIsLoading$.getSnapshot()));

    await settle(0);

    assert.isFalse(
      Optional.unwrap(store.refreshButtonIsLoading$.getSnapshot()),
    );
  });

  test('the refresh button is disabled for the throttle after each read it asks for', async () => {
    const { store } = setup('abc');

    store.start();

    assert.isTrue(
      Optional.unwrap(store.refreshButtonIsDisabled$.getSnapshot()),
    );

    await settle(throttleMs * 5);

    assert.isFalse(
      Optional.unwrap(store.refreshButtonIsDisabled$.getSnapshot()),
    );
  });

  test('an answer that comes back after a later one does not replace it', async () => {
    const { answer, resolve } = deferredReads();

    const { store, setEventId } = setup('A', answer);

    store.start();

    setEventId('B');

    resolve('B');

    await settle(0);

    assert.deepStrictEqual(idsOf(store), ['B']);

    resolve('A');

    await settle(0);

    assert.deepStrictEqual(idsOf(store), ['B']);
  });

  test('has no answers from the moment the page moves to another event until its read comes back', async () => {
    const { answer, resolve } = deferredReads();

    const { store, setEventId } = setup('A', answer);

    store.start();

    resolve('A');

    await settle(0);

    assert.deepStrictEqual(idsOf(store), ['A']);

    setEventId('C');

    assert.isUndefined(Optional.unwrap(store.result$.getSnapshot()));

    assert.isUndefined(idsOf(store));

    resolve('C');

    await settle(0);

    assert.deepStrictEqual(idsOf(store), ['C']);
  });

  test('has no answers while the page names no event', async () => {
    const { answer, resolve } = deferredReads();

    const { store, setEventId } = setup('A', answer);

    store.start();

    resolve('A');

    await settle(0);

    setEventId(undefined);

    assert.isUndefined(Optional.unwrap(store.result$.getSnapshot()));

    assert.isUndefined(idsOf(store));
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

const setup = (
  initialEventId: string | undefined,
  answer: Api['answers']['fetchList'] = () =>
    Promise.resolve(Result.ok(answers)),
): Setup => {
  const [eventId$, setEventId] = createState<string | undefined>(
    initialEventId,
  );

  const mut_reads: string[] = [];

  const mut_eventSchedule = { reads: 0 };

  const store = createAnswersStore({
    fetchAnswers: (eventId) => {
      mut_reads.push(eventId);

      return answer(eventId);
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

const idsOf = (store: AnswersFetcher): readonly string[] | undefined =>
  Optional.unwrap(store.answers$.getSnapshot())?.map(({ id }) => id);

/**
 * Reads the test answers by hand, each with one answer whose id is the event's,
 * in whatever order the test resolves them.
 */
const deferredReads = (): Readonly<{
  answer: Api['answers']['fetchList'];
  resolve: (eventId: string) => void;
}> => {
  const mut_pending = new Map<string, () => void>();

  return {
    answer: async (eventId) =>
      new Promise((resolve) => {
        mut_pending.set(eventId, () => {
          resolve(Result.ok([Answer.fill({ id: eventId })]));
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
