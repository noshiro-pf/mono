import * as t from '@noshiro/io-ts';

export const answerIdTypeDef = t.string('');

export type AnswerId = t.Typeof<typeof answerIdTypeDef>;

export const isAnswerId = answerIdTypeDef.is;

export const userIdTypeDef = t.union({
  types: [t.string(''), t.nullType],
  defaultType: t.nullType,
});

export type UserId = t.Typeof<typeof userIdTypeDef>;

export const isUserId = userIdTypeDef.is;

export const userNameTypeDef = t.string('');

export type UserName = t.Typeof<typeof userNameTypeDef>;

export const isUserName = userNameTypeDef.is;

export const weightTypeDef = t.number(1);

export type Weight = t.Typeof<typeof weightTypeDef>;

export const isWeight = weightTypeDef.is;
