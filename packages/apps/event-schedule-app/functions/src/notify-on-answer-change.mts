import { type Answer } from '@noshiro/event-schedule-app-shared';
import { compareYmdhm } from '@noshiro/io-ts-types';
import { type firestore } from 'firebase-admin';
import { logger } from 'firebase-functions';
import {
  createMailBodyForAnswerDelete,
  createMailBodyForNewAnswer,
  createMailBodyForUpdatedAnswer,
} from './functions/index.mjs';
import { getEmail, getEventItem } from './get-event-item.mjs';
import { createMailOptions, sendEmail } from './setup-mailer.mjs';
import { now } from './utils/index.mjs';

export const notifyOnAnswerChangeBody = async (
  db: firestore.Firestore,
  {
    eventType,
    eventId,
    answerItemBefore,
    answerItemAfter,
  }: Readonly<{
    eventType: 'create' | 'delete' | 'update';
    eventId: string;
    answerItemBefore: Answer | undefined;
    answerItemAfter: Answer | undefined;
  }>,
): Promise<void> => {
  const [eventItem, email] = await Promise.all([
    getEventItem(db, eventId),
    getEmail(db, eventId),
  ]);

  if (eventItem === undefined) {
    logger.log(`eventItem of id = "${eventId}" not found.`);
    return;
  }
  if (eventItem.notificationSettings === 'none') {
    logger.log('skipped because eventItem.notification === "none".');
    return;
  }
  if (!eventItem.notificationSettings.notifyOnAnswerChange) {
    logger.log(
      'skipped because eventItem.notificationSettings.notifyOnAnswerChange is empty.',
    );
    return;
  }
  if (email === '') {
    logger.log('skipped because email is empty.');
    return;
  }

  if (
    eventItem.answerDeadline !== 'none' &&
    compareYmdhm(eventItem.answerDeadline, now()) <= 0
  ) {
    logger.log(
      'skipped because eventItem.useAnswerDeadline is true and answerDeadline overed.',
    );
    return; // skip if answerDeadline overed
  }

  switch (eventType) {
    case 'create':
      if (answerItemAfter === undefined) {
        logger.log('skipped because answerItemAfter is undefined');
        return;
      }
      await sendEmail(
        createMailOptions({
          to: email,
          subject: `イベント「${eventItem.title}」の日程調整に回答が追加されました。`,
          text: createMailBodyForNewAnswer({
            eventId,
            answerItem: answerItemAfter,
          }),
        }),
      );
      break;
    case 'delete':
      if (answerItemBefore === undefined) {
        logger.log('skipped because answerItemBefore is undefined');
        return;
      }
      await sendEmail(
        createMailOptions({
          to: email,
          subject: `イベント「${eventItem.title}」の日程調整の回答が削除されました。`,
          text: createMailBodyForAnswerDelete({
            eventId,
            answerItem: answerItemBefore,
          }),
        }),
      );
      break;
    case 'update':
      if (answerItemBefore === undefined || answerItemAfter === undefined) {
        logger.log(
          'skipped because answerItemBefore or answerItemBefore is undefined',
        );
        return;
      }
      await sendEmail(
        createMailOptions({
          to: email,
          subject: `イベント「${eventItem.title}」の日程調整の回答が更新されました。`,
          text: createMailBodyForUpdatedAnswer({
            eventId,
            answerItemBefore,
            answerItemAfter,
            datetimeSpecification: eventItem.datetimeSpecification,
          }),
        }),
      );
      break;
  }
};
