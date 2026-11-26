import { EventSchedule } from 'event-schedule-app-shared';
import { initializeApp } from 'firebase/app';
import {
  collection,
  getFirestore,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Result } from 'ts-data-forge';
import { updateEventSchedule } from './update-event-schedule.mjs';

// Nothing here reaches a server: `setDoc` and `updateDoc` are replaced, and
// what they were handed is what is checked.
vi.mock(import('firebase/firestore'), async (importOriginal) => ({
  ...(await importOriginal()),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
}));

const firestoreEvents = collection(
  getFirestore(
    initializeApp(
      { projectId: 'demo-event-schedule-app' },
      'update-event-schedule-test',
    ),
  ),
  'events_v7',
);

const update = updateEventSchedule({ firestoreEvents });

describe(updateEventSchedule, () => {
  beforeEach(() => {
    vi.mocked(setDoc).mockClear();

    vi.mocked(updateDoc).mockClear();
  });

  test('writes the settings alone, leaving the author and the archive entries as stored', async () => {
    const ev = EventSchedule.fill({
      title: 'Event (room changed)',
      author: { id: 'alice', name: 'Alice' },
      archivedBy: [],
    });

    const result = await update('e', ev);

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(vi.mocked(setDoc).mock.calls.length, 0);

    const { author: _author, archivedBy: _archivedBy, ...settings } = ev;

    const written: readonly unknown[] = vi
      .mocked(updateDoc)
      .mock.calls.map(([, data]) => data);

    assert.deepStrictEqual<readonly unknown[]>(written, [settings]);
  });
});
