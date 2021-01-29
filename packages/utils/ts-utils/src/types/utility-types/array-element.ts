export type ArrayElement<S> = S extends (infer T)[] ? T : never;
