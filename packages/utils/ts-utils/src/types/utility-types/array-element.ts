export type ArrayElement<S> = S extends Array<infer T> ? T : never;
