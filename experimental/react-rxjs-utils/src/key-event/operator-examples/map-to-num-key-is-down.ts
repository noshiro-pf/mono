import type { KeyboardEventType } from '@noshiro/react-utils';
import type { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { filterKeyInList, filterKeyIsDown } from '../custom-operators';

export type NumKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const mapToNumKey =
  (): OperatorFunction<readonly ['down' | 'up', KeyboardEventType], NumKey> =>
  (
    keyEvent$: Observable<readonly ['down' | 'up', KeyboardEventType]>,
  ): Observable<NumKey> =>
    keyEvent$.pipe(
      filterKeyInList(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']),
      filterKeyIsDown(),
      map((ev) => Number(ev.key) as NumKey),
    );
