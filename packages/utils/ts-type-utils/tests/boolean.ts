import {
  type BoolAnd,
  type BoolEq,
  type BoolNand,
  type BoolNeq,
  type BoolNor,
  type BoolNot,
  type BoolOr,
} from '../src';
import { expectType } from './expect-type';

expectType<BoolNot<true>, false>('=');
expectType<BoolNot<false>, true>('=');

expectType<BoolAnd<true, true>, true>('=');
expectType<BoolAnd<true, false>, false>('=');
expectType<BoolAnd<false, true>, false>('=');
expectType<BoolAnd<false, false>, false>('=');

expectType<BoolOr<true, true>, true>('=');
expectType<BoolOr<true, false>, true>('=');
expectType<BoolOr<false, true>, true>('=');
expectType<BoolOr<false, false>, false>('=');

expectType<BoolNand<true, true>, false>('=');
expectType<BoolNand<true, false>, true>('=');
expectType<BoolNand<false, true>, true>('=');
expectType<BoolNand<false, false>, true>('=');

expectType<BoolNor<true, true>, false>('=');
expectType<BoolNor<true, false>, false>('=');
expectType<BoolNor<false, true>, false>('=');
expectType<BoolNor<false, false>, true>('=');

expectType<BoolEq<true, true>, true>('=');
expectType<BoolEq<true, false>, false>('=');
expectType<BoolEq<false, true>, false>('=');
expectType<BoolEq<false, false>, true>('=');

expectType<BoolNeq<true, true>, false>('=');
expectType<BoolNeq<true, false>, true>('=');
expectType<BoolNeq<false, true>, true>('=');
expectType<BoolNeq<false, false>, false>('=');
