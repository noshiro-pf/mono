import type { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const filterTargetKeyEvent =
  (
    key: string,
  ): MonoTypeOperatorFunction<
    readonly ['down' | 'up', Readonly<KeyboardEvent>]
  > =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', Readonly<KeyboardEvent>]>,
  ): Observable<readonly ['down' | 'up', Readonly<KeyboardEvent>]> =>
    keyEvents$.pipe(filter(([_du, ev]) => ev.key === key));
