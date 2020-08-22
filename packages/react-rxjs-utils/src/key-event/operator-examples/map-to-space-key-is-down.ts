import { KeyboardEventType } from '@mono/react-utils';
import { Observable, OperatorFunction } from 'rxjs';
import { mapToTargetKeyIsDown } from '../custom-operators/map-to-target-key-is-down';

export const mapToSpaceKeyIsDown = (): OperatorFunction<
  ['down' | 'up', KeyboardEventType],
  boolean
> => (
  keyEvents$: Observable<['down' | 'up', KeyboardEventType]>
): Observable<boolean> => keyEvents$.pipe(mapToTargetKeyIsDown(' '));
