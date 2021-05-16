import type { Observable, ObservableInput } from 'rxjs';
import { zip } from 'rxjs';
import type { Unwrap } from './unwrap';

export const zipTyped = <T extends ObservableInput<unknown>[]>(
  ...observables: T
): Observable<Unwrap<T>> => zip(observables) as Observable<Unwrap<T>>;
