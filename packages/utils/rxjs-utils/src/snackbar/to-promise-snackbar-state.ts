import type { Observable, OperatorFunction } from 'rxjs';
import { timer } from 'rxjs';
import { mapTo, startWith, switchMap } from 'rxjs/operators';
import type { PromiseSnackbarStateType } from './promise-snackbar-state';

export const toPromiseSnackbarState = <T>(
  timerMilliSec: number,
  initialStateMapFn: (value: T) => PromiseSnackbarStateType,
  delayedStateMapFn: (value: T) => PromiseSnackbarStateType
): OperatorFunction<T, PromiseSnackbarStateType> => (
  source$: Observable<T>
): Observable<PromiseSnackbarStateType> =>
  source$.pipe(
    switchMap((value) =>
      timer(timerMilliSec).pipe(
        mapTo(delayedStateMapFn(value)),
        startWith(initialStateMapFn(value))
      )
    )
  );
