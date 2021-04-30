import { KeyboardEventType } from '@noshiro/react-utils';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const filterKeyInList = (
  list: string[]
): MonoTypeOperatorFunction<readonly ['down' | 'up', KeyboardEventType]> => (
  keyEvents$: Observable<readonly ['down' | 'up', KeyboardEventType]>
): Observable<readonly ['down' | 'up', KeyboardEventType]> =>
  keyEvents$.pipe(filter(([_du, ev]) => list.includes(ev.key)));
