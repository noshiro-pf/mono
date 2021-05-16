import type { ObservedValueOf } from 'rxjs';

export type Unwrap<S> = { [P in keyof S]: ObservedValueOf<S[P]> };
