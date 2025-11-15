import { expectType } from '../expect-type.mjs';

// Test Uint32 type
expectType<Uint32, number>('<=');

expectType<number, Uint32>('!<='); // Not all numbers are Uint32

// Test that Uint32 is a branded type
type IsBrandedUint32 = Uint32 extends number
  ? number extends Uint32
    ? false
    : true
  : false;

expectType<IsBrandedUint32, true>('=');

// Test Uint32 extends SafeUint
expectType<Uint32, SafeUint>('<=');

expectType<SafeUint, Uint32>('!<=');

// Test PositiveUint32
expectType<PositiveUint32, Uint32>('<=');

expectType<PositiveUint32, PositiveNumber>('<=');

expectType<Uint32, PositiveUint32>('!<=');

// Test NonZeroUint32 is alias for PositiveUint32
expectType<NonZeroUint32, PositiveUint32>('=');

expectType<PositiveUint32, NonZeroUint32>('=');

// Test WithSmallInt variants (commented out complex tests)
// WithSmallInt tests are complex due to literal/branded type interactions

// Test brand structure exists (type is branded)
type Uint32IsBranded = number extends Uint32 ? false : true;

expectType<Uint32IsBranded, true>('=');

// Test range constraints (32-bit unsigned: 0 to 4,294,967,295)
// Note: Range constraints (32-bit unsigned: 0 to 4,294,967,295) are enforced at runtime
// through type guards, not compile time, so we can't test them with expectType

// Test practical usage scenarios (type-only tests)
// Functions using these types would be: RGBA colors, IP addresses, IDs, divisors
