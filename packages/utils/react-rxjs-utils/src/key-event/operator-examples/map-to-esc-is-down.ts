import { KeyboardEventType } from '@noshiro/react-utils';
import { Observable, OperatorFunction } from 'rxjs';
import { mapToTargetKeyIsDown } from '../custom-operators/map-to-target-key-is-down';

export const mapToEscapeKeyIsDown = (): OperatorFunction<
  ['down' | 'up', KeyboardEventType],
  boolean
> => (
  keyEvents$: Observable<['down' | 'up', KeyboardEventType]>
): Observable<boolean> => keyEvents$.pipe(mapToTargetKeyIsDown('Escape'));
