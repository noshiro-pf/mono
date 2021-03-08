import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { filterKeyInList, filterKeyIsDown } from '../custom-operators';

export type NumKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const mapToNumKey = (): OperatorFunction<
  ['down' | 'up', KeyboardEvent],
  NumKey
> => (
  keyEvent$: Observable<['up' | 'down', KeyboardEvent]>
): Observable<NumKey> =>
  keyEvent$.pipe(
    filterKeyInList(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']),
    filterKeyIsDown(),
    map((ev) => Number(ev.key) as NumKey)
  );
