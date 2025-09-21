import { number } from '../primitives/index.mjs';
import { type Type } from '../type.mjs';
import { brand } from './brand.mjs';

export const brandedNumber = <K extends string>({
  typeName,
  defaultValue,
  is = (_u): _u is Brand<number, K> => true,
}: Readonly<{
  typeName: K;
  defaultValue: number;
  is?: (u: number) => u is Brand<number, K>;
}>): Type<Brand<number, K>> =>
  brand({
    baseType: number(defaultValue),

    defaultValue:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      defaultValue as Brand<number, K>,

    is,
    brandKeys: [typeName],
    typeName,
  });

/** Same as brandedNumber */
export const simpleBrandedNumber = brandedNumber;
