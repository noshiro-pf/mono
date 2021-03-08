import { KeyboardEventType } from '@noshiro/react-utils';
import { Observable, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export const filterKeyIsDown = (): OperatorFunction<
  ['down' | 'up', KeyboardEventType],
  KeyboardEventType
> => (
  keyEvents$: Observable<['down' | 'up', KeyboardEventType]>
): Observable<KeyboardEventType> =>
  keyEvents$.pipe(
    filter(([du, _ev]) => du === 'down'),
    map(([_, ev]) => ev)
  );
