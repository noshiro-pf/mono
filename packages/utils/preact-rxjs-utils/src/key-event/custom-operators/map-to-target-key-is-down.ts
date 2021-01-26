import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { filterTargetKeyEvent } from './filter-target-key-event';

export const mapToTargetKeyIsDown = (
  key: string
): OperatorFunction<['down' | 'up', KeyboardEvent], boolean> => (
  keyEvents$: Observable<['down' | 'up', KeyboardEvent]>
): Observable<boolean> =>
  keyEvents$.pipe(
    filterTargetKeyEvent(key),
    map(([du]) => du === 'down')
  );
