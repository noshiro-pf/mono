import { type OptionalKeys } from 'ts-type-forge';

// embed-sample-code-ignore-above

type K = OptionalKeys<{
  a?: 0; // optional
  b?: 0 | undefined; // optional
  c?: undefined; // optional
  d: 0; // required
  e: undefined; // required, value is undefined
  f: 0 | undefined; // required, value includes undefined
}>; // 'a' | 'b' | 'c'

// embed-sample-code-ignore-below
export type { K };
