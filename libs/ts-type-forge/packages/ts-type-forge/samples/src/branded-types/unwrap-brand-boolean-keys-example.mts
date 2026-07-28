import { type Brand, type UnwrapBrandBooleanKeys } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Brand1 = Brand<number, 'key1', never>;
type Brand2 = Brand<number, never, 'key1'>;
type UnionBrand = Brand1 | Brand2;
type BooleanKeys = UnwrapBrandBooleanKeys<UnionBrand>; // 'key1' (since it's true | false)

// embed-sample-code-ignore-below
export type { BooleanKeys, Brand1, Brand2, UnionBrand };
