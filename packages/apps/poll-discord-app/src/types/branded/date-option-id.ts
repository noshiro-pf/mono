import * as t from '@noshiro/io-ts';

type DateOptionIdBrand = Phantomic<string, 'DateOptionId'>;

export const dateOptionIdType = t.brand({
  codec: t.string(''),
  defaultValue: '' as DateOptionIdBrand,
  is: (_id: string): _id is DateOptionIdBrand => true,
  typeName: 'DateOptionId',
});

export type DateOptionId = t.TypeOf<typeof dateOptionIdType>;

export const toDateOptionId: (id: string) => DateOptionId =
  dateOptionIdType.fill;
