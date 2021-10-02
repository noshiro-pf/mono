import { filterByLatest } from '@noshiro/rxjs-utils';
import type { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  filterKeyIsDown,
  filterTargetAlphabetKeyEvent,
} from '../custom-operators';
import { mapToCtrlKeyIsDown } from './map-to-ctrl-key-is-down';

export const mapToSKeyWithCtrl =
  (): OperatorFunction<
    readonly ['down' | 'up', Readonly<KeyboardEvent>],
    Readonly<KeyboardEvent>
  > =>
  (
    keyEvent$: Observable<readonly ['down' | 'up', Readonly<KeyboardEvent>]>
  ): Observable<Readonly<KeyboardEvent>> =>
    keyEvent$.pipe(
      filterTargetAlphabetKeyEvent('s'),
      filterKeyIsDown(),
      filterByLatest(keyEvent$.pipe(mapToCtrlKeyIsDown())),
      map((ev) => {
        ev.preventDefault();
        return ev;
      })
    );
