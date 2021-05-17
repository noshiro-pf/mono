import type { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

export const mapToKey =
  <T extends string>(): OperatorFunction<
    readonly ['down' | 'up', KeyboardEvent],
    T
  > =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', KeyboardEvent]>
  ): Observable<T> =>
    keyEvents$.pipe(map(([_du, ev]) => ev.key as T));
