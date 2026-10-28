import { addDoc } from 'firebase/firestore';
import { Result, unknownToString } from 'ts-data-forge';
import type { FirebaseHandles } from '../firebase.mjs';

export const addEventSchedule =
  ({ firestoreEvents }: FirebaseHandles) =>
  (ev: EventSchedule): Promise<Result<string, string>> =>
    Result.fromPromise(addDoc(firestoreEvents, ev)).then(
      Result.fold((docRef) => docRef.id, unknownToString),
    );
