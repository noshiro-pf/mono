import { isCtrlKey } from '@mono/preact-utils';
import { Observable, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export const mapToCtrlKeyIsDown = (): OperatorFunction<
  ['down' | 'up', KeyboardEvent],
  boolean
> => (
  keyEvents$: Observable<['down' | 'up', KeyboardEvent]>
): Observable<boolean> =>
  keyEvents$.pipe(
    filter(([_du, ev]) => isCtrlKey(ev)),
    map(([du]) => du === 'down')
  );
