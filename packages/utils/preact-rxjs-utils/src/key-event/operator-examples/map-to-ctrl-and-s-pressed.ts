import { filterByLatest } from '@noshiro/rxjs-utils';
import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { filterKeyIsDown } from '../custom-operators/filter-key-is-down';
import { filterTargetAlphabetKeyEvent } from '../custom-operators/filter-target-alphabet-key-event';
import { mapToCtrlKeyIsDown } from './map-to-ctrl-key-is-down';

export const mapToSKeyWithCtrl = (): OperatorFunction<
  ['down' | 'up', KeyboardEvent],
  KeyboardEvent
> => (
  keyEvent$: Observable<['down' | 'up', KeyboardEvent]>
): Observable<KeyboardEvent> =>
  keyEvent$.pipe(
    filterTargetAlphabetKeyEvent('s'),
    filterKeyIsDown(),
    filterByLatest(keyEvent$.pipe(mapToCtrlKeyIsDown())),
    map((ev) => {
      ev.preventDefault();
      return ev;
    })
  );
