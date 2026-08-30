import { addDoc } from 'firebase/firestore';
import { Result, unknownToString } from 'ts-data-forge';
import { firestoreEvents } from '../../initialize-firebase.mjs';

export const addEventSchedule = (
  ev: EventSchedule,
): Promise<Result<string, string>> =>
  Result.fromPromise(addDoc(firestoreEvents, ev)).then(
    Result.fold((docRef) => docRef.id, unknownToString),
  );
