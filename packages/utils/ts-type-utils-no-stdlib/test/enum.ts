import { type MillisecondsEnum } from '../src';
import { expectType } from './expect-type';

expectType<0, MillisecondsEnum>('<=');
expectType<1, MillisecondsEnum>('<=');
expectType<999, MillisecondsEnum>('<=');
expectType<1000, MillisecondsEnum>('!<=');
