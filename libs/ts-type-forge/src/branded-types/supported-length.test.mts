import { expectType } from 'ts-data-forge';
import {
  type SupportedLength,
  type SupportedLengthCap,
} from './supported-length.mjs';

expectType<SupportedLengthCap, 2048>('=');

// Boundary membership
expectType<0, SupportedLength>('<=');

expectType<2048, SupportedLength>('<=');

expectType<2049, SupportedLength>('!<=');

expectType<-1, SupportedLength>('!<=');

// Non-integer and non-literal lengths are rejected
expectType<1.5, SupportedLength>('!<=');

expectType<number, SupportedLength>('!<=');

expectType<SupportedLength, number>('<=');
