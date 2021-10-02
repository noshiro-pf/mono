import type { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const filterKeyInList =
  (
    list: readonly string[]
  ): MonoTypeOperatorFunction<
    readonly ['down' | 'up', Readonly<KeyboardEvent>]
  > =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', Readonly<KeyboardEvent>]>
  ): Observable<readonly ['down' | 'up', Readonly<KeyboardEvent>]> =>
    keyEvents$.pipe(filter(([_du, ev]) => list.includes(ev.key)));
