import type { Answer, EventSchedule } from '@noshiro/event-schedule-app-shared';
import { IRecord } from '@noshiro/ts-utils';
import type { firestore } from 'firebase-admin';
import type { auth } from 'firebase-functions';
import { collectionPath } from './firestore-paths';

const removeAuthorIdFromEventSchedule = (
  eventSchedule: EventSchedule,
  userIdToBeRemoved: string
): EventSchedule =>
  IRecord.update(eventSchedule, 'author', (author) =>
    IRecord.update(author, 'id', (id) => (id === userIdToBeRemoved ? null : id))
  );

const removeUserIdFromAnswer = (
  answer: Answer,
  userIdToBeRemoved: string
): Answer =>
  IRecord.update(answer, 'user', (user) =>
    IRecord.update(user, 'id', (id) => (id === userIdToBeRemoved ? null : id))
  );

export const onUserDelete = async (
  db: firestore.Firestore,
  user: DeepReadonly<auth.UserRecord>
): Promise<void> => {
  const userIdToBeRemoved = user.uid;

  const eventsSnapshot = await db.collection(collectionPath.events).get();
  const writeBatch = db.batch();

  for (const doc of eventsSnapshot.docs) {
    const id = doc.id;

    const documentRef = db.doc(`${collectionPath.events}/${id}`);

    writeBatch.set(
      documentRef,
      removeAuthorIdFromEventSchedule(
        doc.data() as EventSchedule,
        userIdToBeRemoved
      )
    );

    // eslint-disable-next-line no-await-in-loop
    const answersSnapshotCurr = await db
      .collection(`${collectionPath.events}/${id}/${collectionPath.answers}`)
      .get();

    for (const ans of answersSnapshotCurr.docs) {
      const documentRefForAnswers = db.doc(
        `${collectionPath.events}/${id}/${collectionPath.answers}/${ans.id}`
      );

      writeBatch.set(
        documentRefForAnswers,
        removeUserIdFromAnswer(ans.data() as Answer, userIdToBeRemoved)
      );
    }
  }

  await writeBatch.commit().catch(console.error);

  console.log('Successfully executed batch.');
};