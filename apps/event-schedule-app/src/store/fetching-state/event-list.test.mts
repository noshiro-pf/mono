import type { EventListItem } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { Result } from 'ts-data-forge';
import { createEventListFilterStore } from '../event-list-page-state/index.mjs';
import { createEventListStore, type EventListFetcher } from './event-list.mjs';

describe(createEventListStore, () => {
  test('reads nothing, and has no list, while nobody is signed in', async () => {
    const { store, reads } = setup();

    store.start();

    await settle(0);

    assert.deepStrictEqual(reads, []);

    assert.isUndefined(store.eventList$.getSnapshot().value);
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

    assert.deepStrictEqual(store.eventList$.getSnapshot().value, []);
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

  test('stop ends the reading', () => {
    const { store, reads, signIn } = setup();

    const stopEventList = store.start();

    stopEventList();

    signIn('alice');

    assert.deepStrictEqual(reads, []);
  });
});

type Read = Parameters<
  Parameters<typeof createEventListStore>[0]['fetchEventList']
>[0];

type Setup = Readonly<{
  store: EventListFetcher;
  reads: readonly Read[];
  signIn: (uid: string) => void;
  filter: ReturnType<typeof createEventListFilterStore>;
}>;

const setup = (): Setup => {
  const [fireAuthUser$, setFireAuthUser] = createState<
    Readonly<{ uid: string }> | undefined
  >(undefined);

  const filter = createEventListFilterStore();

  const mut_reads: Read[] = [];

  const store = createEventListStore({
    fetchEventList: (request) => {
      mut_reads.push(request);

      return Promise.resolve(Result.ok<readonly EventListItem[]>([]));
    },
    fireAuthUser$,
    filter,
    throttleMs: 20,
  });

  return {
    store,
    reads: mut_reads,
    signIn: (uid) => {
      setFireAuthUser({ uid });
    },
    filter,
  } as const;
};

const settle = async (ms: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};
