export type Subscriber<T> = (value: T) => void;

interface ChildObservable<T, S> extends Observable<S> {
  updateWithParentValue(value: T): void;
}

export class Observable<T> {
  protected value: T | undefined;
  protected subscribers: Subscriber<T>[];
  protected children: ChildObservable<T, any>[];

  constructor() {
    this.value = undefined;
    this.subscribers = [];
    this.children = [];
  }

  update(value: T): void {
    this.value = value; // 値の更新
    this.subscribers.forEach((s) => s(value)); // subscribersへの通知
    this.children.forEach((c) => c.updateWithParentValue(value)); // 子Observableを発火させる
  }

  subscribe(fn: (value: T) => void): void {
    this.subscribers.push(fn);
  }

  map<S>(mapFn: (value: T) => S): Observable<S> {
    const mapped = new MapObservable<T, S>(mapFn);
    this.children.push(mapped);
    return mapped;
  }

  filter(filterFn: (value: T) => boolean): Observable<T> {
    const filtered = new FilterObservable<T>(filterFn);
    this.children.push(filtered);
    return filtered;
  }

  debounceTime(milliSec: number): Observable<T> {
    const result = new DebounceTimeObservable<T>(milliSec);
    this.children.push(result);
    return result;
  }
}

class MapObservable<T, S>
  extends Observable<S>
  implements ChildObservable<T, S>
{
  private readonly mapFn: (value: T) => S;

  constructor(mapFn: (value: T) => S) {
    super();
    this.mapFn = mapFn;
  }

  updateWithParentValue(value: T): void {
    const mappedValue = this.mapFn(value);
    this.update(mappedValue);
  }
}

class FilterObservable<T>
  extends Observable<T>
  implements ChildObservable<T, T>
{
  private readonly filterFn: (value: T) => boolean;

  constructor(filterFn: (value: T) => boolean) {
    super();
    this.filterFn = filterFn;
  }

  updateWithParentValue(value: T): void {
    if (this.filterFn(value)) {
      this.update(value);
    }
  }
}

class DebounceTimeObservable<T>
  extends Observable<T>
  implements ChildObservable<T, T>
{
  private readonly milliSec: number;
  private timerId: any;

  constructor(milliSec: number) {
    super();
    this.milliSec = milliSec;
  }

  updateWithParentValue(value: T): void {
    clearTimeout(this.timerId); // 前回登録したタイマー処理を捨てる
    this.timerId = setTimeout(() => {
      this.update(value);
    }, this.milliSec);
  }
}
