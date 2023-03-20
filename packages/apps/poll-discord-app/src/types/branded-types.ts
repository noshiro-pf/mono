import * as t from '@noshiro/io-ts';
import { DateUtils } from '@noshiro/ts-utils';

export const [commandMessageIdType, toCommandMessageId] = t.simpleBrandedString(
  'CommandMessageId',
  ''
);

export type CommandMessageId = t.TypeOf<typeof commandMessageIdType>;

export const [dateOptionIdType, toDateOptionId] = t.simpleBrandedString(
  'DateOptionId',
  ''
);

export type DateOptionId = t.TypeOf<typeof dateOptionIdType>;

export const [pollIdType, toPollId] = t.simpleBrandedString('PollId', '');

export type PollId = t.TypeOf<typeof pollIdType>;

export const [timestampType, toTimestamp] = t.simpleBrandedNumber(
  'Timestamp',
  DateUtils.now()
);

export type Timestamp = t.TypeOf<typeof timestampType>;

export const [titleMessageIdType, toTitleMessageId] = t.simpleBrandedString(
  'TitleMessageId',
  ''
);

export type TitleMessageId = t.TypeOf<typeof titleMessageIdType>;

export const [userIdType, toUserId] = t.simpleBrandedString('UserId', '');

export type UserId = t.TypeOf<typeof userIdType>;
