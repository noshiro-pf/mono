import { type Brand } from 'ts-type-forge';
import { number } from '../primitives/index.mjs';
import { type Type } from '../type.mjs';
import { brand } from './brand.mjs';

export const brandedNumber = <K extends string>({
  defaultValue,
  is = (_u): _u is Brand<number, K> => true,
  typeName,
}: Readonly<{
  typeName: K;
  defaultValue: number;
  is?: (u: number) => u is Brand<number, K>;
}>): Type<Brand<number, K>> =>
  brand({
    baseType: number(defaultValue),

    defaultValue,

    is,
    brandKeys: [typeName],
    typeName,
  });

/**
 * Same as brandedNumber
 *
 * @deprecated use `brandedNumber`
 */
export const simpleBrandedNumber = brandedNumber;
