import type { Observable, OperatorFunction } from 'rxjs';
import { mapToTargetKeyIsDown } from '../custom-operators';

export const mapToSpaceKeyIsDown =
  (): OperatorFunction<
    readonly ['down' | 'up', Readonly<KeyboardEvent>],
    boolean
  > =>
  (
    keyEvents$: Observable<readonly ['down' | 'up', Readonly<KeyboardEvent>]>,
  ): Observable<boolean> =>
    keyEvents$.pipe(mapToTargetKeyIsDown(' '));
