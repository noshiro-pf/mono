import { hasKey, IRecord, isRecord, tp } from '@noshiro/ts-utils';
import type { Type, Typeof } from './type';

type RecordResultType<A extends ReadonlyRecord<string, Type<unknown>>> =
  Readonly<{ [key in keyof A]: Typeof<A[key]> }>;

export const record = <A extends ReadonlyRecord<string, Type<unknown>>>(
  recordType: A
): Type<RecordResultType<A>> => {
  const defaultValue = IRecord.fromEntries(
    IRecord.entries(recordType).map(([key, value]) =>
      tp(key, value.defaultValue)
    )
  ) as RecordResultType<A>;

  const is = (a: unknown): a is RecordResultType<A> =>
    isRecord(a) &&
    IRecord.entries(recordType).every(
      ([key, value]) => hasKey(a, key) && value.is(a[key])
    );

  const fill = (a: unknown): RecordResultType<A> =>
    isRecord(a)
      ? (IRecord.fromEntries(
          IRecord.entries(recordType).map(([k, v]) =>
            tp(k, hasKey(a, k) ? v.fill(a[k]) : v.defaultValue)
          )
        ) as RecordResultType<A>)
      : defaultValue;

  return { defaultValue, is, fill };
};
