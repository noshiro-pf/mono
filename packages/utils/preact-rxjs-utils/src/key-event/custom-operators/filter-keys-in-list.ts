import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const filterKeyInList = (
  list: string[]
): MonoTypeOperatorFunction<['down' | 'up', KeyboardEvent]> => (
  keyEvents$: Observable<['down' | 'up', KeyboardEvent]>
): Observable<['down' | 'up', KeyboardEvent]> =>
  keyEvents$.pipe(filter(([_du, ev]) => list.includes(ev.key)));
