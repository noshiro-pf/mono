import { expectType } from '../expect-type.mjs';

// Test BigInt64 type
expectType<BigInt64, bigint>('<=');
expectType<bigint, BigInt64>('!<='); // Not all bigints are BigInt64

// Test that BigInt64 is a branded type
type IsBrandedBigInt64 = BigInt64 extends bigint
  ? bigint extends BigInt64
    ? false
    : true
  : false;
expectType<IsBrandedBigInt64, true>('=');

// Test BigUint64 type
expectType<BigUint64, bigint>('<=');
expectType<bigint, BigUint64>('!<='); // Not all bigints are BigUint64

// Test that BigUint64 is a branded type
type IsBrandedBigUint64 = BigUint64 extends bigint
  ? bigint extends BigUint64
    ? false
    : true
  : false;
expectType<IsBrandedBigUint64, true>('=');

// Test they are different types
expectType<BigInt64, BigUint64>('!=');
expectType<BigUint64, BigInt64>('!=');

// Test brand structure exists (both types are branded)
type BigInt64IsBranded = bigint extends BigInt64 ? false : true;
type BigUint64IsBranded = bigint extends BigUint64 ? false : true;
expectType<BigInt64IsBranded, true>('=');
expectType<BigUint64IsBranded, true>('=');
