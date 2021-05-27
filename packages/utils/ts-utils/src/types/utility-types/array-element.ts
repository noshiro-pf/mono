export type ArrayElement<S> = S extends readonly (infer T)[] ? T : never;
