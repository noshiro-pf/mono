import {
  DateUtils,
  expectType,
  IMap,
  mapOptional,
  Obj,
  pipe,
} from '@noshiro/ts-utils';
import {
  answerOfDateToJson,
  fillAnswerOfDate,
  type AnswerOfDate,
  type AnswerOfDateJson,
  type PartialAnswerOfDateJson,
} from './answer-of-date';
import {
  fillDateOption,
  type DateOption,
  type PartialDateOption,
} from './date-option';
import {
  createDateOptionId,
  createPollId,
  createTimestamp,
  createTitleMessageId,
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

expectType<PollJson, JSONType>('<=');

export type PartialPollJson = Partial<
  DeepReadonly<{
    id: PollId;
    title: string;
    updatedAt: Timestamp;
    dateOptions: PartialDateOption[];
    answers: Record<DateOptionId, PartialAnswerOfDateJson>;
    titleMessageId: TitleMessageId;
  }>
>;

const pollDefaultValue: Poll = {
  id: createPollId(''),
  title: '',
  updatedAt: createTimestamp(DateUtils.now()),
  dateOptions: [],
  answers: IMap.new<DateOptionId, AnswerOfDate>([]),
  titleMessageId: createTitleMessageId(''),
} as const;

const d = pollDefaultValue;

export const fillPoll = (p?: PartialPollJson): Poll => ({
  id: p?.id ?? d.id,
  title: p?.title ?? d.title,
  updatedAt: p?.updatedAt ?? d.updatedAt,
  dateOptions:
    pipe(p?.dateOptions).chain((v) =>
      mapOptional(v, (a) => a.map(fillDateOption))
    ).value ?? d.dateOptions,
  answers:
    pipe(p?.answers)
      .chain((v) => mapOptional(v, Obj.entries))
      .chain((a) =>
        mapOptional(a, (entries) =>
          IMap.new<DateOptionId, AnswerOfDate>(
            entries.map(([k, v]) => [
              createDateOptionId(k),
              fillAnswerOfDate(v),
            ])
          )
        )
      ).value ?? d.answers,
  titleMessageId: p?.titleMessageId ?? d.titleMessageId,
});

export const pollToJson = (p: Poll): PollJson => ({
  id: p.id,
  title: p.title,
  updatedAt: p.updatedAt,
  dateOptions: p.dateOptions,
  answers: Obj.fromEntries(p.answers.map(answerOfDateToJson).toEntriesArray()),
  titleMessageId: p.titleMessageId,
});
