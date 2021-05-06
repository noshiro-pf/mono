export type DeepWritable<S> = {
  -readonly [K in keyof S]: S[K] extends (infer U)[]
    ? DeepWritable<U>[]
    : S[K] extends Record<K, S[K]>
    ? DeepWritable<S[K]>
    : S[K];
};
