import { KeyboardEventType } from '@noshiro/react-utils';
import { Observable, OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { filterKeyInList, mapToKey } from '../custom-operators';

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
