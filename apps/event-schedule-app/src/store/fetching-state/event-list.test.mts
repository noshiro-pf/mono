import { EventListItem } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { Optional, Result, unknownToString } from 'ts-data-forge';
import { createEventListFilterStore } from '../event-list-page-state/index.mjs';
import {
  createEventListStore,
  type EventListFetcher,
  type EventListRequest,
} from './event-list.mjs';

describe(createEventListStore, () => {
  test('reads nothing, and has no list, while nobody is signed in', async () => {
    const { store, reads } = setup();

    store.start();

    await settle(0);

    assert.deepStrictEqual(reads, []);

    assert.isUndefined(Optional.unwrap(store.eventList$.getSnapshot()));
  });

  test('reads the signed-in user’s list with the filters', async () => {
    const { store, reads, signIn } = setup();

    store.start();

    signIn('alice');

    assert.deepStrictEqual(reads, [
      {
        filterText: '',
        filterOptionState: 'inProgress',
        showAllPastDaysEvent: false,
        showOnlyEventSchedulesICreated: false,
      },
    ]);

    await settle(0);

    assert.deepStrictEqual(Optional.unwrap(store.eventList$.getSnapshot()), []);
  });

  test('reads again when a filter changes, and on each press of the filter button', () => {
    const { store, reads, signIn, filter } = setup();

    store.start();

    signIn('alice');

    filter.setFilterOptionState('archive');

    filter.setFilterText('party');

    // Typing alone reads nothing; the button does, every time.
    assert.strictEqual(reads.length, 2);

    filter.filterByText();

    filter.filterByText();

    assert.deepStrictEqual(
      reads.map((r) => [r.filterText, r.filterOptionState]),
      [
        ['', 'inProgress'],
        ['', 'archive'],
        ['party', 'archive'],
        ['party', 'archive'],
      ],
    );
  });

  test('keeps the filters the list was read with', async () => {
    const { store, signIn, filter, answer } = setup({ answerByHand: true });

    store.start();

    assert.isUndefined(Optional.unwrap(store.listedWith$.getSnapshot()));

    signIn('alice');

    // Out, but not yet answered.
    assert.isUndefined(Optional.unwrap(store.listedWith$.getSnapshot()));

    answer(0, []);

    await settle(0);

    assert.strictEqual(
      Optional.unwrap(store.listedWith$.getSnapshot())?.showAllPastDaysEvent,
      false,
    );

    // Changed, but not yet answered: the list on hand is still the first one's.
    filter.setShowAllPastDaysEvent(true);

    assert.strictEqual(
      Optional.unwrap(store.listedWith$.getSnapshot())?.showAllPastDaysEvent,
      false,
    );

    answer(1, []);

    await settle(0);

    assert.deepStrictEqual(Optional.unwrap(store.listedWith$.getSnapshot()), {
      filterText: '',
      filterOptionState: 'inProgress',
      showAllPastDaysEvent: true,
      showOnlyEventSchedulesICreated: false,
    });
  });

  test('on a read that fails: no list, no read loading, and the last list’s filters kept', async () => {
    const { store, signIn, filter, answer } = setup({ answerByHand: true });

    store.start();

    signIn('alice');

    answer(0, []);

    await settle(0);

    filter.setShowAllPastDaysEvent(true);

    assert.isTrue(Optional.unwrap(store.refreshButtonIsLoading$.getSnapshot()));

    answer(1, 'failed');

    await settle(0);

    // Taken: the list is gone, and the read no longer loading.
    assert.isUndefined(Optional.unwrap(store.eventList$.getSnapshot()));

    assert.isFalse(
      Optional.unwrap(store.refreshButtonIsLoading$.getSnapshot()),
    );

    assert.strictEqual(
      Optional.unwrap(store.listedWith$.getSnapshot())?.showAllPastDaysEvent,
      false,
    );
  });

  test('says a read failed until one is answered, and lets the page read again', async () => {
    const { store, signIn, answer, reads } = setup({
      answerByHand: true,
      throttleMs: 0,
    });

    store.start();

    signIn('alice');

    assert.isFalse(Optional.unwrap(store.readFailed$.getSnapshot()));

    answer(0, 'failed');

    await settle(0);

    assert.isTrue(Optional.unwrap(store.readFailed$.getSnapshot()));

    store.refreshEventList();

    assert.strictEqual(reads.length, 2);

    answer(1, [eventListItem]);

    await settle(0);

    assert.isFalse(Optional.unwrap(store.readFailed$.getSnapshot()));

    assert.deepStrictEqual(Optional.unwrap(store.eventList$.getSnapshot()), [
      eventListItem,
    ]);
  });

  test('a throw while an answer is taken is logged, and counts as a failed read with none loading', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const { store, signIn, answer } = setup({ answerByHand: true });

    store.start();

    signIn('alice');

    const subscription = store.eventList$.subscribe((list) => {
      if (list?.length === 1) {
        throw new Error('A subscriber failed.');
      }
    });

    answer(0, [eventListItem]);

    await settle(0);

    subscription.unsubscribe();

    const logged = consoleError.mock.calls
      .flat()
      .some((arg) => unknownToString(arg).includes('A subscriber failed.'));

    consoleError.mockRestore();

    assert.isTrue(logged);

    assert.isFalse(
      Optional.unwrap(store.refreshButtonIsLoading$.getSnapshot()),
    );

    assert.isTrue(Optional.unwrap(store.readFailed$.getSnapshot()));
  });

  test('has no read loading once the store stops with a read out', () => {
    const { store, signIn } = setup({ answerByHand: true });

    const stop = store.start();

    signIn('alice');

    assert.isTrue(Optional.unwrap(store.refreshButtonIsLoading$.getSnapshot()));

    stop();

    assert.isFalse(
      Optional.unwrap(store.refreshButtonIsLoading$.getSnapshot()),
    );
  });

  test('drops the answer to a read a later read has overtaken', async () => {
    const { store, signIn, filter, answer } = setup({ answerByHand: true });

    store.start();

    signIn('alice');

    filter.setShowAllPastDaysEvent(true);

    // The later read is answered first, then the earlier one.
    answer(1, [eventListItem]);

    answer(0, []);

    await settle(0);

    assert.deepStrictEqual(Optional.unwrap(store.eventList$.getSnapshot()), [
      eventListItem,
    ]);

    assert.strictEqual(
      Optional.unwrap(store.listedWith$.getSnapshot())?.showAllPastDaysEvent,
      true,
    );
  });

  test('has no list, nor filters, nor a read loading, once the user signs out', async () => {
    const { store, signIn, signOut, filter, answer } = setup({
      answerByHand: true,
    });

    store.start();

    signIn('alice');

    answer(0, [eventListItem]);

    await settle(0);

    assert.isDefined(Optional.unwrap(store.listedWith$.getSnapshot()));

    // A read goes out, and the user signs out before it is answered.
    filter.setShowAllPastDaysEvent(true);

    assert.isTrue(Optional.unwrap(store.refreshButtonIsLoading$.getSnapshot()));

    signOut();

    assert.isUndefined(Optional.unwrap(store.eventList$.getSnapshot()));

    assert.isUndefined(Optional.unwrap(store.listedWith$.getSnapshot()));

    assert.isFalse(
      Optional.unwrap(store.refreshButtonIsLoading$.getSnapshot()),
    );
  });

  test('drops the answer to a read still out when the user signs out', async () => {
    const { store, signIn, signOut, answer } = setup({ answerByHand: true });

    store.start();

    signIn('alice');

    signOut();

    answer(0, [eventListItem]);

    await settle(0);

    assert.isUndefined(Optional.unwrap(store.eventList$.getSnapshot()));

    assert.isUndefined(Optional.unwrap(store.listedWith$.getSnapshot()));
  });

  test('shows a refresh loading only while the read it starts is out', async () => {
    // A throttle far longer than the steps below take.
    const { store, reads, signIn } = setup({ throttleMs: 200 });

    store.start();

    // Nobody signed in, past the throttle of the first read: no read goes out.
    await settle(250);

    store.refreshEventList();

    assert.isFalse(
      Optional.unwrap(store.refreshButtonIsLoading$.getSnapshot()),
    );

    signIn('alice');

    await settle(250);

    assert.strictEqual(reads.length, 1);

    store.refreshEventList();

    assert.strictEqual(reads.length, 2);

    assert.isTrue(Optional.unwrap(store.refreshButtonIsLoading$.getSnapshot()));

    await settle(0);

    assert.isFalse(
      Optional.unwrap(store.refreshButtonIsLoading$.getSnapshot()),
    );

    // Within the throttle of the last: no read goes out, then or later.
    store.refreshEventList();

    assert.isFalse(
      Optional.unwrap(store.refreshButtonIsLoading$.getSnapshot()),
    );

    await settle(250);

    assert.strictEqual(reads.length, 2);
  });

  test('stop ends the reading', () => {
    const { store, reads, signIn } = setup();

    const stopEventList = store.start();

    stopEventList();

    signIn('alice');

    assert.deepStrictEqual(reads, []);
  });
});

type Setup = Readonly<{
  store: EventListFetcher;
  reads: readonly EventListRequest[];
  signIn: (uid: string) => void;
  signOut: () => void;
  filter: ReturnType<typeof createEventListFilterStore>;
  /**
   * Answers the `nth` read with `list`, or as failed, where reads are answered
   * by hand.
   */
  answer: (nth: number, list: readonly EventListItem[] | 'failed') => void;
}>;

/** One event, told apart from an empty list by being there. */
const eventListItem = EventListItem.defaultValue;

/**
 * A store reading through a stub that answers each read with an empty list at
 * once, or, with `answerByHand`, when `answer` is called for it.
 */
const setup = ({
  answerByHand = false,
  throttleMs = 20,
}: Readonly<{ answerByHand?: boolean; throttleMs?: number }> = {}): Setup => {
  const [fireAuthUser$, setFireAuthUser] = createState<
    Readonly<{ uid: string }> | undefined
  >(undefined);

  const filter = createEventListFilterStore();

  const mut_reads: EventListRequest[] = [];

  const mut_answers: ((list: readonly EventListItem[] | 'failed') => void)[] =
    [];

  const store = createEventListStore({
    fetchEventList: async (request) => {
      mut_reads.push(request);

      if (!answerByHand) {
        return Result.ok<readonly EventListItem[]>([]);
      }

      return new Promise((resolve) => {
        mut_answers.push((list) => {
          resolve(
            list === 'failed'
              ? Result.err({ type: 'others', message: 'The read failed.' })
              : Result.ok(list),
          );
        });
      });
    },
    fireAuthUser$,
    filter,
    throttleMs,
  });

  return {
    store,
    reads: mut_reads,
    signIn: (uid) => {
      setFireAuthUser({ uid });
    },
    signOut: () => {
      setFireAuthUser(undefined);
    },
    filter,
    answer: (nth, list) => {
      const answerRead = mut_answers[nth];

      if (answerRead === undefined) {
        throw new Error(`No read ${nth.toString()} went out to answer.`);
      }

      answerRead(list);
    },
  } as const;
};

const settle = async (ms: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};
