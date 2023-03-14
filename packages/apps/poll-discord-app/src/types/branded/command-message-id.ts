import * as t from '@noshiro/io-ts';

type CommandMessageIdBrand = Phantomic<string, 'CommandMessageId'>;

export const commandMessageIdType = t.brand({
  codec: t.string(''),
  defaultValue: '' as CommandMessageIdBrand,
  is: (_id: string): _id is CommandMessageIdBrand => true,
  typeName: 'CommandMessageId',
});

export type CommandMessageId = t.TypeOf<typeof commandMessageIdType>;

export const toCommandMessageId: (id: string) => CommandMessageId =
  commandMessageIdType.fill;
