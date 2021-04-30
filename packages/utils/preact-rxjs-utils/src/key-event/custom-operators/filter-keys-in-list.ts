import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const filterKeyInList = (
  list: readonly string[]
): MonoTypeOperatorFunction<readonly ['down' | 'up', KeyboardEvent]> => (
  keyEvents$: Observable<readonly ['down' | 'up', KeyboardEvent]>
): Observable<readonly ['down' | 'up', KeyboardEvent]> =>
  keyEvents$.pipe(filter(([_du, ev]) => list.includes(ev.key)));
