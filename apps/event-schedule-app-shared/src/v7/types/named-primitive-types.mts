import * as t from 'ts-fortress';

export const answerIdTypeDef = t.brandedString({
  typeName: 'AnswerId',
  defaultValue: '',
});

export const toAnswerId = answerIdTypeDef.cast;

export type AnswerId = t.TypeOf<typeof answerIdTypeDef>;

export const isAnswerId = answerIdTypeDef.is;

const nonNullUserIdTypeDef = t.brandedString({
  typeName: 'UserId',
  defaultValue: '',
});

export const toUserId = nonNullUserIdTypeDef.cast;

export const userIdTypeDef = t.union([nonNullUserIdTypeDef, t.nullType], {
  defaultType: t.nullType,
});

export type UserId = t.TypeOf<typeof userIdTypeDef>;

export const isUserId = userIdTypeDef.is;

export const userNameTypeDef = t.brandedString({
  typeName: 'UserName',
  defaultValue: '',
});

export const toUserName = userNameTypeDef.cast;

export type UserName = t.TypeOf<typeof userNameTypeDef>;

export const isUserName = userNameTypeDef.is;

export const weightTypeDef = t.brandedNumber({
  typeName: 'Weight',
  defaultValue: 1,
});

export const toWeight = weightTypeDef.cast;

export type Weight = t.TypeOf<typeof weightTypeDef>;

export const isWeight = weightTypeDef.is;
