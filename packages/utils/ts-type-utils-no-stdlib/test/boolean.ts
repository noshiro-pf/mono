/* eslint-disable @typescript-eslint/ban-ts-comment */
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

{
  expectType<BoolNot<true>, false>('=');
  expectType<BoolNot<false>, true>('=');

  expectType<BoolNot<never>, never>('=');
  expectType<BoolNot<boolean>, never>('=');

  // @ts-expect-error
  expectType<BoolNot<'true'>, never>('=');
}
{
  expectType<BoolAnd<true, true>, true>('=');
  expectType<BoolAnd<true, false>, false>('=');
  expectType<BoolAnd<false, true>, false>('=');
  expectType<BoolAnd<false, false>, false>('=');

  expectType<BoolAnd<never, never>, never>('=');
  expectType<BoolAnd<never, true>, never>('=');
  expectType<BoolAnd<never, false>, never>('=');
  expectType<BoolAnd<never, boolean>, never>('=');
  expectType<BoolAnd<true, never>, never>('=');
  expectType<BoolAnd<true, boolean>, never>('=');
  expectType<BoolAnd<false, never>, never>('=');
  expectType<BoolAnd<false, boolean>, never>('=');
  expectType<BoolAnd<boolean, never>, never>('=');
  expectType<BoolAnd<boolean, true>, never>('=');
  expectType<BoolAnd<boolean, false>, never>('=');
  expectType<BoolAnd<boolean, boolean>, never>('=');

  // @ts-expect-error
  expectType<BoolAnd<'true', true>, never>('=');
  // @ts-expect-error
  expectType<BoolAnd<true, 'true'>, never>('=');
  // @ts-expect-error
  expectType<BoolAnd<'true', 'true'>, never>('=');
}
{
  expectType<BoolOr<true, true>, true>('=');
  expectType<BoolOr<true, false>, true>('=');
  expectType<BoolOr<false, true>, true>('=');
  expectType<BoolOr<false, false>, false>('=');

  expectType<BoolOr<never, never>, never>('=');
  expectType<BoolOr<never, true>, never>('=');
  expectType<BoolOr<never, false>, never>('=');
  expectType<BoolOr<never, boolean>, never>('=');
  expectType<BoolOr<true, never>, never>('=');
  expectType<BoolOr<true, boolean>, never>('=');
  expectType<BoolOr<false, never>, never>('=');
  expectType<BoolOr<false, boolean>, never>('=');
  expectType<BoolOr<boolean, never>, never>('=');
  expectType<BoolOr<boolean, true>, never>('=');
  expectType<BoolOr<boolean, false>, never>('=');
  expectType<BoolOr<boolean, boolean>, never>('=');

  // @ts-expect-error
  expectType<BoolOr<'true', true>, never>('=');
  // @ts-expect-error
  expectType<BoolOr<true, 'true'>, never>('=');
  // @ts-expect-error
  expectType<BoolOr<'true', 'true'>, never>('=');
}
{
  expectType<BoolNand<true, true>, false>('=');
  expectType<BoolNand<true, false>, true>('=');
  expectType<BoolNand<false, true>, true>('=');
  expectType<BoolNand<false, false>, true>('=');

  expectType<BoolNand<never, never>, never>('=');
  expectType<BoolNand<never, true>, never>('=');
  expectType<BoolNand<never, false>, never>('=');
  expectType<BoolNand<never, boolean>, never>('=');
  expectType<BoolNand<true, never>, never>('=');
  expectType<BoolNand<true, boolean>, never>('=');
  expectType<BoolNand<false, never>, never>('=');
  expectType<BoolNand<false, boolean>, never>('=');
  expectType<BoolNand<boolean, never>, never>('=');
  expectType<BoolNand<boolean, true>, never>('=');
  expectType<BoolNand<boolean, false>, never>('=');
  expectType<BoolNand<boolean, boolean>, never>('=');

  // @ts-expect-error
  expectType<BoolNand<'true', true>, never>('=');
  // @ts-expect-error
  expectType<BoolNand<true, 'true'>, never>('=');
  // @ts-expect-error
  expectType<BoolNand<'true', 'true'>, never>('=');
}
{
  expectType<BoolNor<true, true>, false>('=');
  expectType<BoolNor<true, false>, false>('=');
  expectType<BoolNor<false, true>, false>('=');
  expectType<BoolNor<false, false>, true>('=');

  expectType<BoolNor<never, never>, never>('=');
  expectType<BoolNor<never, true>, never>('=');
  expectType<BoolNor<never, false>, never>('=');
  expectType<BoolNor<never, boolean>, never>('=');
  expectType<BoolNor<true, never>, never>('=');
  expectType<BoolNor<true, boolean>, never>('=');
  expectType<BoolNor<false, never>, never>('=');
  expectType<BoolNor<false, boolean>, never>('=');
  expectType<BoolNor<boolean, never>, never>('=');
  expectType<BoolNor<boolean, true>, never>('=');
  expectType<BoolNor<boolean, false>, never>('=');
  expectType<BoolNor<boolean, boolean>, never>('=');

  // @ts-expect-error
  expectType<BoolNor<'true', true>, never>('=');
  // @ts-expect-error
  expectType<BoolNor<true, 'true'>, never>('=');
  // @ts-expect-error
  expectType<BoolNor<'true', 'true'>, never>('=');
}
{
  expectType<BoolEq<true, true>, true>('=');
  expectType<BoolEq<true, false>, false>('=');
  expectType<BoolEq<false, true>, false>('=');
  expectType<BoolEq<false, false>, true>('=');

  expectType<BoolEq<never, never>, never>('=');
  expectType<BoolEq<never, true>, never>('=');
  expectType<BoolEq<never, false>, never>('=');
  expectType<BoolEq<never, boolean>, never>('=');
  expectType<BoolEq<true, never>, never>('=');
  expectType<BoolEq<true, boolean>, never>('=');
  expectType<BoolEq<false, never>, never>('=');
  expectType<BoolEq<false, boolean>, never>('=');
  expectType<BoolEq<boolean, never>, never>('=');
  expectType<BoolEq<boolean, true>, never>('=');
  expectType<BoolEq<boolean, false>, never>('=');
  expectType<BoolEq<boolean, boolean>, never>('=');

  // @ts-expect-error
  expectType<BoolEq<'true', true>, never>('=');
  // @ts-expect-error
  expectType<BoolEq<true, 'true'>, never>('=');
  // @ts-expect-error
  expectType<BoolEq<'true', 'true'>, never>('=');
}
{
  expectType<BoolNeq<true, true>, false>('=');
  expectType<BoolNeq<true, false>, true>('=');
  expectType<BoolNeq<false, true>, true>('=');
  expectType<BoolNeq<false, false>, false>('=');

  expectType<BoolNeq<never, never>, never>('=');
  expectType<BoolNeq<never, true>, never>('=');
  expectType<BoolNeq<never, false>, never>('=');
  expectType<BoolNeq<never, boolean>, never>('=');
  expectType<BoolNeq<true, never>, never>('=');
  expectType<BoolNeq<true, boolean>, never>('=');
  expectType<BoolNeq<false, never>, never>('=');
  expectType<BoolNeq<false, boolean>, never>('=');
  expectType<BoolNeq<boolean, never>, never>('=');
  expectType<BoolNeq<boolean, true>, never>('=');
  expectType<BoolNeq<boolean, false>, never>('=');
  expectType<BoolNeq<boolean, boolean>, never>('=');

  // @ts-expect-error
  expectType<BoolNeq<'true', true>, never>('=');
  // @ts-expect-error
  expectType<BoolNeq<true, 'true'>, never>('=');
  // @ts-expect-error
  expectType<BoolNeq<'true', 'true'>, never>('=');
}
