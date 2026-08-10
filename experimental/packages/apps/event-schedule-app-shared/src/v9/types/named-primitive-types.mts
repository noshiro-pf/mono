import * as t from '@noshiro/io-ts';

export const AnswerId = t.simpleBrandedString('AnswerId', '');

export type AnswerId = t.TypeOf<typeof AnswerId>;

const NonNullUserId = t.simpleBrandedString('UserId', '');

export const UserId = t.union([NonNullUserId, t.nullType], {
  defaultType: t.nullType,
});

export type UserId = t.TypeOf<typeof UserId>;

export const UserName = t.simpleBrandedString('UserName', '');

export type UserName = t.TypeOf<typeof UserName>;

export const Weight = t.simpleBrandedNumber('Weight', 1);

export type Weight = t.TypeOf<typeof Weight>;
