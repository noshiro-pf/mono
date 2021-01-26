import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const filterTargetKeyEvent = (
  key: string
): MonoTypeOperatorFunction<['down' | 'up', KeyboardEvent]> => (
  keyEvents$: Observable<['down' | 'up', KeyboardEvent]>
): Observable<['down' | 'up', KeyboardEvent]> =>
  keyEvents$.pipe(filter(([_du, ev]) => ev.key === key));
