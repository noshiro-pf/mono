import { Arr, expectType } from 'ts-data-forge';
import { union } from '../compose/index.mjs';
import { undefinedType } from '../primitives/index.mjs';
import { type RecordType, type Type } from '../type.mjs';

export const valueof = <const R extends ReadonlyRecord<string, Type<unknown>>>(
  recordType: RecordType<R>,
  options?: PartialReadonly<{
    typeName: string;
  }>,
): ValueOfType<R> => {
  const types = Object.values(recordType.shape);

  if (Arr.isArrayAtLeastLength(types, 2)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return union(types, {
      typeName: options?.typeName ?? `ValueOf<${recordType.typeName}>`,
    }) satisfies ValueofTypeSub<R> as ValueOfType<R>;
  }

  if (Arr.isNonEmpty(types)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return types[0] satisfies ValueofTypeSub<R> as ValueOfType<R>;
  }

  // types is empty
  return undefinedType satisfies ValueOfType<R>;
};

type ValueofTypeSub<R extends ReadonlyRecord<string, Type<unknown>>> = Type<
  R[keyof R]['defaultValue']
>;

type ValueOfType<R extends ReadonlyRecord<string, Type<unknown>>> =
  IsNever<keyof R> extends true ? Type<undefined> : ValueofTypeSub<R>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
expectType<ValueOfType<{}>, Type<undefined>>('=');

expectType<
  ValueOfType<{ a: Type<0>; b: Type<1>; c: Type<2> }>,
  Type<0 | 1 | 2>
>('=');

expectType<
  ValueOfType<{ x: Type<string>; y: Type<number>; z: Type<boolean> }>,
  Type<string | number | boolean>
>('=');

expectType<
  ValueOfType<{ same: Type<string>; value: Type<string> }>,
  Type<string>
>('=');

expectType<ValueOfType<{ never: Type<never> }>, Type<never>>('=');
