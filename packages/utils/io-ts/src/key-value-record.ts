import { IRecord, isRecord } from '@noshiro/ts-utils';
import type { Type, Typeof } from './type';

type RecordResultType<
  K extends Type<string>,
  V extends Type<unknown>
> = Readonly<Record<Typeof<K>, Typeof<V>>>;

export const keyValueRecord = <
  K extends Type<string>,
  V extends Type<unknown>
>({
  keyType,
  valueType,
}: Readonly<{ keyType: K; valueType: V }>): Type<RecordResultType<K, V>> => {
  const defaultValue = {} as RecordResultType<K, V>;

  const is = (a: unknown): a is RecordResultType<K, V> =>
    isRecord(a) &&
    IRecord.entries(a).every(
      ([key, value]) => keyType.is(key) && valueType.is(value)
    );

  const fill = (a: unknown): RecordResultType<K, V> =>
    isRecord(a)
      ? (IRecord.fromEntries(
          IRecord.entries(a).filter(
            ([k, v]) => keyType.is(k) && valueType.is(v)
          )
        ) as RecordResultType<K, V>)
      : defaultValue;

  return { defaultValue, is, fill };
};
