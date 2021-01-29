import { RN } from './RN';

export type RNValue<S> = S extends RN<infer T> ? T : never;
export type ArrayElement<S> = S extends (infer T)[] ? T : never;

export type Unwrap<S> = { [P in keyof S]: RNValue<S[P]> };

export const unwrapCurr = <T extends RN<any>[]>(...rns: T): Unwrap<T> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  rns.map((e) => e.value) as Unwrap<T>;

export const noop = (): void => undefined;
