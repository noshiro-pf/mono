import * as t from '@noshiro/io-ts';

import {
  answerOfDateFromJson,
  answerOfDateJsonType,
  answerOfDateToJson,
  type AnswerOfDate,
} from './answer-of-date';
import {
  dateOptionIdType,
  pollIdType,
  timestampType,
  titleMessageIdType,
  type DateOptionId,
  type PollId,
  type Timestamp,
  type TitleMessageId,
} from './branded-types';
import { dateOptionType, type DateOption } from './date-option';

export type Poll = DeepReadonly<{
  id: PollId;
  title: string;
  updatedAt: Timestamp;
  dateOptions: DateOption[]; // used to find this Poll object from button message that represents date option
  answers: IMap<DateOptionId, AnswerOfDate>;
  titleMessageId: TitleMessageId;
}>;

export const pollJsonType = t.record({
  id: pollIdType,
  title: t.string(''),
  updatedAt: timestampType,
  dateOptions: t.array(dateOptionType),
  answers: t.keyValueRecord(dateOptionIdType, answerOfDateJsonType),
  titleMessageId: titleMessageIdType,
});

export type PollJson = t.TypeOf<typeof pollJsonType>;

expectType<PollJson, JSONType>('<=');

export const pollFromJson = (p?: unknown): Poll =>
  pipe(p)
    .chain(pollJsonType.fill)
    .chain((a) => ({
      id: a.id,
      title: a.title,
      updatedAt: a.updatedAt,
      dateOptions: a.dateOptions,
      answers: IMap.new<DateOptionId, AnswerOfDate>(
        Obj.entries(a.answers).map(([k, v]) => [k, answerOfDateFromJson(v)])
      ),
      titleMessageId: a.titleMessageId,
    })).value;

export const pollToJson = (p: Poll): PollJson => ({
  id: p.id,
  title: p.title,
  updatedAt: p.updatedAt,
  dateOptions: p.dateOptions,
  answers: Obj.fromEntries(p.answers.map(answerOfDateToJson).toEntriesArray()),
  titleMessageId: p.titleMessageId,
});
