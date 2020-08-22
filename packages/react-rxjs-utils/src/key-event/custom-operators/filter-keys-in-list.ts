import { KeyboardEventType } from '@mono/react-utils';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const filterKeyInList = (
  list: string[]
): MonoTypeOperatorFunction<['down' | 'up', KeyboardEventType]> => (
  keyEvents$: Observable<['down' | 'up', KeyboardEventType]>
): Observable<['down' | 'up', KeyboardEventType]> =>
  keyEvents$.pipe(filter(([_du, ev]) => list.includes(ev.key)));
