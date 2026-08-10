import { expectType } from 'ts-data-forge';
import { type Float16, type Float32, type Float64 } from './float.mjs';

// Test Float16 type
expectType<Float16, number>('<=');

expectType<number, Float16>('!<='); // Not all numbers are Float16

// Test that Float16 is a branded type
type IsBrandedFloat16 = Float16 extends number
  ? number extends Float16
    ? false
    : true
  : false;

expectType<IsBrandedFloat16, true>('=');

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
expectType<Float16, Float32>('!=');

expectType<Float32, Float16>('!=');

expectType<Float16, Float64>('!=');

expectType<Float64, Float16>('!=');

expectType<Float32, Float64>('!=');

expectType<Float64, Float32>('!=');

// Test brand structure exists (both types are branded)
type Float16IsBranded = number extends Float16 ? false : true;

type Float32IsBranded = number extends Float32 ? false : true;

type Float64IsBranded = number extends Float64 ? false : true;

expectType<Float16IsBranded, true>('=');

expectType<Float32IsBranded, true>('=');

expectType<Float64IsBranded, true>('=');

// Test practical usage with arrays
type Float16Array_elements = readonly Float16[];

type Float32Array_elements = readonly Float32[];

type Float64Array_elements = readonly Float64[];

expectType<Float16Array_elements, readonly number[]>('<=');

expectType<Float32Array_elements, readonly number[]>('<=');

expectType<Float64Array_elements, readonly number[]>('<=');

expectType<readonly number[], Float16Array_elements>('!<=');

expectType<readonly number[], Float32Array_elements>('!<=');

expectType<readonly number[], Float64Array_elements>('!<=');

// Test that Float16, Float32 and Float64 can't be assigned to each other
expectType<Float16, Float32>('!=');

expectType<Float32, Float16>('!=');

expectType<Float16, Float64>('!=');

expectType<Float64, Float16>('!=');

expectType<Float32, Float64>('!=');

expectType<Float64, Float32>('!=');
