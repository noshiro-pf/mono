import * as t from '@noshiro/io-ts';

type UserIdBrand = Phantomic<string, 'UserId'>;

export const userIdType = t.brand({
  codec: t.string(''),
  defaultValue: '' as UserIdBrand,
  is: (_id: string): _id is UserIdBrand => true,
  typeName: 'UserId',
});

export type UserId = t.TypeOf<typeof userIdType>;

export const toUserId: (id: string) => UserId = userIdType.fill;
