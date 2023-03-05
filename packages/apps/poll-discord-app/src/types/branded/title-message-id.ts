import * as t from '@noshiro/io-ts';

type TitleMessageIdBrand = Phantomic<string, 'TitleMessageId'>;

export const titleMessageIdType = t.brand({
  codec: t.string(''),
  defaultValue: '' as TitleMessageIdBrand,
  is: (_id: string): _id is TitleMessageIdBrand => true,
  typeName: 'TitleMessageId',
});

export type TitleMessageId = t.TypeOf<typeof titleMessageIdType>;

export const toTitleMessageId: (id: string) => TitleMessageId =
  titleMessageIdType.fill;
