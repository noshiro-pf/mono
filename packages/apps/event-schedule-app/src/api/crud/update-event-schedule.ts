import { doc, setDoc } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

export const updateEventSchedule = (
  eventId: string,
  ev: EventSchedule
): Promise<Result<void, string>> =>
  Result.fromPromise(setDoc(doc(dbEvents, eventId), ev)).then(
    Result.fold(() => undefined, Str.from)
  );