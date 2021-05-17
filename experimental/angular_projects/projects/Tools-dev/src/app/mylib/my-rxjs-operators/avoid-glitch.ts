import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export const avoidGlitch =
  <T>() =>
  (source: Observable<T>) =>
    source.pipe(debounceTime(10)) as Observable<T>;
