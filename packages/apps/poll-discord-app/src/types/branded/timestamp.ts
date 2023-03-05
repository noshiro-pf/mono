import * as t from '@noshiro/io-ts';
import { DateUtils } from '@noshiro/ts-utils';

type TimestampBrand = Phantomic<number, 'Timestamp'>;

export const timestampType = t.brand({
  codec: t.number(DateUtils.now()),
  defaultValue: DateUtils.now() as TimestampBrand,
  is: (_id: number): _id is TimestampBrand => true,
  typeName: 'Timestamp',
});

export type Timestamp = t.TypeOf<typeof timestampType>;

export const toTimestamp: (id: number) => Timestamp = timestampType.fill;
