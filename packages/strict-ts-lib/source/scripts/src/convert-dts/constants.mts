import { type ConverterConfig } from './common.mjs';

export const typeUtilsName = '@noshiro/ts-type-utils';

export const configs = [
  {
    useBrandedNumber: false,
    commentOutDeprecated: false,
    returnType: 'mutable',
    useLocalPath: true,
  },
  {
    useBrandedNumber: true,
    commentOutDeprecated: false,
    returnType: 'readonly',
    useLocalPath: true,
  },
] as const satisfies Omit<ConverterConfig, 'forNpmPackage'>[];

export const libName = '@noshiro/strict-typescript-lib';

export const repo = 'https://github.com/noshiro-pf/mono.git';
export const license = 'MIT';
