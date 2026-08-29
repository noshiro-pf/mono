import * as t from 'ts-fortress';

export const AnswerId = t.brandedString({
  typeName: 'AnswerId',
  defaultValue: '',
});

export type AnswerId = t.TypeOf<typeof AnswerId>;

const NonNullUserId = t.brandedString({ typeName: 'UserId', defaultValue: '' });

export const UserId = t.union([NonNullUserId, t.nullType], {
  defaultType: t.nullType,
});

export type UserId = t.TypeOf<typeof UserId>;

export const UserName = t.brandedString({
  typeName: 'UserName',
  defaultValue: '',
});

export type UserName = t.TypeOf<typeof UserName>;

export const Weight = t.brandedNumber({ typeName: 'Weight', defaultValue: 1 });

export type Weight = t.TypeOf<typeof Weight>;
