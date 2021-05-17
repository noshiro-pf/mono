import type { KeyboardEventType } from '@noshiro/react-utils';
import type { Observable, OperatorFunction } from 'rxjs';
import { mapToTargetKeyIsDown } from '../custom-operators';

export const mapToSpaceKeyIsDown =
  (): OperatorFunction<readonly ['down' | 'up', KeyboardEventType], boolean> =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', KeyboardEventType]>
  ): Observable<boolean> =>
    keyEvents$.pipe(mapToTargetKeyIsDown(' '));
