import type { Observable, OperatorFunction } from 'rxjs';
import { timer } from 'rxjs';
import { mapTo, startWith, switchMap } from 'rxjs/operators';

export const toSnackbarIsOpen =
  <T>(milliSec: number): OperatorFunction<T, boolean> =>
  (source$: Observable<T>): Observable<boolean> =>
    source$.pipe(
      switchMap(() => timer(milliSec).pipe(mapTo(false), startWith(true)))
    );
