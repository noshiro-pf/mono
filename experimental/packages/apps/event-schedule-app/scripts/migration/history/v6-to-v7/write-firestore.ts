import {
  firestorePaths as firestorePathsCurr,
  type Answer as AnswerCurr,
  type EventSchedule as EventScheduleCurr,
} from '@noshiro/event-schedule-app-shared/v6';
import {
  fillAnswer,
  fillEventSchedule,
  firestorePaths as firestorePathsNext,
  toUserId,
  toUserName,
  type EventSchedule as EventScheduleNext,
} from '@noshiro/event-schedule-app-shared/v7';
import admin from 'firebase-admin';
import serviceAccount from '../../../service-account-key.json';

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://event-schedule-app.firebaseio.com',
});

const db = app.firestore();

const path = {
  eventsCurr: firestorePathsCurr.events,
  eventsNext: firestorePathsNext.events,
  answers: firestorePathsNext.answers,
  internal: firestorePathsNext.internal,
  values: firestorePathsNext.values,
};

const convertEventSchedule = ({
  notificationSettings,
  author,
  archivedBy,
  ...rest
}: EventScheduleCurr): EventScheduleNext => ({
  ...rest,
  archivedBy: archivedBy.map((user) => ({
    id: toUserId(user.id),
    name: toUserName(user.name),
  })),
  author: {
    id: toUserId(author.id),
    name: toUserName(author.name),
  },
  notificationSettings:
    notificationSettings === 'none'
      ? 'none'
      : {
          notify01daysBeforeAnswerDeadline:
            notificationSettings.notify01daysBeforeAnswerDeadline,
          notify03daysBeforeAnswerDeadline:
            notificationSettings.notify03daysBeforeAnswerDeadline,
          notify07daysBeforeAnswerDeadline:
            notificationSettings.notify07daysBeforeAnswerDeadline,
          notify14daysBeforeAnswerDeadline:
            notificationSettings.notify14daysBeforeAnswerDeadline,
          notify28daysBeforeAnswerDeadline:
            notificationSettings.notify28daysBeforeAnswerDeadline,
          notifyOnAnswerChange: notificationSettings.notifyOnAnswerChange,
          notify00daysBeforeAnswerDeadline: false,
          notifyAfterAnswerDeadline: false,
        },
});

const updateStore = async (): Promise<boolean> => {
  const eventsSnapshotCurr = await db.collection(path.eventsCurr).get();
  const writeBatch = db.batch();

  for (const doc of eventsSnapshotCurr.docs) {
    // read
    const id = doc.id;

    const answersSnapshotCurr = await db
      .collection(`${path.eventsCurr}/${id}/${path.answers}`)
      .get();

    // write
    const documentRef = db.doc(`${path.eventsNext}/${id}`);
    const eventScheduleCurr = doc.data() as EventScheduleCurr;
    writeBatch.set(
      documentRef,
      fillEventSchedule(convertEventSchedule(eventScheduleCurr)),
    );

    const emailRef = db.doc(
      `${path.eventsNext}/${id}/${path.internal}/${path.values}`,
    );
    if (eventScheduleCurr.notificationSettings !== 'none') {
      writeBatch.set(emailRef, {
        email: eventScheduleCurr.notificationSettings.email,
      });
    }

    for (const ans of answersSnapshotCurr.docs) {
      const documentRefForAnswers = db.doc(
        `${path.eventsNext}/${id}/${path.answers}/${ans.id}`,
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
