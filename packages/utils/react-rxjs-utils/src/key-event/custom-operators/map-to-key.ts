import { KeyboardEventType } from '@noshiro/react-utils';
import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

export const mapToKey = <T extends string>(): OperatorFunction<
  ['down' | 'up', KeyboardEventType],
  T
> => (
  keyEvents$: Observable<['down' | 'up', KeyboardEventType]>
): Observable<T> => keyEvents$.pipe(map(([_du, ev]) => ev.key as T));
