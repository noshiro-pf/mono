import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { tuple } from '@noshiro/ts-utils';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { createMailBodyForAnswerDeadline } from './create-mail-body';
import { createMailOptions, sendEmail } from './setup-mailer';
import { todayIsNDaysBeforeDeadline } from './today-is-n-day-before-deadline';
import { pad2 } from './utils';

export const notifyAnswerDeadline = async (): Promise<void> => {
  const querySnapshot = await admin
    .firestore()
    .collection(firestorePaths.events)
    .where('useNotification', '==', true)
    .where('useAnswerDeadline', '==', true)
    .get();

  const events = querySnapshot.docs.map((doc) =>
    tuple(doc.id, doc.data() as EventSchedule)
  );

  await Promise.all(
    events.flatMap(([eventId, ev]) => {
      const ns = ev.notificationSettings;
      const answerDeadline = ev.answerDeadline;

      if (answerDeadline === undefined) {
        return Promise.resolve();
      }

      return (
        [
          [ns.notify01daysBeforeAnswerDeadline, 1],
          [ns.notify03daysBeforeAnswerDeadline, 3],
          [ns.notify07daysBeforeAnswerDeadline, 7],
          [ns.notify14daysBeforeAnswerDeadline, 14],
          [ns.notify28daysBeforeAnswerDeadline, 28],
        ] as const
      )
        .filter(
          ([flag, diff]) =>
            flag && todayIsNDaysBeforeDeadline(diff, answerDeadline)
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
