import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
// eslint-disable-next-line import/no-internal-modules
import type { EventSchedule as EventScheduleV1 } from '@noshiro/event-schedule-app-shared/esm/v1';
// eslint-disable-next-line import/no-internal-modules
import { firestorePaths as firestorePathsV1 } from '@noshiro/event-schedule-app-shared/esm/v1';
import * as admin from 'firebase-admin';
import serviceAccount from './service-account-key.json';

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://event-schedule-app.firebaseio.com',
});

const db = app.firestore();
const collectionNameV1 = firestorePathsV1.events;
const collectionNameV2 = firestorePaths.events;
const subCollectionName = firestorePaths.answers;

const migrate = (before: EventScheduleV1): EventSchedule => ({
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
  const eventsSnapshotV1 = await db.collection(collectionNameV1).get();
  const writeBatch = db.batch();

  for (const doc of eventsSnapshotV1.docs) {
    // read
    const id = doc.id;
    const eventScheduleV1 = doc.data() as EventScheduleV1;
    // eslint-disable-next-line no-await-in-loop
    const answersSnapshotV1 = await db
      .collection(`${collectionNameV1}/${id}/${subCollectionName}`)
      .get();

    // write
    const documentRef = db.doc(`${collectionNameV2}/${id}`);
    writeBatch.set(documentRef, migrate(eventScheduleV1));

    for (const ans of answersSnapshotV1.docs) {
      const documentRefForAnswers = db.doc(
        `${collectionNameV2}/${id}/${subCollectionName}/${ans.id}`
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
