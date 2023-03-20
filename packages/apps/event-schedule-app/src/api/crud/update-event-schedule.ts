import { doc, setDoc } from 'firebase/firestore';
import { firestoreEvents } from '../../initialize-firebase';

export const updateEventSchedule = (
  eventId: string,
  ev: EventSchedule
): Promise<Result<void, string>> =>
  Result.fromPromise(setDoc(doc(firestoreEvents, eventId), ev)).then((a) =>
    Result.fold(a, () => undefined, Str.from)
  );
