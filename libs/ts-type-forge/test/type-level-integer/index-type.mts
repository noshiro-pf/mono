import { expectType } from '../expect-type.mjs';

// --- Index ---
expectType<Index<3>, 0 | 1 | 2>('=');
expectType<Index<0>, never>('=');
expectType<Index<1>, 0>('=');
expectType<Index<1.2>, never>('='); // Non-integer length for MakeTuple
expectType<Index<-1>, never>('='); // Negative length for MakeTuple
expectType<Index<5>, 0 | 1 | 2 | 3 | 4>('=');

// --- IndexInclusive ---
expectType<IndexInclusive<3>, 0 | 1 | 2 | 3>('=');
expectType<IndexInclusive<0>, 0>('=');
expectType<IndexInclusive<1>, 0 | 1>('=');
expectType<IndexInclusive<1.2>, never>('='); // Non-integer length for MakeTuple
expectType<IndexInclusive<-1>, never>('='); // Negative length for MakeTuple
expectType<IndexInclusive<5>, 0 | 1 | 2 | 3 | 4 | 5>('=');

// --- NegativeIndex ---
expectType<NegativeIndex<3>, -1 | -2 | -3>('=');
expectType<NegativeIndex<0>, never>('=');
expectType<NegativeIndex<1>, -1>('=');
expectType<NegativeIndex<1.2>, never>('='); // Non-integer length for MakeTuple
expectType<NegativeIndex<5>, -1 | -2 | -3 | -4 | -5>('=');
expectType<NegativeIndex<-1>, never>('='); // Negative length for MakeTuple
expectType<NegativeIndex<-5.1>, never>('=');
