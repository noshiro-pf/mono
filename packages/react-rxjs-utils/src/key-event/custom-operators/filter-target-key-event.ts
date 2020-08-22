import { KeyboardEventType } from '@mono/react-utils';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const filterTargetKeyEvent = (
  key: string
): MonoTypeOperatorFunction<['down' | 'up', KeyboardEventType]> => (
  keyEvents$: Observable<['down' | 'up', KeyboardEventType]>
): Observable<['down' | 'up', KeyboardEventType]> =>
  keyEvents$.pipe(filter(([_du, ev]) => ev.key === key));
