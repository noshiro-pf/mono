import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const filterTargetKeyEvent = (
  key: string
): MonoTypeOperatorFunction<readonly ['down' | 'up', KeyboardEvent]> => (
  keyEvents$: Observable<readonly ['down' | 'up', KeyboardEvent]>
): Observable<readonly ['down' | 'up', KeyboardEvent]> =>
  keyEvents$.pipe(filter(([_du, ev]) => ev.key === key));
