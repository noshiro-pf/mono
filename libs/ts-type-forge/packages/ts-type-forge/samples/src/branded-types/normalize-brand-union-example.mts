import { type Brand, type NormalizeBrandUnion } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Brand1 = Brand<number, 'validated', 'empty'>;
type Brand2 = Brand<number, 'empty', 'validated'>;
type UnionBrand = Brand1 | Brand2;
type Normalized = NormalizeBrandUnion<UnionBrand>;
// Both 'validated' and 'empty' are removed since they're true | false

// embed-sample-code-ignore-below
export type { Brand1, Brand2, Normalized, UnionBrand };
