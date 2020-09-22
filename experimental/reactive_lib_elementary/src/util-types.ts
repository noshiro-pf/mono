import { Observable } from './Observable';

export type ObservableValueOf<S> = S extends Observable<infer T> ? T : never;

export type ArrayElement<S> = S extends Array<infer T> ? T : never;

export type Unwrap<S> = { [P in keyof S]: ObservableValueOf<S[P]> };
