import { Answer, EventSchedule } from 'event-schedule-app-shared';
import type { Firestore } from 'firebase-admin/firestore';
import type { ReadonlyRecord } from 'ts-type-forge';
import { fetchEventListOfUserImpl } from './fetch-event-list-of-user.mjs';

describe(fetchEventListOfUserImpl, () => {
  const payload = {
    filterText: '',
    filterOptionState: 'inProgress',
    showAllPastDaysEvent: true,
    showOnlyEventSchedulesICreated: false,
  } as const;

  const events = {
    mine: { author: 'u1', answeredBy: [] },
    answered: { author: 'u2', answeredBy: ['u1'] },
    others: { author: 'u2', answeredBy: ['u3'] },
  } as const;

  test('lists an event the user created and has not answered, and one they answered', async () => {
    const list = await fetchEventListOfUserImpl(fakeDb(events), payload, 'u1');

    assert.deepStrictEqual(idsOf(list), ['answered', 'mine']);
  });

  test('lists only the events the user created when asked to', async () => {
    const list = await fetchEventListOfUserImpl(
      fakeDb(events),
      { ...payload, showOnlyEventSchedulesICreated: true },
      'u1',
    );

    assert.deepStrictEqual(idsOf(list), ['mine']);
  });

  test('lists a created event the user archived under the archive and not in progress', async () => {
    const db = fakeDb({
      archived: { author: 'u1', answeredBy: [], archivedBy: ['u1'] },
    });

    assert.deepStrictEqual(
      idsOf(
        await fetchEventListOfUserImpl(
          db,
          { ...payload, filterOptionState: 'archive' },
          'u1',
        ),
      ),
      ['archived'],
    );

    assert.deepStrictEqual(
      idsOf(await fetchEventListOfUserImpl(db, payload, 'u1')),
      [],
    );
  });
});

const idsOf = (
  list: Awaited<ReturnType<typeof fetchEventListOfUserImpl>>,
): readonly string[] =>
  list.map(({ eventScheduleMetadata }) => eventScheduleMetadata.id).toSorted();

const at = new Date(2026, 10, 1);

const times = {
  createTime: { toDate: () => at, toMillis: () => at.getTime() },
  updateTime: { toDate: () => at, toMillis: () => at.getTime() },
} as const;

type FakeEvent = Readonly<{
  author: string;
  answeredBy: readonly string[];
  archivedBy?: readonly string[];
}>;

/**
 * As much of the Admin SDK's `Firestore` as `fetchEventListOfUserImpl` uses: the
 * `events` collection, queried by `author.id` or not, and each event's
 * `answers`, by who answered it.
 */
const fakeDb = (events: ReadonlyRecord<string, FakeEvent>): Firestore => {
  const eventDocs = Object.entries(events).map(
    ([id, { author, archivedBy = [] }]) => ({
      id,
      author,
      ...times,
      data: () =>
        EventSchedule.fill({
          title: id,
          author: { id: author, name: author },
          archivedBy: archivedBy.map((uid) => ({ id: uid, name: uid })),
        }),
    }),
  );

  // The events, of the author `author.id` was queried for, if it was.
  const query = (authorId: string | undefined) =>
    ({
      where: (field: string, _op: string, value: unknown) =>
        query(
          field === 'author.id' && typeof value === 'string' ? value : authorId,
        ),
      get: () =>
        Promise.resolve({
          docs: eventDocs.filter(
            ({ author }) => authorId === undefined || author === authorId,
          ),
        }),
    }) as const;

  const fake = {
    collection: (path: string) => {
      // `<events>/<id>/answers` is an event's answers; anything else, the events.
      const eventId = path.split('/', 2)[1];

      return eventId === undefined
        ? query(undefined)
        : {
            get: () =>
              Promise.resolve({
                docs: (events[eventId]?.answeredBy ?? []).map((uid) => ({
                  id: uid,
                  ...times,
                  data: () => Answer.fill({ user: { id: uid, name: uid } }),
                })),
              }),
          };
    },
  } as const;

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a fake of the few members used
  return fake as unknown as Firestore;
};
