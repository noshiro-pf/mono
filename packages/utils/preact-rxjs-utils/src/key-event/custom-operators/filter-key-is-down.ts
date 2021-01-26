import { Observable, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export const filterKeyIsDown = (): OperatorFunction<
  ['down' | 'up', KeyboardEvent],
  KeyboardEvent
> => (
  keyEvents$: Observable<['down' | 'up', KeyboardEvent]>
): Observable<KeyboardEvent> =>
  keyEvents$.pipe(
    filter(([du, _ev]) => du === 'down'),
    map(([_, ev]) => ev)
  );
