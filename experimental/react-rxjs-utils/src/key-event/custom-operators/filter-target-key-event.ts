import type { KeyboardEventType } from '@noshiro/react-utils';
import type { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const filterTargetKeyEvent =
  (
    key: string,
  ): MonoTypeOperatorFunction<readonly ['down' | 'up', KeyboardEventType]> =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', KeyboardEventType]>,
  ): Observable<readonly ['down' | 'up', KeyboardEventType]> =>
    keyEvents$.pipe(filter(([_du, ev]) => ev.key === key));
