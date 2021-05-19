import { answerDiffAsString } from './answer-diff';
import type { AnswerJsType, DatetimeSpecificationEnumType } from './types';

const urlPrefix = 'https://event-schedule-app.web.app/event';

export const createMailBodyForNewAnswer = ({
  eventId,
  answerItem,
}: Readonly<{
  eventId: string;
  answerItem: AnswerJsType;
}>): string =>
  [
    `${answerItem.userName}さんが回答を追加しました。`,
    '',
    '回答ページを確認：',
    `${urlPrefix}/${eventId}`,
  ].join('\n');

export const createMailBodyForAnswerDelete = ({
  eventId,
  answerItem,
}: Readonly<{
  eventId: string;
  answerItem: AnswerJsType;
}>): string =>
  [
    `${answerItem.userName}さんが回答を削除しました。`,
    '',
    '回答ページを確認：',
    `${urlPrefix}/${eventId}`,
  ].join('\n');

export const createMailBodyForUpdatedAnswer = ({
  eventId,
  answerItemBefore,
  answerItemAfter,
  datetimeSpecification,
}: Readonly<{
  eventId: string;
  answerItemBefore: AnswerJsType;
  answerItemAfter: AnswerJsType;
  datetimeSpecification: DatetimeSpecificationEnumType;
}>): string =>
  [
    `${answerItemAfter.userName}さんが回答を更新しました。`,
    '',
    '回答ページを確認：',
    `${urlPrefix}/${eventId}`,
    '',
    '変更内容：',
    '--------------------',
    ...answerDiffAsString(
      answerItemBefore,
      answerItemAfter,
      datetimeSpecification
    ),
  ].join('\n');

export const createMailBodyForAnswerDeadline = ({
  eventId,
  diff,
}: Readonly<{
  eventId: string;
  diff: 1 | 3 | 7 | 14 | 28;
}>): string =>
  [
    `回答期限${diff}日前になりました。未回答の人がいたらリマインドを送りましょう。`,
    '',
    '回答ページを確認：',
    `${urlPrefix}/${eventId}`,
  ].join('\n');
