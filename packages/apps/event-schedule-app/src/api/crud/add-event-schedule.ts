import { addDoc } from 'firebase/firestore';
import { firestoreEvents } from '../../initialize-firebase';

export const addEventSchedule = (
  ev: EventSchedule
): Promise<Result<string, string>> =>
  Result.fromPromise(addDoc(firestoreEvents, ev)).then(
    Result.fold((docRef) => docRef.id, Str.from)
  );
