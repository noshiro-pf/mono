import { expectType } from '../expect-type.mjs';

// Test Uint16 type
expectType<Uint16, number>('<=');
expectType<number, Uint16>('!<='); // Not all numbers are Uint16

// Test that Uint16 is a branded type
type IsBrandedUint16 = Uint16 extends number
  ? number extends Uint16
    ? false
    : true
  : false;
expectType<IsBrandedUint16, true>('=');

// Test Uint16 extends Uint32
expectType<Uint16, Uint32>('<=');
expectType<Uint32, Uint16>('!<=');

// Test PositiveUint16
expectType<PositiveUint16, Uint16>('<=');
expectType<PositiveUint16, PositiveNumber>('<=');
expectType<Uint16, PositiveUint16>('!<=');

// Test NonZeroUint16 is alias for PositiveUint16
expectType<NonZeroUint16, PositiveUint16>('=');
expectType<PositiveUint16, NonZeroUint16>('=');

// Test WithSmallInt variants (commented out complex tests)
// WithSmallInt tests are complex due to literal/branded type interactions

// Test brand structure exists (type is branded)
type Uint16IsBranded = number extends Uint16 ? false : true;
expectType<Uint16IsBranded, true>('=');

// Test range constraints (16-bit unsigned: 0 to 65535)
// Note: Range constraints (16-bit unsigned: 0 to 65535) are enforced at runtime
// through type guards, not compile time, so we can't test them with expectType

// Test practical usage scenarios (type-only tests)
// Functions using these types would be: network ports, character codes, TCP ports, network IDs
