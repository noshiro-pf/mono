import * as t from 'ts-fortress';

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

/**
 * Every write stamps `DateUtils.now()` itself; the default only fills a stored
 * value that has none, so it is the epoch, "unknown", rather than the moment
 * this long-running process happened to load the module.
 */
export const timestampType = t.brandedNumber({
  typeName: 'Timestamp',
  defaultValue: 0,
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
