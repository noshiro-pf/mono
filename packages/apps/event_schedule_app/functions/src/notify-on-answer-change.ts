import * as functions from 'firebase-functions';
import {
  createMailBodyForAnswerDelete,
  createMailBodyForNewAnswer,
  createMailBodyForUpdatedAnswer,
} from './create-mail-body';
import { getEventItem } from './get-event-item';
import { createMailOptions, sendEmail } from './setup-mailer';
import type { AnswerJsType } from './types';
import { compareYmdHm } from './types';
import { now } from './utils';

export const notifyOnAnswerChangeBody = async ({
  eventType,
  eventId,
  answerItemBefore,
  answerItemAfter,
}: Readonly<{
  eventType: 'create' | 'delete' | 'update';
  eventId: string;
  answerItemBefore: AnswerJsType | undefined;
  answerItemAfter: AnswerJsType | undefined;
}>): Promise<void> => {
  const eventItem = await getEventItem(eventId);

  if (!eventItem.useNotification) {
    functions.logger.log('skipped because eventItem.useNotification is false.');
    return;
  }
  if (!eventItem.notificationSettings.notifyOnAnswerChange) {
    functions.logger.log(
      'skipped because eventItem.notificationSettings.notifyOnAnswerChange is empty.'
    );
    return;
  }
  if (eventItem.notificationSettings.email === '') {
    functions.logger.log(
      'skipped because eventItem.notificationSettings.email is empty.'
    );
    return;
  }

  if (
    eventItem.useAnswerDeadline &&
    compareYmdHm(eventItem.answerDeadline, now()) <= 0
  ) {
    functions.logger.log(
      'skipped because eventItem.useAnswerDeadline is true and answerDeadline overed.'
    );
    return; // skip if answerDeadline overed
  }

  switch (eventType) {
    case 'create':
      if (answerItemAfter === undefined) {
        functions.logger.log('skipped because answerItemAfter is undefined');
        return;
      }
      await sendEmail(
        createMailOptions({
          to: eventItem.notificationSettings.email,
          subject: `イベント「${eventItem.title}」の日程調整に回答が追加されました。`,
          text: createMailBodyForNewAnswer({
            eventId,
            answerItem: answerItemAfter,
          }),
        })
      );
      break;
    case 'delete':
      if (answerItemBefore === undefined) {
        functions.logger.log('skipped because answerItemBefore is undefined');
        return;
      }
      await sendEmail(
        createMailOptions({
          to: eventItem.notificationSettings.email,
          subject: `イベント「${eventItem.title}」の日程調整の回答が削除されました。`,
          text: createMailBodyForAnswerDelete({
            eventId,
            answerItem: answerItemBefore,
          }),
        })
      );
      break;
    case 'update':
      if (answerItemBefore === undefined || answerItemAfter === undefined) {
        functions.logger.log(
          'skipped because answerItemBefore or answerItemBefore is undefined'
        );
        return;
      }
      await sendEmail(
        createMailOptions({
          to: eventItem.notificationSettings.email,
          subject: `イベント「${eventItem.title}」の日程調整の回答が更新されました。`,
          text: createMailBodyForUpdatedAnswer({
            eventId,
            answerItemBefore,
            answerItemAfter,
            datetimeSpecification: eventItem.datetimeSpecification,
          }),
        })
      );
      break;
  }
};
