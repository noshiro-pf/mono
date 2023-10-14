import { isNotUndefined } from '@noshiro/ts-utils';
import type { Observable, ObservableInput, OperatorFunction } from 'rxjs';
import { filter, map, mapTo, pluck, withLatestFrom } from 'rxjs/operators';
import { combineLatestTyped } from '../combine-latest';
import type { Unwrap } from '../unwrap';
import { every } from './every';

export const mapToConst = <T extends Primitive>(
  constant: T,
): OperatorFunction<unknown, T> => mapTo(constant);

export const get: <T, K extends keyof T>(key: K) => OperatorFunction<T, T[K]> =
  pluck;

export const valueIs = <S, T extends S>(
  value: T,
): OperatorFunction<S, boolean> => map((v) => Object.is(v, value));

export const valueIsNot = <S, T extends S>(
  value: T,
): OperatorFunction<S, boolean> => map((v) => !Object.is(v, value));

export const filterValue =
  <S, T extends S>(value: T): OperatorFunction<S, T> =>
  (input$: Observable<S>): Observable<T> =>
    input$.pipe(
      filter((v) => Object.is(v, value)),
      map((e) => e as T),
    );

export const filterNotValue = <S, T extends S>(
  value: T,
): OperatorFunction<S, S> => filter((v) => !Object.is(v, value));

export const filterNotUndefined = <T>(): OperatorFunction<
  T,
  // eslint-disable-next-line @typescript-eslint/ban-types
  RelaxedExclude<T, undefined>
> => filter(isNotUndefined);

export const filterByLatest =
  (condition$: Observable<boolean>) =>
  <T>(input$: Observable<T>): Observable<T> =>
    input$.pipe(
      withLatestFrom(condition$),
      filter(([_value, condition]: readonly [T, boolean]) => condition),
      map(([value, _condition]) => value),
    );

export const filterByAll =
  (
    // eslint-disable-next-line noshiro-custom/prefer-readonly-parameter-types
    conditions: readonly Observable<boolean>[],
  ) =>
  <T>(input$: Observable<T>): Observable<T> =>
    input$.pipe(filterByLatest(every(conditions)));

export const asValueFrom =
  <T>(from: Observable<T>) =>
  <S>(input$: Observable<S>): Observable<T> =>
    input$.pipe(
      withLatestFrom(from),
      map(([_, value]: readonly [S, T]) => value),
    );

export const filterEnumSubset =
  <U extends string, S extends U>(
    enumSubset: readonly S[],
  ): OperatorFunction<U, S> =>
  (input$: Observable<U>): Observable<S> =>
    input$.pipe(
      filter((e) => (enumSubset as readonly U[]).includes(e)),
      map((e) => e as S),
    );

export const probe = <T>(
  callback: (v: T) => void = console.log,
): OperatorFunction<T, T> =>
  map((v) => {
    callback(v);
    return v;
  });

export const withLatestValuesFrom =
  <U extends readonly ObservableInput<unknown>[]>(observables: U) =>
  <T>(input$: Observable<T>): Observable<readonly [T, Unwrap<U>]> =>
    input$.pipe(withLatestFrom(combineLatestTyped(observables)));
