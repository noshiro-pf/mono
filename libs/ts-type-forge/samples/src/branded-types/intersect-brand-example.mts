import { type Brand, type IntersectBrand } from 'ts-type-forge';

// embed-sample-code-ignore-above

type PositiveNumber = Brand<number, 'positive'>;
type IntegerNumber = Brand<number, 'integer'>;
type PositiveInteger = IntersectBrand<PositiveNumber, IntegerNumber>;
// Brand<number, 'positive' | 'integer'>

type Named = Brand<Readonly<{ name: string }>, 'named'>;
type Aged = Brand<Readonly<{ age: number }>, 'aged'>;
type Person = IntersectBrand<Named, Aged>;
// Brand<{ name: string } & { age: number }, 'named' | 'aged'>

// embed-sample-code-ignore-below
export type {
  Aged,
  IntegerNumber,
  Named,
  Person,
  PositiveInteger,
  PositiveNumber,
};
