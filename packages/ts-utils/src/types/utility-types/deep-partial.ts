export type DeepPartial<S> = {
  [K in keyof S]?: S[K] extends (infer U)[]
    ? DeepPartial<U>[]
    : S[K] extends Record<K, S[K]>
    ? DeepPartial<S[K]>
    : S[K];
};
