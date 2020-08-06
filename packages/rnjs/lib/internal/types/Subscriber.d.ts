export interface Subscriber<T> {
    next: (v: T) => void;
    error: (e?: any) => void;
    complete: (v: T) => void;
}
//# sourceMappingURL=Subscriber.d.ts.map