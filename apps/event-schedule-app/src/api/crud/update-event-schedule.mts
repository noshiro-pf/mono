import { doc, updateDoc } from 'firebase/firestore';
import { Result, unknownToString } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import type { FirebaseHandles } from '../firebase.mjs';

/**
 * Writes the event's settings, and nothing else: `author` is never changed, and
 * `archivedBy` is written by the participants from their own lists at any time,
 * so the value this tab read may be stale. The rules let an author's edit
 * through only when both are as stored, which a write that leaves them out
 * always is.
 */
export const updateEventSchedule =
  ({ firestoreEvents }: StrictPick<FirebaseHandles, 'firestoreEvents'>) =>
  (
    eventId: string,
    { author: _author, archivedBy: _archivedBy, ...settings }: EventSchedule,
  ): Promise<Result<void, string>> =>
    Result.fromPromise(updateDoc(doc(firestoreEvents, eventId), settings)).then(
      Result.fold(() => undefined, unknownToString),
    );
