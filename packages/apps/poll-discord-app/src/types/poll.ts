import { isRecord } from '@noshiro/ts-utils';
import type { AnswerOfDate, AnswerOfDateJson } from './answer-of-date';
import { answerOfDateToJson, fillAnswerOfDate } from './answer-of-date';
import type { DateOption } from './date-option';
import { fillDateOption } from './date-option';
import type { DateOptionId, PollId, Timestamp, TitleMessageId } from './types';
import {
  createDateOptionId,
  createPollId,
  createTimestamp,
  createTitleMessageId,
  isTimestamp,
} from './types';

export type Poll = DeepReadonly<{
  id: PollId;
  title: string;
  updatedAt: Timestamp; // timestamp
  dateOptions: DateOption[]; // used to find this Poll object from button message that represents date option
  answers: IMap<DateOptionId, AnswerOfDate>;
  titleMessageId: TitleMessageId;
}>;

export type PollJson = DeepReadonly<{
  id: string;
  title: string;
  updatedAt: Timestamp;
  dateOptions: DateOption[];
  answers: Record<DateOptionId, AnswerOfDateJson>;
  titleMessageId: TitleMessageId;
}>;

assertType<TypeExtends<PollJson, ReadonlyJSONType>>();

const pollDefaultValue: Poll = {
  id: createPollId(''),
  title: '',
  updatedAt: createTimestamp(IDate.now()),
  dateOptions: [],
  answers: IMap.new<DateOptionId, AnswerOfDate>([]),
  titleMessageId: createTitleMessageId(''),
} as const;

const d = pollDefaultValue;

export const fillPoll = (a?: unknown): Poll =>
  a === undefined || !isRecord(a)
    ? d
    : {
        id: IRecord.hasKeyValue(a, 'id', isString) ? a.id : d.id,

        title: IRecord.hasKeyValue(a, 'title', isString) ? a.title : d.title,

        updatedAt: IRecord.hasKeyValue(a, 'updatedAt', isTimestamp)
          ? a.updatedAt
          : d.updatedAt,

        // TODO
        dateOptions: IRecord.hasKeyValue(a, 'dateOptions', IList.isArray)
          ? a.dateOptions.map(fillDateOption)
          : d.dateOptions,

        answers: IRecord.hasKeyValue(a, 'answers', isRecord)
          ? IMap.new<DateOptionId, AnswerOfDate>(
              IRecord.entries(a.answers).map(([k, v]) => [
                createDateOptionId(k),
                fillAnswerOfDate(v),
              ])
            )
          : d.answers,

        titleMessageId: IRecord.hasKeyValue(a, 'titleMessageId', isString)
          ? a.titleMessageId
          : d.titleMessageId,
      };

export const pollToJson = (a: Poll): PollJson => ({
  id: a.id,
  title: a.title,
  updatedAt: a.updatedAt,
  dateOptions: a.dateOptions,
  answers: IRecord.fromEntries(
    a.answers.map(answerOfDateToJson).toEntriesArray()
  ),
  titleMessageId: a.titleMessageId,
});