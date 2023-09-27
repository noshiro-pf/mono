import {
  type Answer,
  type DatetimeSpecificationEnumType,
} from '@noshiro/event-schedule-app-shared';
import { answerDiffAsString } from './answer-diff';

const urlPrefix = 'https://event-schedule-app.web.app/event';

export const createMailBodyForNewAnswer = ({
  eventId,
  answerItem,
}: Readonly<{
  eventId: string;
  answerItem: Answer;
}>): string =>
  [
    `${answerItem.user.name}さんが回答を追加しました。`,
    '',
    '回答ページを確認：',
    `${urlPrefix}/${eventId}`,
  ].join('\n');

export const createMailBodyForAnswerDelete = ({
  eventId,
  answerItem,
}: Readonly<{
  eventId: string;
  answerItem: Answer;
}>): string =>
  [
    `${answerItem.user.name}さんが回答を削除しました。`,
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
  answerItemBefore: Answer;
  answerItemAfter: Answer;
  datetimeSpecification: DatetimeSpecificationEnumType;
}>): string =>
  [
    `${answerItemAfter.user.name}さんが回答を更新しました。`,
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
  diff: 0 | 1 | 3 | 7 | 14 | 28;
}>): string =>
  [
    [
      diff === 0
        ? `回答期限当日になりました。`
        : `回答期限${diff}日前になりました。`,
      '未回答の人がいたらリマインドを送りましょう。',
    ].join(''),
    '',
    '回答ページを確認：',
    `${urlPrefix}/${eventId}`,
  ].join('\n');

export const createMailBodyForAnswerResult = (eventId: string): string =>
  [
    '回答を締め切りました。結果を確認しましょう。',
    '',
    '回答ページを確認：',
    `${urlPrefix}/${eventId}`,
  ].join('\n');
