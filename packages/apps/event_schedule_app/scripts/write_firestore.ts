// eslint-disable-next-line import/no-internal-modules
import type { EventSchedule as EventScheduleCurr } from '@noshiro/event-schedule-app-shared/esm/v1';
// eslint-disable-next-line import/no-internal-modules
import { firestorePaths as firestorePathsCurr } from '@noshiro/event-schedule-app-shared/esm/v1';
// eslint-disable-next-line import/no-internal-modules
import type { EventSchedule as EventScheduleNext } from '@noshiro/event-schedule-app-shared/esm/v2';
// eslint-disable-next-line import/no-internal-modules
import { firestorePaths as firestorePathsNext } from '@noshiro/event-schedule-app-shared/esm/v2';
import * as admin from 'firebase-admin';
import serviceAccount from './service-account-key.json';

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://event-schedule-app.firebaseio.com',
});

const db = app.firestore();
const collectionNameCurr = firestorePathsCurr.events;
const collectionNameNext = firestorePathsNext.events;
const subCollectionName = firestorePathsNext.answers;

const migrate = (before: EventScheduleCurr): EventScheduleNext => ({
  ...before,
  answerDeadline:
    before.answerDeadline === undefined
      ? undefined
      : {
          ...before.answerDeadline.ymd,
          ...before.answerDeadline.hm,
        },
});

const updateStore = async (): Promise<boolean> => {
  const eventsSnapshotV1 = await db.collection(collectionNameCurr).get();
  const writeBatch = db.batch();

  for (const doc of eventsSnapshotV1.docs) {
    // read
    const id = doc.id;
    const eventScheduleV1 = doc.data() as EventScheduleCurr;
    // eslint-disable-next-line no-await-in-loop
    const answersSnapshotV1 = await db
      .collection(`${collectionNameCurr}/${id}/${subCollectionName}`)
      .get();

    // write
    const documentRef = db.doc(`${collectionNameNext}/${id}`);
    writeBatch.set(documentRef, migrate(eventScheduleV1));

    for (const ans of answersSnapshotV1.docs) {
      const documentRefForAnswers = db.doc(
        `${collectionNameNext}/${id}/${subCollectionName}/${ans.id}`
      );
      writeBatch.set(documentRefForAnswers, ans.data());
    }
  }

  await writeBatch.commit().catch();

  console.log('Successfully executed batch.');

  return true;
};

const main = (): Promise<readonly boolean[]> => Promise.all([updateStore()]);

main().catch(console.error);
