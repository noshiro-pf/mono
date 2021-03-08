import { Observable, OperatorFunction } from 'rxjs';
import { mapToTargetKeyIsDown } from '../custom-operators';

export const mapToEscapeKeyIsDown = (): OperatorFunction<
  ['down' | 'up', KeyboardEvent],
  boolean
> => (
  keyEvents$: Observable<['down' | 'up', KeyboardEvent]>
): Observable<boolean> => keyEvents$.pipe(mapToTargetKeyIsDown('Escape'));
