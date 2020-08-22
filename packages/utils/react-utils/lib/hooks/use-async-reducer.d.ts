import { ReducerType } from '@mono/ts-utils';
declare type AsyncDispatch<S, A> = (action: A) => Promise<S>;
declare type SyncSetState<S> = (updateFn: (prevState: S) => S) => void;
export declare const useAsyncDispatchFunction: <S, A>(state: S, reducer: ReducerType<S, A>, setState: SyncSetState<S>) => AsyncDispatch<S, A>;
export declare const useAsyncReducer: <S, A>(reducer: ReducerType<S, A>, init: S) => [S, AsyncDispatch<S, A>];
export {};
//# sourceMappingURL=use-async-reducer.d.ts.map