import { expectType } from '../expect-type.mjs';

// Test Float32 type
expectType<Float32, number>('<=');
expectType<number, Float32>('!<='); // Not all numbers are Float32

// Test that Float32 is a branded type
type IsBrandedFloat32 = Float32 extends number
  ? number extends Float32
    ? false
    : true
  : false;
expectType<IsBrandedFloat32, true>('=');

// Test Float64 type
expectType<Float64, number>('<=');
expectType<number, Float64>('!<='); // Not all numbers are Float64

// Test that Float64 is a branded type
type IsBrandedFloat64 = Float64 extends number
  ? number extends Float64
    ? false
    : true
  : false;
expectType<IsBrandedFloat64, true>('=');

// Test they are different types
expectType<Float32, Float64>('!=');
expectType<Float64, Float32>('!=');

// Test brand structure exists (both types are branded)
type Float32IsBranded = number extends Float32 ? false : true;
type Float64IsBranded = number extends Float64 ? false : true;
expectType<Float32IsBranded, true>('=');
expectType<Float64IsBranded, true>('=');

// Test practical usage with arrays
type Float32Array_elements = Float32[];
type Float64Array_elements = Float64[];

expectType<Float32Array_elements, number[]>('<=');
expectType<Float64Array_elements, number[]>('<=');
expectType<number[], Float32Array_elements>('!<=');
expectType<number[], Float64Array_elements>('!<=');

// Test that Float32 and Float64 can't be assigned to each other
expectType<Float32, Float64>('!=');
expectType<Float64, Float32>('!=');
