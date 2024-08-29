import * as t from '@noshiro/io-ts';

export const answerIdTypeDef = t.simpleBrandedString('AnswerId', '');

export const toAnswerId = answerIdTypeDef.cast;

export type AnswerId = t.TypeOf<typeof answerIdTypeDef>;

export const isAnswerId = answerIdTypeDef.is;

const nonNullUserIdTypeDef = t.simpleBrandedString('UserId', '');

export const toUserId = nonNullUserIdTypeDef.cast;

export const userIdTypeDef = t.union([nonNullUserIdTypeDef, t.nullType], {
  defaultType: t.nullType,
});

export type UserId = t.TypeOf<typeof userIdTypeDef>;

export const isUserId = userIdTypeDef.is;

export const userNameTypeDef = t.simpleBrandedString('UserName', '');

export const toUserName = userNameTypeDef.cast;

export type UserName = t.TypeOf<typeof userNameTypeDef>;

export const isUserName = userNameTypeDef.is;

export const weightTypeDef = t.simpleBrandedNumber('Weight', 1);

export const toWeight = weightTypeDef.cast;

export type Weight = t.TypeOf<typeof weightTypeDef>;

export const isWeight = weightTypeDef.is;
