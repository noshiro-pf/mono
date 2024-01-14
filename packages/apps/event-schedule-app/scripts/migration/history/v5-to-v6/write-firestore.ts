import {
  firestorePaths as firestorePathsCurr,
  type Answer as AnswerCurr,
  type EventSchedule as EventScheduleCurr,
} from '@noshiro/event-schedule-app-shared/v5';
import {
  fillAnswer,
  fillEventSchedule,
  firestorePaths as firestorePathsNext,
} from '@noshiro/event-schedule-app-shared/v6';
import admin from 'firebase-admin';
import serviceAccount from '../../../service-account-key.json';

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://event-schedule-app.firebaseio.com',
});

const db = app.firestore();
const collectionNameCurr = firestorePathsCurr.events;
const collectionNameNext = firestorePathsNext.events;
const subCollectionName = firestorePathsNext.answers;

const updateStore = async (): Promise<boolean> => {
  const eventsSnapshotCurr = await db.collection(collectionNameCurr).get();
  const writeBatch = db.batch();

  for (const doc of eventsSnapshotCurr.docs) {
    // read
    const id = doc.id;

    const answersSnapshotCurr = await db
      .collection(`${collectionNameCurr}/${id}/${subCollectionName}`)
      .get();

    // write
    const documentRef = db.doc(`${collectionNameNext}/${id}`);
    writeBatch.set(
      documentRef,
      fillEventSchedule(doc.data() as EventScheduleCurr),
    );

    for (const ans of answersSnapshotCurr.docs) {
      const documentRefForAnswers = db.doc(
        `${collectionNameNext}/${id}/${subCollectionName}/${ans.id}`,
      );
      writeBatch.set(
        documentRefForAnswers,
        fillAnswer(ans.data() as AnswerCurr),
      );
    }
  }

  await writeBatch.commit().catch(console.error);

  console.log('Successfully executed batch.');

  return true;
};

const main = (): Promise<readonly boolean[]> => Promise.all([updateStore()]);

main().catch(console.error);
