import {
  Answer,
  EventSchedule,
  firestorePaths,
} from 'event-schedule-app-shared';
import { type Firestore } from 'firebase-admin/firestore';
import { type auth } from 'firebase-functions/v1';
import { type DeepReadonly } from 'ts-type-forge';

const removeAuthorIdFromEventSchedule = (
  eventSchedule: EventSchedule,
  userIdToBeRemoved: string,
): EventSchedule =>
  ({
    ...eventSchedule,
    author: {
      ...eventSchedule.author,
      id:
        eventSchedule.author.id === userIdToBeRemoved
          ? null
          : eventSchedule.author.id,
    },
  }) as const;

const removeUserIdFromAnswer = (
  answer: Answer,
  userIdToBeRemoved: string,
): Answer =>
  ({
    ...answer,
    user: {
      ...answer.user,
      id: answer.user.id === userIdToBeRemoved ? null : answer.user.id,
    },
  }) as const;

export const onUserDelete = async (
  db: Firestore,
  user: DeepReadonly<auth.UserRecord>,
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
        EventSchedule.fill(doc.data()),
        userIdToBeRemoved,
      ),
    );

    // eslint-disable-next-line no-await-in-loop
    const answersSnapshotCurr = await db
      .collection(`${firestorePaths.events}/${id}/${firestorePaths.answers}`)
      .get();

    for (const ans of answersSnapshotCurr.docs) {
      const documentRefForAnswers = db.doc(
        `${firestorePaths.events}/${id}/${firestorePaths.answers}/${ans.id}`,
      );

      writeBatch.set(
        documentRefForAnswers,
        removeUserIdFromAnswer(Answer.fill(ans.data()), userIdToBeRemoved),
      );
    }
  }

  await writeBatch.commit().catch(console.error);

  console.log('Successfully executed batch.');
};
