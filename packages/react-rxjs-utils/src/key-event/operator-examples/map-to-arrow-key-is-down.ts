import { KeyboardEventType } from '@mono/react-utils';
import { Observable, OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { filterKeyInList } from '../custom-operators/filter-keys-in-list';
import { mapToKey } from '../custom-operators/map-to-key';

export type ArrowKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown';

export const mapToArrowKey = (): OperatorFunction<
  ['down' | 'up', KeyboardEventType],
  ArrowKey
> => (
  keyEvents$: Observable<['down' | 'up', KeyboardEventType]>
): Observable<ArrowKey> =>
  keyEvents$.pipe(
    filterKeyInList(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']),
    filter(([du]) => du === 'down'),
    mapToKey()
  );
