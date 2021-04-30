import { FunctionType } from '../types';

export function pipeF<T0, T1>(x: T0, f1: FunctionType<T0, T1>): T1;
export function pipeF<T0, T1, T2>(
  x: T0,
  f1: FunctionType<T0, T1>,
  f2: FunctionType<T1, T2>
): T2;
export function pipeF<T0, T1, T2, T3>(
  x: T0,
  f1: FunctionType<T0, T1>,
  f2: FunctionType<T1, T2>,
  f3: FunctionType<T2, T3>
): T3;
export function pipeF<T0, T1, T2, T3, T4>(
  x: T0,
  f1: FunctionType<T0, T1>,
  f2: FunctionType<T1, T2>,
  f3: FunctionType<T2, T3>,
  f4: FunctionType<T3, T4>
): T4;
export function pipeF<T0, T1, T2, T3, T4, T5>(
  x: T0,
  f1: FunctionType<T0, T1>,
  f2: FunctionType<T1, T2>,
  f3: FunctionType<T2, T3>,
  f4: FunctionType<T3, T4>,
  f5: FunctionType<T4, T5>
): T5;
export function pipeF<T0, T1, T2, T3, T4, T5, T6>(
  x: T0,
  f1: FunctionType<T0, T1>,
  f2: FunctionType<T1, T2>,
  f3: FunctionType<T2, T3>,
  f4: FunctionType<T3, T4>,
  f5: FunctionType<T4, T5>,
  f6: FunctionType<T5, T6>
): T6;
export function pipeF<T0, T1, T2, T3, T4, T5, T6, T7>(
  x: T0,
  f1: FunctionType<T0, T1>,
  f2: FunctionType<T1, T2>,
  f3: FunctionType<T2, T3>,
  f4: FunctionType<T3, T4>,
  f5: FunctionType<T4, T5>,
  f6: FunctionType<T5, T6>,
  f7: FunctionType<T6, T7>
): T7;
export function pipeF<T0, T1, T2, T3, T4, T5, T6, T7, T8>(
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
export function pipeF<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
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
export function pipeF<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
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
export function pipeF<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(
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

export function pipeF(
  x: unknown,
  ...fns: readonly FunctionType<unknown, unknown>[]
): unknown {
  return fns.reduce((curr, f) => f(curr), x);
}
