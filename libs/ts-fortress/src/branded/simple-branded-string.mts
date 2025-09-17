import { string } from '../primitives/index.mjs';
import { type Type } from '../type.mjs';
import { brand } from './brand.mjs';

export const simpleBrandedString = <K extends string>({
  typeName,
  defaultValue,
  is = (_u): _u is Brand<string, K> => true,
}: Readonly<{
  typeName: K;
  defaultValue: string;
  is?: (u: string) => u is Brand<string, K>;
}>): Type<Brand<string, K>> =>
  brand({
    baseType: string(defaultValue),

    defaultValue:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      defaultValue as Brand<string, K>,

    is,
    brandKeys: [typeName],
  });
