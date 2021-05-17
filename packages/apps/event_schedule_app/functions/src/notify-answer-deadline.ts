import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { firestorePaths } from './constants/firestore-paths';
import { createMailBodyForAnswerDeadline } from './create-mail-body';
import { createMailOptions, sendEmail } from './setup-mailer';
import { todayIsNDaysBeforeDeadline } from './today-is-n-day-before-deadline';
import type { EventScheduleJsType } from './types/record/event-schedule';
import { pad2 } from './utils/to-str';
import { tuple } from './utils/tuple';

export const notifyAnswerDeadline = async (): Promise<void> => {
  const querySnapshot = await admin
    .firestore()
    .collection(firestorePaths.events)
    .where('useNotification', '==', true)
    .where('useAnswerDeadline', '==', true)
    .get();

  const events = querySnapshot.docs.map((doc) =>
    tuple(doc.id, doc.data() as EventScheduleJsType)
  );

  await Promise.all(
    events.flatMap(([eventId, ev]) => {
      const ns = ev.notificationSettings;

      return (
        [
          [ns.notify01daysBeforeAnswerDeadline, 1],
          [ns.notify03daysBeforeAnswerDeadline, 3],
          [ns.notify07daysBeforeAnswerDeadline, 7],
          [ns.notify14daysBeforeAnswerDeadline, 14],
          [ns.notify28daysBeforeAnswerDeadline, 28],
        ] as [boolean, 1 | 3 | 7 | 14 | 28][]
      )
        .filter(
          ([flag, diff]) =>
            flag && todayIsNDaysBeforeDeadline(diff, ev.answerDeadline.ymd)
        )
        .map(([_, diff]) => {
          functions.logger.log(`notify${pad2(diff)}daysBeforeAnswerDeadline`);
          return sendEmail(
            createMailOptions({
              to: ns.email,
              subject: `イベント「${ev.title}」の回答期限${diff}日前になりました。`,
              text: createMailBodyForAnswerDeadline({ eventId, diff }),
            })
          );
        });
    })
  );
};
