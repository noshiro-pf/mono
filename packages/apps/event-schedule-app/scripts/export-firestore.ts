import { firestorePaths } from '@noshiro/event-schedule-app-shared/v7';
import { Json } from '@noshiro/ts-utils';
import admin from 'firebase-admin';
import serviceAccount from './service-account-key.json';

const app = admin.initializeApp({
  // eslint-disable-next-line no-restricted-syntax
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://event-schedule-app.firebaseio.com',
});

const db = app.firestore();
const collectionName = firestorePaths.events;
const subCollectionName = firestorePaths.answers;

const printAllEvents = async (): Promise<boolean> => {
  const eventsSnapshot = await db.collection(collectionName).get();
  const eventsEntries = eventsSnapshot.docs.map(
    (d) => [d.id, d.data()] as const,
  );

  const answersDocs = await Promise.all(
    eventsSnapshot.docs.map((d) =>
      db.collection(`${collectionName}/${d.id}/${subCollectionName}`).get(),
    ),
  );

  const answersEntries = eventsSnapshot.docs.map(
    (d, i) => [d.id, answersDocs[i]?.docs.map((a) => a.data())] as const,
  );

  const result = {
    events: Object.fromEntries(eventsEntries),
    answers: Object.fromEntries(answersEntries),
  };

  console.log(Json.stringifySortedKey(result).value);

  return true;
};

const main = (): Promise<readonly boolean[]> => Promise.all([printAllEvents()]);

main().catch(console.error);
