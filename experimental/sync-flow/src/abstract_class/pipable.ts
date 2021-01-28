import { Operator } from '../types';
import { Observable } from './observable-interface';

export interface Pipable<A> {
  pipe:
    | (<T1>(op1: Operator<A, T1>) => Observable<T1>)
    | (<T1, T2>(op1: Operator<A, T1>, op2: Operator<T1, T2>) => Observable<T2>)
    | (<T1, T2, T3>(
        op1: Operator<A, T1>,
        op2: Operator<T1, T2>,
        op3: Operator<T2, T3>
      ) => Observable<T3>)
    | (<T1, T2, T3, T4>(
        op1: Operator<A, T1>,
        op2: Operator<T1, T2>,
        op3: Operator<T2, T3>,
        op4: Operator<T3, T4>
      ) => Observable<T4>)
    | (<T1, T2, T3, T4, T5>(
        op1: Operator<A, T1>,
        op2: Operator<T1, T2>,
        op3: Operator<T2, T3>,
        op4: Operator<T3, T4>,
        op5: Operator<T4, T5>
      ) => Observable<T5>)
    | (<T1, T2, T3, T4, T5, T6>(
        op1: Operator<A, T1>,
        op2: Operator<T1, T2>,
        op3: Operator<T2, T3>,
        op4: Operator<T3, T4>,
        op5: Operator<T4, T5>,
        op6: Operator<T5, T6>
      ) => Observable<T6>)
    | (<T1, T2, T3, T4, T5, T6, T7>(
        op1: Operator<A, T1>,
        op2: Operator<T1, T2>,
        op3: Operator<T2, T3>,
        op4: Operator<T3, T4>,
        op5: Operator<T4, T5>,
        op6: Operator<T5, T6>,
        op7: Operator<T6, T7>
      ) => Observable<T7>)
    | (<T1, T2, T3, T4, T5, T6, T7, T8>(
        op1: Operator<A, T1>,
        op2: Operator<T1, T2>,
        op3: Operator<T2, T3>,
        op4: Operator<T3, T4>,
        op5: Operator<T4, T5>,
        op6: Operator<T5, T6>,
        op7: Operator<T6, T7>,
        op8: Operator<T7, T8>
      ) => Observable<T8>)
    | (<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
        op1: Operator<A, T1>,
        op2: Operator<T1, T2>,
        op3: Operator<T2, T3>,
        op4: Operator<T3, T4>,
        op5: Operator<T4, T5>,
        op6: Operator<T5, T6>,
        op7: Operator<T6, T7>,
        op8: Operator<T7, T8>,
        op9: Operator<T8, T9>
      ) => Observable<T9>)
    | (<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
        op1: Operator<A, T1>,
        op2: Operator<T1, T2>,
        op3: Operator<T2, T3>,
        op4: Operator<T3, T4>,
        op5: Operator<T4, T5>,
        op6: Operator<T5, T6>,
        op7: Operator<T6, T7>,
        op8: Operator<T7, T8>,
        op9: Operator<T8, T9>,
        op10: Operator<T9, T10>
      ) => Observable<T10>)
    | (<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(
        op1: Operator<A, T1>,
        op2: Operator<T1, T2>,
        op3: Operator<T2, T3>,
        op4: Operator<T3, T4>,
        op5: Operator<T4, T5>,
        op6: Operator<T5, T6>,
        op7: Operator<T6, T7>,
        op8: Operator<T7, T8>,
        op9: Operator<T8, T9>,
        op10: Operator<T9, T10>,
        op11: Operator<T10, T11>
      ) => Observable<T11>)
    | (<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12>(
        op1: Operator<A, T1>,
        op2: Operator<T1, T2>,
        op3: Operator<T2, T3>,
        op4: Operator<T3, T4>,
        op5: Operator<T4, T5>,
        op6: Operator<T5, T6>,
        op7: Operator<T6, T7>,
        op8: Operator<T7, T8>,
        op9: Operator<T8, T9>,
        op10: Operator<T9, T10>,
        op11: Operator<T10, T11>,
        op12: Operator<T11, T12>
      ) => Observable<T12>)
    | ((
        ...operators: readonly [Operator<any, any>, ...Operator<any, any>[]]
      ) => Observable<any>);
}
