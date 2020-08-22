import { PrimitiveType } from '@mono/ts-utils';
import { Observable, ObservableInput, OperatorFunction } from 'rxjs';
import { Unwrap } from '../unwrap';
export declare const mapToConst: <T extends PrimitiveType>(constant: T) => OperatorFunction<any, T>;
export declare const get: <T, K extends keyof T>(name: K) => OperatorFunction<T, T[K]>;
export declare const valueIs: <S, T extends S>(value: T) => OperatorFunction<S, boolean>;
export declare const valueIsNot: <S, T extends S>(value: T) => OperatorFunction<S, boolean>;
export declare const filterValue: <S, T extends S>(value: T) => OperatorFunction<S, T>;
export declare const filterNotValue: <S, T extends S>(value: T) => OperatorFunction<S, S>;
export declare const filterNotUndefined: <T>() => OperatorFunction<T, Exclude<T, undefined>>;
export declare const filterByLatest: (condition$: Observable<boolean>) => <T>(input$: Observable<T>) => Observable<T>;
export declare const filterByAll: (...conditions: Observable<boolean>[]) => <T>(input$: Observable<T>) => Observable<T>;
export declare const asValueFrom: <T>(from: Observable<T>) => <S>(input$: Observable<S>) => Observable<T>;
export declare const filterEnumSubset: <U extends string, S extends U>(enumSubset: S[]) => OperatorFunction<U, S>;
export declare const probe: <T>(callback?: (v: T) => void) => OperatorFunction<T, T>;
export declare const withLatestValuesFrom: <U extends ObservableInput<any>[]>(...observables: U) => <T>(input$: Observable<T>) => Observable<[T, Unwrap<U>]>;
//# sourceMappingURL=custom-operators.d.ts.map