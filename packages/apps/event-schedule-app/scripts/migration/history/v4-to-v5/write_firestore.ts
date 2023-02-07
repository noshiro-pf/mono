/* eslint-disable import/no-internal-modules */

import {
  firestorePaths as firestorePathsCurr,
  type Answer as AnswerCurr,
  type EventSchedule as EventScheduleCurr,
} from '@noshiro/event-schedule-app-shared/cjs/v4';
import {
  fillAnswer,
  fillEventSchedule,
  firestorePaths as firestorePathsNext,
  type Answer as AnswerNext,
  type EventSchedule as EventScheduleNext,
} from '@noshiro/event-schedule-app-shared/cjs/v5';
import * as admin from 'firebase-admin';
import serviceAccount from '../../../service-account-key.json';

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://event-schedule-app.firebaseio.com',
});

const db = app.firestore();
const collectionNameCurr = firestorePathsCurr.events;
const collectionNameNext = firestorePathsNext.events;
const subCollectionName = firestorePathsNext.answers;

const convertEventSchedule = ({
  answerDeadline,
  answerIcons,
  datetimeRangeList,
  datetimeSpecification,
  notes,
  notificationSettings,
  timezoneOffsetMinutes,
  title,
  useAnswerDeadline,
  useNotification,
}: EventScheduleCurr): EventScheduleNext =>
  fillEventSchedule({
    answerDeadline:
      !useAnswerDeadline || answerDeadline === undefined
        ? 'none'
        : answerDeadline,
    answerIcons,
    author: {
      id: null,
      name: '',
    },
    datetimeRangeList,
    datetimeSpecification,
    notes,
    notificationSettings: !useNotification ? 'none' : notificationSettings,
    timezoneOffsetMinutes,
    title,
  });

const convertAnswer = ({
  comment,
  createdAt,
  id,
  isRequiredParticipants,
  selection,
  userName,
  weight,
}: AnswerCurr): AnswerNext =>
  fillAnswer({
    comment,
    createdAt,
    id,
    isRequiredParticipants,
    selection,
    user: {
      id: null,
      name: userName,
    },
    weight,
  });

const updateStore = async (): Promise<boolean> => {
  const eventsSnapshotCurr = await db.collection(collectionNameCurr).get();
  const writeBatch = db.batch();

  for (const doc of eventsSnapshotCurr.docs) {
    // read
    const id = doc.id;

    // eslint-disable-next-line no-await-in-loop
    const answersSnapshotCurr = await db
      .collection(`${collectionNameCurr}/${id}/${subCollectionName}`)
      .get();

    // write
    const documentRef = db.doc(`${collectionNameNext}/${id}`);
    writeBatch.set(
      documentRef,
      convertEventSchedule(doc.data() as EventScheduleCurr)
    );

    for (const ans of answersSnapshotCurr.docs) {
      const documentRefForAnswers = db.doc(
        `${collectionNameNext}/${id}/${subCollectionName}/${ans.id}`
      );
      writeBatch.set(
        documentRefForAnswers,
        convertAnswer(ans.data() as AnswerCurr)
      );
    }
  }

  await writeBatch.commit().catch();

  console.log('Successfully executed batch.');

  return true;
};

const main = (): Promise<readonly boolean[]> => Promise.all([updateStore()]);

main().catch(console.error);
