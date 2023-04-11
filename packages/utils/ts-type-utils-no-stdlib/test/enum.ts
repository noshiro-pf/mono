import {
  type Int10,
  type Int8,
  type Int9,
  type MillisecondsEnum,
  type Uint10,
  type Uint8,
  type Uint9,
} from '../src';
import { expectType } from './expect-type';

expectType<0, MillisecondsEnum>('<=');
expectType<1, MillisecondsEnum>('<=');
expectType<999, MillisecondsEnum>('<=');
expectType<1000, MillisecondsEnum>('!<=');

expectType<0 | 1 | 255, Uint8>('<=');
expectType<0 | 1 | 511, Uint9>('<=');
expectType<0 | 1 | 1023, Uint10>('<=');
expectType<256, Uint8>('!<=');
expectType<512, Uint9>('!<=');
expectType<1024, Uint10>('!<=');

expectType<-128 | 0 | 1 | 127, Int8>('<=');
expectType<-256 | 0 | 1 | 255, Int9>('<=');
expectType<-512 | 0 | 1 | 511, Int10>('<=');
expectType<-129 | 128, Int8>('!<=');
expectType<-257 | 256, Int9>('!<=');
expectType<-513 | 512, Int10>('!<=');

expectType<Int8, Int9>('<=');
expectType<Int9, Int10>('<=');
expectType<Uint8, Uint9>('<=');
expectType<Uint9, Uint10>('<=');

expectType<Uint8, Int9>('<=');
expectType<Uint9, Int10>('<=');
