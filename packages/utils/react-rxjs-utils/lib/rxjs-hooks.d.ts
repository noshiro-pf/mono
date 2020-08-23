import { Observable } from 'rxjs';
export declare const useStream: <T>(stream$: Observable<T>) => Observable<T>;
export declare const useDataStream: <T>(initialValue: T, stream$: Observable<T>) => Observable<T>;
export declare const useStreamEffect: <T>(stream$: Observable<T>, subscriptionFn: (v: T) => void) => void;
interface UseStreamValueType {
    <T>(stream$: Observable<T>): T | undefined;
    <T>(stream$: Observable<T>, initialValue: T): T;
}
export declare const useStreamValue: UseStreamValueType;
export declare const useVoidEventAsStream: () => [Observable<void>, () => void];
export declare const useEventAsStream: <T>() => [Observable<T>, (value: T) => void];
export declare const useStateAsStream: <T>(initialValue: T) => [Observable<T>, (v: T) => void];
export declare const useChangeValueEffect: <T>(input: T, callback: (v: T) => any) => void;
export declare const useValueAsStream: <T>(input: T) => Observable<T>;
export {};
//# sourceMappingURL=rxjs-hooks.d.ts.map