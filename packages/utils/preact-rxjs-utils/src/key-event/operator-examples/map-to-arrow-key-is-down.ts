import type { Observable, OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { filterKeyInList, mapToKey } from '../custom-operators';

export type ArrowKey = 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp';

export const mapToArrowKey =
  (): OperatorFunction<readonly ['down' | 'up', KeyboardEvent], ArrowKey> =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', KeyboardEvent]>
  ): Observable<ArrowKey> =>
    keyEvents$.pipe(
      filterKeyInList(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']),
      filter(([du]) => du === 'down'),
      mapToKey()
    );
