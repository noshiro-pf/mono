import type { KeyboardEventType } from '@noshiro/react-utils';
import type { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { filterTargetKeyEvent } from './filter-target-key-event';

export const mapToTargetKeyIsDown =
  (
    key: string,
  ): OperatorFunction<readonly ['down' | 'up', KeyboardEventType], boolean> =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', KeyboardEventType]>,
  ): Observable<boolean> =>
    keyEvents$.pipe(
      filterTargetKeyEvent(key),
      map(([du]) => du === 'down'),
    );
