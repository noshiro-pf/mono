import * as t from '@noshiro/io-ts';

export const commandMessageIdType = t.simpleBrandedString(
  'CommandMessageId',
  '',
);

export const toCommandMessageId = commandMessageIdType.cast;

export type CommandMessageId = t.TypeOf<typeof commandMessageIdType>;

export const dateOptionIdType = t.simpleBrandedString('DateOptionId', '');

export const toDateOptionId = dateOptionIdType.cast;

export type DateOptionId = t.TypeOf<typeof dateOptionIdType>;

export const pollIdType = t.simpleBrandedString('PollId', '');

export const toPollId = pollIdType.cast;

export type PollId = t.TypeOf<typeof pollIdType>;

export const timestampType = t.simpleBrandedNumber(
  'Timestamp',
  DateUtils.now(),
);

export const toTimestamp = timestampType.cast;

export type Timestamp = t.TypeOf<typeof timestampType>;

export const titleMessageIdType = t.simpleBrandedString('TitleMessageId', '');

export const toTitleMessageId = titleMessageIdType.cast;

export type TitleMessageId = t.TypeOf<typeof titleMessageIdType>;

export const userIdType = t.simpleBrandedString('UserId', '');

export const toUserId = userIdType.cast;

export type UserId = t.TypeOf<typeof userIdType>;
