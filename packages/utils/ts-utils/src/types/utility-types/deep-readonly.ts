export type DeepReadonly<S> = {
  readonly [K in keyof S]: S[K] extends (infer U)[]
    ? DeepReadonly<U>[]
    : S[K] extends Record<K, S[K]>
    ? DeepReadonly<S[K]>
    : S[K];
};
