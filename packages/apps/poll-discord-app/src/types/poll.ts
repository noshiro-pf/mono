import { isRecord } from '@noshiro/ts-utils';
import {
  answerOfDateToJson,
  fillAnswerOfDate,
  type AnswerOfDate,
  type AnswerOfDateJson,
} from './answer-of-date';
import { fillDateOption, type DateOption } from './date-option';
import {
  createDateOptionId,
  createPollId,
  createTimestamp,
  createTitleMessageId,
  isTimestamp,
  type DateOptionId,
  type PollId,
  type Timestamp,
  type TitleMessageId,
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

assertType<TypeExtends<PollJson, JSONType>>();

const pollDefaultValue: Poll = {
  id: createPollId(''),
  title: '',
  updatedAt: createTimestamp(DateUtils.now()),
  dateOptions: [],
  answers: IMap.new<DateOptionId, AnswerOfDate>([]),
  titleMessageId: createTitleMessageId(''),
} as const;

const d = pollDefaultValue;

export const fillPoll = (a?: unknown): Poll =>
  a === undefined || !isRecord(a)
    ? d
    : {
        id: Obj.hasKeyValue(a, 'id', isString) ? a.id : d.id,

        title: Obj.hasKeyValue(a, 'title', isString) ? a.title : d.title,

        updatedAt: Obj.hasKeyValue(a, 'updatedAt', isTimestamp)
          ? a.updatedAt
          : d.updatedAt,

        // TODO
        dateOptions: Obj.hasKeyValue(a, 'dateOptions', Arr.isArray)
          ? a.dateOptions.map(fillDateOption)
          : d.dateOptions,

        answers: Obj.hasKeyValue(a, 'answers', isRecord)
          ? IMap.new<DateOptionId, AnswerOfDate>(
              Obj.entries(a.answers).map(([k, v]) => [
                createDateOptionId(k),
                fillAnswerOfDate(v),
              ])
            )
          : d.answers,

        titleMessageId: Obj.hasKeyValue(a, 'titleMessageId', isString)
          ? a.titleMessageId
          : d.titleMessageId,
      };

export const pollToJson = (a: Poll): PollJson => ({
  id: a.id,
  title: a.title,
  updatedAt: a.updatedAt,
  dateOptions: a.dateOptions,
  answers: Obj.fromEntries(a.answers.map(answerOfDateToJson).toEntriesArray()),
  titleMessageId: a.titleMessageId,
});
