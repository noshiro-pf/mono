import { doc, setDoc } from 'firebase/firestore';
import { Result, unknownToString } from 'ts-data-forge';
import type { FirebaseHandles } from '../firebase.mjs';

export const updateEventSchedule =
  ({ firestoreEvents }: FirebaseHandles) =>
  (eventId: string, ev: EventSchedule): Promise<Result<void, string>> =>
    Result.fromPromise(setDoc(doc(firestoreEvents, eventId), ev)).then(
      Result.fold(() => undefined, unknownToString),
    );
