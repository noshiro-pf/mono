import * as t from '@noshiro/io-ts';

type PollIdBrand = Phantomic<string, 'PollId'>;

export const pollIdType = t.brand({
  codec: t.string(''),
  defaultValue: '' as PollIdBrand,
  is: (_id: string): _id is PollIdBrand => true,
  typeName: 'PollId',
});

export type PollId = t.TypeOf<typeof pollIdType>;

export const toPollId: (id: string) => PollId = pollIdType.fill;
