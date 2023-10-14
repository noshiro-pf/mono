import type { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

export const mapToKey =
  <T extends string>(): OperatorFunction<
    readonly ['down' | 'up', Readonly<KeyboardEvent>],
    T
  > =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', Readonly<KeyboardEvent>]>,
  ): Observable<T> =>
    keyEvents$.pipe(map(([_du, ev]) => ev.key as T));
