import { UserId, UserName } from 'event-schedule-app-shared';
import { initializeApp } from 'firebase/app';
import {
  FieldValue,
  arrayRemove,
  collection,
  getDoc,
  getFirestore,
  updateDoc,
} from 'firebase/firestore';
import { Result, hasKey, isRecord } from 'ts-data-forge';
import {
  entriesToUnarchive,
  unarchiveEventSchedule,
} from './archive-event-schedule.mjs';

// Nothing here reaches a server: `getDoc` and `updateDoc` are replaced, and
// what `updateDoc` was handed is what is checked.
vi.mock(import('firebase/firestore'), async (importOriginal) => ({
  ...(await importOriginal()),
  getDoc: vi.fn(),
  updateDoc: vi.fn(() => Promise.resolve()),
}));

const firestoreEvents = collection(
  getFirestore(
    initializeApp(
      { projectId: 'demo-event-schedule-app' },
      'archive-event-schedule-test',
    ),
  ),
  'events_v7',
);

const unarchive = unarchiveEventSchedule({ firestoreEvents });

const storedEvent = (archivedBy: unknown): void => {
  vi.mocked(getDoc).mockResolvedValueOnce(
    // Only the two methods `unarchiveEventSchedule` calls.
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    {
      exists: () => true,
      get: (field: string) => (field === 'archivedBy' ? archivedBy : undefined),
    } as unknown as Awaited<ReturnType<typeof getDoc>>,
  );
};

/** Whether `updateDoc` data is an `arrayRemove` of `entry` on `archivedBy`. */
const removes =
  (entry: unknown) =>
  (data: unknown): boolean =>
    isRecord(data) &&
    hasKey(data, 'archivedBy') &&
    data.archivedBy instanceof FieldValue &&
    arrayRemove(entry).isEqual(data.archivedBy);

describe(unarchiveEventSchedule, () => {
  beforeEach(() => {
    vi.mocked(getDoc).mockReset();

    vi.mocked(updateDoc).mockClear();
  });

  test('removes each stored entry of the user by its own arrayRemove', async () => {
    storedEvent([
      { id: 'u1', name: 'alice' },
      { id: 'u2', name: 'bob' },
      { id: 'u1', name: 'Alice' },
    ]);

    const result = await unarchive('e', {
      id: UserId.cast('u1'),
      name: UserName.cast('ALICE'),
    });

    assert.isTrue(Result.isOk(result));

    const written = vi.mocked(updateDoc).mock.calls.map(([, data]) => data);

    assert.strictEqual(written.length, 2);

    assert.isTrue(written.some(removes({ id: 'u1', name: 'alice' })));

    assert.isTrue(written.some(removes({ id: 'u1', name: 'Alice' })));
  });

  test('fails on an event that does not exist, writing nothing', async () => {
    vi.mocked(getDoc).mockResolvedValueOnce(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      {
        exists: () => false,
        get: () => undefined,
      } as unknown as Awaited<ReturnType<typeof getDoc>>,
    );

    const result = await unarchive('e', {
      id: UserId.cast('u1'),
      name: UserName.cast('alice'),
    });

    assert.isTrue(Result.isErr(result));

    assert.strictEqual(vi.mocked(updateDoc).mock.calls.length, 0);
  });

  test('fails for a user who is not signed in, reading nothing', async () => {
    const result = await unarchive('e', {
      id: UserId.cast(null),
      name: UserName.cast('anonymous'),
    });

    assert.isTrue(Result.isErr(result));

    assert.strictEqual(vi.mocked(getDoc).mock.calls.length, 0);
  });
});

describe(entriesToUnarchive, () => {
  test('finds the entry stored under a name the user no longer has', () => {
    assert.deepStrictEqual(
      entriesToUnarchive(
        [
          { id: 'u1', name: 'alice' },
          { id: 'u2', name: 'bob' },
        ],
        'u1',
      ),
      [{ id: 'u1', name: 'alice' }],
    );
  });

  test('finds every distinct entry of the user, once each', () => {
    assert.deepStrictEqual(
      entriesToUnarchive(
        [
          { id: 'u1', name: 'alice' },
          { id: 'u2', name: 'bob' },
          { id: 'u1', name: 'Alice' },
          { id: 'u1', name: 'alice' },
        ],
        'u1',
      ),
      [
        { id: 'u1', name: 'alice' },
        { id: 'u1', name: 'Alice' },
      ],
    );
  });

  test('returns the stored values themselves, which arrayRemove compares', () => {
    const stored = { id: 'u1', name: 'alice' } as const;

    const found = entriesToUnarchive([stored], 'u1');

    assert.strictEqual(found[0], stored);
  });

  test('finds nothing when the user has not archived the event', () => {
    assert.deepStrictEqual(
      entriesToUnarchive([{ id: 'u2', name: 'bob' }], 'u1'),
      [],
    );
  });

  test('ignores what is not a list of records', () => {
    assert.deepStrictEqual(entriesToUnarchive(undefined, 'u1'), []);

    assert.deepStrictEqual(
      entriesToUnarchive([null, 'u1', { id: null, name: 'anon' }], 'u1'),
      [],
    );
  });
});
