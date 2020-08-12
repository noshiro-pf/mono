import { Operator } from '../types';
import { RN } from './rn-interface';
export interface Pipable<A> {
    pipe<T1>(op1: Operator<A, T1>): RN<T1>;
    pipe<T1, T2>(op1: Operator<A, T1>, op2: Operator<T1, T2>): RN<T2>;
    pipe<T1, T2, T3>(op1: Operator<A, T1>, op2: Operator<T1, T2>, op3: Operator<T2, T3>): RN<T3>;
    pipe<T1, T2, T3, T4>(op1: Operator<A, T1>, op2: Operator<T1, T2>, op3: Operator<T2, T3>, op4: Operator<T3, T4>): RN<T4>;
    pipe<T1, T2, T3, T4, T5>(op1: Operator<A, T1>, op2: Operator<T1, T2>, op3: Operator<T2, T3>, op4: Operator<T3, T4>, op5: Operator<T4, T5>): RN<T5>;
    pipe<T1, T2, T3, T4, T5, T6>(op1: Operator<A, T1>, op2: Operator<T1, T2>, op3: Operator<T2, T3>, op4: Operator<T3, T4>, op5: Operator<T4, T5>, op6: Operator<T5, T6>): RN<T6>;
    pipe<T1, T2, T3, T4, T5, T6, T7>(op1: Operator<A, T1>, op2: Operator<T1, T2>, op3: Operator<T2, T3>, op4: Operator<T3, T4>, op5: Operator<T4, T5>, op6: Operator<T5, T6>, op7: Operator<T6, T7>): RN<T7>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8>(op1: Operator<A, T1>, op2: Operator<T1, T2>, op3: Operator<T2, T3>, op4: Operator<T3, T4>, op5: Operator<T4, T5>, op6: Operator<T5, T6>, op7: Operator<T6, T7>, op8: Operator<T7, T8>): RN<T8>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9>(op1: Operator<A, T1>, op2: Operator<T1, T2>, op3: Operator<T2, T3>, op4: Operator<T3, T4>, op5: Operator<T4, T5>, op6: Operator<T5, T6>, op7: Operator<T6, T7>, op8: Operator<T7, T8>, op9: Operator<T8, T9>): RN<T9>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(op1: Operator<A, T1>, op2: Operator<T1, T2>, op3: Operator<T2, T3>, op4: Operator<T3, T4>, op5: Operator<T4, T5>, op6: Operator<T5, T6>, op7: Operator<T6, T7>, op8: Operator<T7, T8>, op9: Operator<T8, T9>, op10: Operator<T9, T10>): RN<T10>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(op1: Operator<A, T1>, op2: Operator<T1, T2>, op3: Operator<T2, T3>, op4: Operator<T3, T4>, op5: Operator<T4, T5>, op6: Operator<T5, T6>, op7: Operator<T6, T7>, op8: Operator<T7, T8>, op9: Operator<T8, T9>, op10: Operator<T9, T10>, op11: Operator<T10, T11>): RN<T11>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12>(op1: Operator<A, T1>, op2: Operator<T1, T2>, op3: Operator<T2, T3>, op4: Operator<T3, T4>, op5: Operator<T4, T5>, op6: Operator<T5, T6>, op7: Operator<T6, T7>, op8: Operator<T7, T8>, op9: Operator<T8, T9>, op10: Operator<T9, T10>, op11: Operator<T10, T11>, op12: Operator<T11, T12>): RN<T12>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13>(op1: Operator<A, T1>, op2: Operator<T1, T2>, op3: Operator<T2, T3>, op4: Operator<T3, T4>, op5: Operator<T4, T5>, op6: Operator<T5, T6>, op7: Operator<T6, T7>, op8: Operator<T7, T8>, op9: Operator<T8, T9>, op10: Operator<T9, T10>, op11: Operator<T10, T11>, op12: Operator<T11, T12>, op13: Operator<T12, T13>): RN<T13>;
    pipe(...operators: readonly [Operator<any, any>, ...Operator<any, any>[]]): RN<any>;
}
//# sourceMappingURL=pipable.d.ts.map