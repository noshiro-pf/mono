import * as t from '@noshiro/io-ts';

export const [answerIdTypeDef, toAnswerId] = t.simpleBrandedString(
  'AnswerId',
  ''
);

export type AnswerId = t.TypeOf<typeof answerIdTypeDef>;

export const isAnswerId = answerIdTypeDef.is;

const [nonNullUserIdTypeDef, toUserId] = t.simpleBrandedString('UserId', '');
export { toUserId };

export const userIdTypeDef = t.union({
  types: [nonNullUserIdTypeDef, t.nullType],
  defaultType: t.nullType,
});

export type UserId = t.TypeOf<typeof userIdTypeDef>;

export const isUserId = userIdTypeDef.is;

export const [userNameTypeDef, toUserName] = t.simpleBrandedString(
  'UserName',
  ''
);

export type UserName = t.TypeOf<typeof userNameTypeDef>;

export const isUserName = userNameTypeDef.is;

export const [weightTypeDef, toWeight] = t.simpleBrandedNumber('Weight', 1);

export type Weight = t.TypeOf<typeof weightTypeDef>;

export const isWeight = weightTypeDef.is;
