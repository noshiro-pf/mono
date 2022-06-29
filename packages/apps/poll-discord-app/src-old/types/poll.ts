import * as t from '@noshiro/io-ts';
import type { AnswerOfDate } from './answer-of-date';
import {
  answerOfDateJsonTypeDef,
  answerOfDateToJson,
  fillAnswerOfDate,
} from './answer-of-date';
import type { DateOption } from './date-option';
import { dateOptionTypeDef } from './date-option';
import type { DateOptionId, PollId, Timestamp, TitleMessageId } from './types';
import {
  createDateOptionId,
  dateOptionIdTypeDef,
  pollIdTypeDef,
  timestampTypeDef,
  titleMessageIdTypeDef,
} from './types';

export const pollJsonTypeDef = t.record({
  id: pollIdTypeDef,
  title: t.string(''),
  updatedAt: timestampTypeDef,
  dateOptions: t.array({ elementType: dateOptionTypeDef }),
  answers: t.keyValueRecord({
    keyType: dateOptionIdTypeDef,
    valueType: answerOfDateJsonTypeDef,
  }),
  titleMessageId: titleMessageIdTypeDef,
});

export type PollJson = t.TypeOf<typeof pollJsonTypeDef>;

assertType<TypeExtends<PollJson, ReadonlyJSONType>>();

const pollJsonDefaultValue: PollJson = pollJsonTypeDef.defaultValue;

export type Poll = DeepReadonly<{
  id: PollId;
  title: string;
  updatedAt: Timestamp; // timestamp
  dateOptions: DateOption[]; // used to find this Poll object from button message that represents date option
  answers: IMap<DateOptionId, AnswerOfDate>;
  titleMessageId: TitleMessageId;
}>;

export const pollFromJson = (a: PollJson): Poll => ({
  id: a.id,
  title: a.title,
  updatedAt: a.updatedAt,
  dateOptions: a.dateOptions,
  answers: IMap.new<DateOptionId, AnswerOfDate>(
    IRecord.entries(a.answers).map(([k, v]) =>
      tp(createDateOptionId(k), fillAnswerOfDate(v))
    )
  ),
  titleMessageId: a.titleMessageId,
});

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

export const pollDefaultValue: Poll = pollFromJson(pollJsonDefaultValue);

export const fillPoll = (a?: unknown): Poll =>
  pollFromJson(pollJsonTypeDef.fill(a));
