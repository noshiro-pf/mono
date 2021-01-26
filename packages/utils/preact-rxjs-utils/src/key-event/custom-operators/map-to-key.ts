import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

export const mapToKey = <T extends string>(): OperatorFunction<
  ['down' | 'up', KeyboardEvent],
  T
> => (keyEvents$: Observable<['down' | 'up', KeyboardEvent]>): Observable<T> =>
  keyEvents$.pipe(map(([_du, ev]) => ev.key as T));
