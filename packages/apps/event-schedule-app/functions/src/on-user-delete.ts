import {
  fillAnswer,
  fillEventSchedule,
  firestorePaths,
  type Answer,
  type EventSchedule,
} from '@noshiro/event-schedule-app-shared';
import { Obj } from '@noshiro/ts-utils';
import { type firestore } from 'firebase-admin';
import { type auth } from 'firebase-functions';

const removeAuthorIdFromEventSchedule = (
  eventSchedule: EventSchedule,
  userIdToBeRemoved: string
): EventSchedule =>
  Obj.update(eventSchedule, 'author', (author) =>
    Obj.update(author, 'id', (id) => (id === userIdToBeRemoved ? null : id))
  );

const removeUserIdFromAnswer = (
  answer: Answer,
  userIdToBeRemoved: string
): Answer =>
  Obj.update(answer, 'user', (user) =>
    Obj.update(user, 'id', (id) => (id === userIdToBeRemoved ? null : id))
  );

export const onUserDelete = async (
  db: firestore.Firestore,
  user: DeepReadonly<auth.UserRecord>
): Promise<void> => {
  const userIdToBeRemoved = user.uid;

  const eventsSnapshot = await db.collection(firestorePaths.events).get();
  const writeBatch = db.batch();

  for (const doc of eventsSnapshot.docs) {
    const id = doc.id;

    const documentRef = db.doc(`${firestorePaths.events}/${id}`);

    writeBatch.set(
      documentRef,
      removeAuthorIdFromEventSchedule(
        fillEventSchedule(doc.data()),
        userIdToBeRemoved
      )
    );

    // eslint-disable-next-line no-await-in-loop
    const answersSnapshotCurr = await db
      .collection(`${firestorePaths.events}/${id}/${firestorePaths.answers}`)
      .get();

    for (const ans of answersSnapshotCurr.docs) {
      const documentRefForAnswers = db.doc(
        `${firestorePaths.events}/${id}/${firestorePaths.answers}/${ans.id}`
      );

      writeBatch.set(
        documentRefForAnswers,
        removeUserIdFromAnswer(fillAnswer(ans.data()), userIdToBeRemoved)
      );
    }
  }

  await writeBatch.commit().catch(console.error);

  console.log('Successfully executed batch.');
};
