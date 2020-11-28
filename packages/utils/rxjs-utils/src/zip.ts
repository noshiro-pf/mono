import { Observable, ObservableInput, zip } from 'rxjs';
import { Unwrap } from './unwrap';

export const zipTyped = <T extends ObservableInput<any>[]>(
  ...observables: T
): Observable<Unwrap<T>> => zip(observables) as Observable<Unwrap<T>>;
