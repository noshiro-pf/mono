import { type Brand, type UnwrapBrandKeys } from 'ts-type-forge';

// embed-sample-code-ignore-above

type MyBrand = Brand<string, 'validated' | 'normalized', 'empty'>;
type AllKeys = UnwrapBrandKeys<MyBrand>; // 'validated' | 'normalized' | 'empty'

// embed-sample-code-ignore-below
export type { AllKeys, MyBrand };
