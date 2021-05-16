import type { KeyboardEventType } from '@noshiro/react-utils';
import { isCtrlKey } from '@noshiro/react-utils';
import type { Observable, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export const mapToCtrlKeyIsDown = (): OperatorFunction<
  readonly ['down' | 'up', KeyboardEventType],
  boolean
> => (
  keyEvents$: Observable<readonly ['down' | 'up', KeyboardEventType]>
): Observable<boolean> =>
  keyEvents$.pipe(
    filter(([_du, ev]) => isCtrlKey(ev)),
    map(([du]) => du === 'down')
  );
