import * as t from 'ts-fortress';
import { DateUtils } from '../utils/index.mjs';

export const commandMessageIdType = t.brandedString({
  typeName: 'CommandMessageId',
  defaultValue: '',
});

export const toCommandMessageId = commandMessageIdType.cast;

export type CommandMessageId = t.TypeOf<typeof commandMessageIdType>;

export const dateOptionIdType = t.brandedString({
  typeName: 'DateOptionId',
  defaultValue: '',
});

export const toDateOptionId = dateOptionIdType.cast;

export type DateOptionId = t.TypeOf<typeof dateOptionIdType>;

export const pollIdType = t.brandedString({
  typeName: 'PollId',
  defaultValue: '',
});

export const toPollId = pollIdType.cast;

export type PollId = t.TypeOf<typeof pollIdType>;

export const timestampType = t.brandedNumber({
  typeName: 'Timestamp',
  defaultValue: DateUtils.now(),
});

export const toTimestamp = timestampType.cast;

export type Timestamp = t.TypeOf<typeof timestampType>;

export const titleMessageIdType = t.brandedString({
  typeName: 'TitleMessageId',
  defaultValue: '',
});

export const toTitleMessageId = titleMessageIdType.cast;

export type TitleMessageId = t.TypeOf<typeof titleMessageIdType>;

export const userIdType = t.brandedString({
  typeName: 'UserId',
  defaultValue: '',
});

export const toUserId = userIdType.cast;

export type UserId = t.TypeOf<typeof userIdType>;
