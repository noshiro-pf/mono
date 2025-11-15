import { expectType } from '../expect-type.mjs';

// Test SmallInt with different constraints
expectType<SmallInt<''>, number>('<=');

expectType<SmallInt<'!=0'>, number>('<=');

expectType<SmallInt<'<0'>, number>('<=');

expectType<SmallInt<'<=0'>, number>('<=');

expectType<SmallInt<'>0'>, number>('<=');

expectType<SmallInt<'>=0'>, number>('<=');

// Test SmallUint is alias for SmallInt<'>=0'>
expectType<SmallUint, SmallInt<'>=0'>>('=');

expectType<SmallInt<'>=0'>, SmallUint>('=');

// Test literal values are included
expectType<0, SmallInt<''>>('<=');

expectType<1, SmallInt<''>>('<=');

expectType<-1, SmallInt<''>>('<=');

expectType<39, SmallInt<''>>('<=');

expectType<-39, SmallInt<''>>('<=');

// Test constraint logic
expectType<0, SmallInt<'!=0'>>('!<=');

expectType<1, SmallInt<'!=0'>>('<=');

expectType<-1, SmallInt<'!=0'>>('<=');

expectType<0, SmallInt<'<0'>>('!<=');

expectType<1, SmallInt<'<0'>>('!<=');

expectType<-1, SmallInt<'<0'>>('<=');

expectType<0, SmallInt<'<=0'>>('<=');

expectType<1, SmallInt<'<=0'>>('!<=');

expectType<-1, SmallInt<'<=0'>>('<=');

expectType<0, SmallInt<'>0'>>('!<=');

expectType<1, SmallInt<'>0'>>('<=');

expectType<-1, SmallInt<'>0'>>('!<=');

expectType<0, SmallInt<'>=0'>>('<=');

expectType<1, SmallInt<'>=0'>>('<=');

expectType<-1, SmallInt<'>=0'>>('!<=');

// Test WithSmallInt enhances branded types (commented out complex tests)
// WithSmallInt tests are complex due to literal/branded type interactions

// Test that WithSmallInt includes literals
expectType<0, WithSmallInt<Int>>('<=');

expectType<1, WithSmallInt<Int>>('<=');

expectType<-1, WithSmallInt<Int>>('<=');

expectType<39, WithSmallInt<Int>>('<=');

expectType<-39, WithSmallInt<Int>>('<=');

expectType<0, WithSmallInt<Uint>>('<=');

expectType<1, WithSmallInt<Uint>>('<=');

expectType<39, WithSmallInt<Uint>>('<=');

expectType<-1, WithSmallInt<Uint>>('!<='); // Uint is non-negative

expectType<1, WithSmallInt<PositiveInt>>('<=');

expectType<39, WithSmallInt<PositiveInt>>('<=');

expectType<0, WithSmallInt<PositiveInt>>('!<='); // PositiveInt excludes 0

expectType<-1, WithSmallInt<PositiveInt>>('!<='); // PositiveInt excludes negatives

// Test ExcludeSmallInt removes literals
expectType<ExcludeSmallInt<IntWithSmallInt>, Int>('<=');

expectType<Int, ExcludeSmallInt<IntWithSmallInt>>('<=');

// Test custom MaxIndex
type SmallRange = SmallInt<'', 5>;

expectType<4, SmallRange>('<=');

expectType<-4, SmallRange>('<=');

expectType<0, SmallRange>('<=');

// Test WithSmallInt with custom MaxIndex
type CustomWithSmallInt = WithSmallInt<Int, 5>;

expectType<4, CustomWithSmallInt>('<=');

expectType<-4, CustomWithSmallInt>('<=');

expectType<0, CustomWithSmallInt>('<=');

// Test practical usage scenarios
type DiceValue = SmallInt<'>0', 7>;

type Temperature = SmallInt<'', 101>;

type Countdown = SmallInt<'>=0', 11>;

type Offset = SmallInt<'!=0', 6>;

expectType<1, DiceValue>('<=');

expectType<6, DiceValue>('<=');

expectType<0, DiceValue>('!<=');

expectType<0, Temperature>('<=');

expectType<100, Temperature>('<=');

expectType<-100, Temperature>('<=');

expectType<0, Countdown>('<=');

expectType<10, Countdown>('<=');

expectType<-1, Countdown>('!<=');

expectType<1, Offset>('<=');

expectType<-1, Offset>('<=');

expectType<5, Offset>('<=');

expectType<-5, Offset>('<=');

expectType<0, Offset>('!<=');
