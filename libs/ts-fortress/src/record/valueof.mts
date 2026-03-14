import { Arr, expectType } from 'ts-data-forge';
import { union } from '../compose/index.mjs';
import { undefinedType } from '../primitives/index.mjs';
import { type RecordType, type Type, type UnknownShape } from '../type.mjs';

export const valueof = <const R extends UnknownShape>(
  recordType: RecordType<R>,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): ValueOfType<R> => {
  const types = Object.values(recordType.shape);

  if (Arr.isArrayAtLeastLength(types, 2)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return union(types, {
      typeName: options?.typeName ?? `ValueOf<${recordType.typeName}>`,
    }) satisfies ValueofTypeSub<R> as ValueOfType<R>;
  }

  if (Arr.isNonEmpty(types)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return types[0] satisfies ValueofTypeSub<R> as ValueOfType<R>;
  }

  // types is empty
  return undefinedType satisfies ValueOfType<R>;
};

type ValueofTypeSub<R extends UnknownShape> = Type<R[keyof R]['defaultValue']>;

type ValueOfType<R extends UnknownShape> =
  IsNever<keyof R> extends true ? Type<undefined> : ValueofTypeSub<R>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
expectType<ValueOfType<{}>, Type<undefined>>('=');

expectType<
  ValueOfType<Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>>,
  Type<0 | 1 | 2>
>('=');

expectType<
  ValueOfType<Readonly<{ x: Type<string>; y: Type<number>; z: Type<boolean> }>>,
  Type<string | number | boolean>
>('=');

expectType<
  ValueOfType<Readonly<{ same: Type<string>; value: Type<string> }>>,
  Type<string>
>('=');

expectType<ValueOfType<Readonly<{ never: Type<never> }>>, Type<never>>('=');
