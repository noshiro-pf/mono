import { KeyboardEventType } from '@noshiro/react-utils';
import { filterByLatest } from '@noshiro/rxjs-utils';
import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { filterKeyIsDown } from '../custom-operators/filter-key-is-down';
import { filterTargetAlphabetKeyEvent } from '../custom-operators/filter-target-alphabet-key-event';
import { mapToCtrlKeyIsDown } from './map-to-ctrl-key-is-down';

export const mapToSKeyWithCtrl = (): OperatorFunction<
  ['down' | 'up', KeyboardEventType],
  KeyboardEventType
> => (
  keyEvent$: Observable<['down' | 'up', KeyboardEventType]>
): Observable<KeyboardEventType> =>
  keyEvent$.pipe(
    filterTargetAlphabetKeyEvent('s'),
    filterKeyIsDown(),
    filterByLatest(keyEvent$.pipe(mapToCtrlKeyIsDown())),
    map((ev) => {
      ev.preventDefault();
      return ev;
    })
  );
