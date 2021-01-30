import { FunctionType } from '../types';

export const pipe: Pipe = (
  x: unknown,
  ...fns: FunctionType<unknown, unknown>[]
) => fns.reduce((curr, f) => f(curr), x);

export interface Pipe {
  <T0, T1>(x: T0, f1: FunctionType<T0, T1>): T1;
  <T0, T1, T2>(x: T0, f1: FunctionType<T0, T1>, f2: FunctionType<T1, T2>): T2;
  <T0, T1, T2, T3>(
    x: T0,
    f1: FunctionType<T0, T1>,
    f2: FunctionType<T1, T2>,
    f3: FunctionType<T2, T3>
  ): T3;
  <T0, T1, T2, T3, T4>(
    x: T0,
    f1: FunctionType<T0, T1>,
    f2: FunctionType<T1, T2>,
    f3: FunctionType<T2, T3>,
    f4: FunctionType<T3, T4>
  ): T4;
  <T0, T1, T2, T3, T4, T5>(
    x: T0,
    f1: FunctionType<T0, T1>,
    f2: FunctionType<T1, T2>,
    f3: FunctionType<T2, T3>,
    f4: FunctionType<T3, T4>,
    f5: FunctionType<T4, T5>
  ): T5;
  <T0, T1, T2, T3, T4, T5, T6>(
    x: T0,
    f1: FunctionType<T0, T1>,
    f2: FunctionType<T1, T2>,
    f3: FunctionType<T2, T3>,
    f4: FunctionType<T3, T4>,
    f5: FunctionType<T4, T5>,
    f6: FunctionType<T5, T6>
  ): T6;
  <T0, T1, T2, T3, T4, T5, T6, T7>(
    x: T0,
    f1: FunctionType<T0, T1>,
    f2: FunctionType<T1, T2>,
    f3: FunctionType<T2, T3>,
    f4: FunctionType<T3, T4>,
    f5: FunctionType<T4, T5>,
    f6: FunctionType<T5, T6>,
    f7: FunctionType<T6, T7>
  ): T7;
  <T0, T1, T2, T3, T4, T5, T6, T7, T8>(
    x: T0,
    f1: FunctionType<T0, T1>,
    f2: FunctionType<T1, T2>,
    f3: FunctionType<T2, T3>,
    f4: FunctionType<T3, T4>,
    f5: FunctionType<T4, T5>,
    f6: FunctionType<T5, T6>,
    f7: FunctionType<T6, T7>,
    f8: FunctionType<T7, T8>
  ): T8;
  <T0, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    x: T0,
    f1: FunctionType<T0, T1>,
    f2: FunctionType<T1, T2>,
    f3: FunctionType<T2, T3>,
    f4: FunctionType<T3, T4>,
    f5: FunctionType<T4, T5>,
    f6: FunctionType<T5, T6>,
    f7: FunctionType<T6, T7>,
    f8: FunctionType<T7, T8>,
    f9: FunctionType<T8, T9>
  ): T9;
  <T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    x: T0,
    f1: FunctionType<T0, T1>,
    f2: FunctionType<T1, T2>,
    f3: FunctionType<T2, T3>,
    f4: FunctionType<T3, T4>,
    f5: FunctionType<T4, T5>,
    f6: FunctionType<T5, T6>,
    f7: FunctionType<T6, T7>,
    f8: FunctionType<T7, T8>,
    f9: FunctionType<T8, T9>,
    f10: FunctionType<T9, T10>
  ): T10;
  <T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(
    x: T0,
    f1: FunctionType<T0, T1>,
    f2: FunctionType<T1, T2>,
    f3: FunctionType<T2, T3>,
    f4: FunctionType<T3, T4>,
    f5: FunctionType<T4, T5>,
    f6: FunctionType<T5, T6>,
    f7: FunctionType<T6, T7>,
    f8: FunctionType<T7, T8>,
    f9: FunctionType<T8, T9>,
    f10: FunctionType<T9, T10>,
    f11: FunctionType<T10, T11>
  ): T11;

  <T0>(
    x: T0,
    f1: FunctionType<T0, unknown>,
    ...fns: FunctionType<unknown, unknown>[]
  ): unknown;
}
