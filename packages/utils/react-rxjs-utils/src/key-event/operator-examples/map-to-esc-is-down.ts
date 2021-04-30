import { KeyboardEventType } from '@noshiro/react-utils';
import { Observable, OperatorFunction } from 'rxjs';
import { mapToTargetKeyIsDown } from '../custom-operators';

export const mapToEscapeKeyIsDown = (): OperatorFunction<
  readonly ['down' | 'up', KeyboardEventType],
  boolean
> => (
  keyEvents$: Observable<readonly ['down' | 'up', KeyboardEventType]>
): Observable<boolean> => keyEvents$.pipe(mapToTargetKeyIsDown('Escape'));
