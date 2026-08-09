import { type RequiredKeys } from 'ts-type-forge';

// embed-sample-code-ignore-above

type K = RequiredKeys<{
  a?: 0; // optional
  b?: 0 | undefined; // optional
  c?: undefined; // optional
  d: 0; // required
  e: undefined; // required, value is undefined
  f: 0 | undefined; // required, value includes undefined
}>; // 'd' | 'e' | 'f'

// embed-sample-code-ignore-below
export type { K };
