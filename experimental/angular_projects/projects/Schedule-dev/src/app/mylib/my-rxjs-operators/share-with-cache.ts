import { Observable } from 'rxjs';
import { publishReplay, refCount } from 'rxjs/operators';

export const shareWithCache = <T>() => (source: Observable<T>) =>
  source.pipe(publishReplay(1), refCount()) as Observable<T>;
