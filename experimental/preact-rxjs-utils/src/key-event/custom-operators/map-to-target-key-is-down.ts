import type { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { filterTargetKeyEvent } from './filter-target-key-event';

export const mapToTargetKeyIsDown =
  (
    key: string
  ): OperatorFunction<
    readonly ['down' | 'up', Readonly<KeyboardEvent>],
    boolean
  > =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', Readonly<KeyboardEvent>]>
  ): Observable<boolean> =>
    keyEvents$.pipe(
      filterTargetKeyEvent(key),
      map(([du]) => du === 'down')
    );
