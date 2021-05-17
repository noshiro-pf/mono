import type { KeyboardEventType } from '@noshiro/react-utils';
import type { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

export const mapToKey =
  <T extends string>(): OperatorFunction<
    readonly ['down' | 'up', KeyboardEventType],
    T
  > =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', KeyboardEventType]>
  ): Observable<T> =>
    keyEvents$.pipe(map(([_du, ev]) => ev.key as T));
