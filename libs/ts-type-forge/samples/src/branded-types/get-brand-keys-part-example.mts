import { type Brand, type GetBrandKeysPart } from 'ts-type-forge';

// embed-sample-code-ignore-above

type MyBrand = Brand<string, 'validated'>;
type KeysPart = GetBrandKeysPart<MyBrand>; // { validated: true }

// embed-sample-code-ignore-below
export type { KeysPart, MyBrand };
