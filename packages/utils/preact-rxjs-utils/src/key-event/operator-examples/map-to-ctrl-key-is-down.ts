import { isCtrlKey } from '@noshiro/preact-utils';
import type { Observable, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export const mapToCtrlKeyIsDown =
  (): OperatorFunction<readonly ['down' | 'up', KeyboardEvent], boolean> =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', KeyboardEvent]>
  ): Observable<boolean> =>
    keyEvents$.pipe(
      filter(([_du, ev]) => isCtrlKey(ev)),
      map(([du]) => du === 'down')
    );
