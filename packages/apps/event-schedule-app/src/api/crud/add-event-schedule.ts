import { addDoc } from 'firebase/firestore';
import { firestoreEvents } from '../../initialize-firebase';

export const addEventSchedule = (
  ev: EventSchedule,
): Promise<Result<string, string>> =>
  Result.fromPromise(addDoc(firestoreEvents, ev)).then((a) =>
    Result.fold(a, (docRef) => docRef.id, Str.from),
  );
