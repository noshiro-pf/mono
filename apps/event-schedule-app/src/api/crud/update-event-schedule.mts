import { doc, setDoc } from 'firebase/firestore';
import { Result, unknownToString } from 'ts-data-forge';
import { firestoreEvents } from '../../initialize-firebase.mjs';

export const updateEventSchedule = (
  eventId: string,
  ev: EventSchedule,
): Promise<Result<void, string>> =>
  Result.fromPromise(setDoc(doc(firestoreEvents, eventId), ev)).then(
    Result.fold(() => undefined, unknownToString),
  );
