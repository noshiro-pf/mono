import { BehaviorSubject, Observable } from 'rxjs';
import { Operator } from './types/Operator';
import { RNId } from './types/RNId';
import { Subscriber } from './types/Subscriber';
import { Subscription } from './types/Subscription';

export class RN<T> {
  // shared priority queue
  private static engine: {
    priorityQueue: RN<any>[]; // RNs to fire
    doTaskIsRunning: boolean;
  } = {
    priorityQueue: [],
    doTaskIsRunning: false,
  };

  // id
  private readonly id: RNId = Symbol();

  // dependencies
  private readonly priority: number;
  private readonly parentsInternal: RN<any>[];
  private children: RN<any>[];
  private subscribers: Subscriber<T>[];

  // RN states
  private state: 'running' | 'end-successfully' | 'end-with-error' = 'running';
  private valueInternal: T;
  private indexInternal: number;

  private promiseResolver: (value?: T | PromiseLike<T> | undefined) => void;
  private promiseRejector: (reason?: any) => void;

  constructor(initialValue: T, parents: RN<any>[]) {
    if (!parents || !Array.isArray(parents)) {
      throw new Error('"parents" must be an array');
    }

    this.children = [];
    this.parentsInternal = parents;
    this.parents.forEach((src) => src.addChild(this));

    this.priority =
      1 + this.parents.reduce((prev, curr) => Math.max(prev, curr.priority), 0);
    this.subscribers = [];

    this.valueInternal = initialValue;
    this.indexInternal = -1;

    this.promiseResolver = () => {};
    this.promiseRejector = () => {};
  }

  // methods for engine

  private static addTasks(rns: RN<any>[]) {
    if (!rns || rns.length === 0) return;
    rns.forEach((rn) => this.addAsHeapUniq(rn));
    if (!this.engine.doTaskIsRunning) this.doTask();
  }

  private static doTask() {
    this.engine.doTaskIsRunning = true;
    const rn = this.removeAsHeap();
    if (rn === undefined) {
      this.engine.doTaskIsRunning = false;
      return;
    }
    rn.fire();
    this.doTask();
  }

  private static exists(newValue: RN<any>): boolean {
    return (
      this.engine.priorityQueue.findIndex((e) => e.id === newValue.id) !== -1
    );
  }

  private static addAsHeapUniq(newValue: RN<any>) {
    if (!this.exists(newValue)) {
      this.addAsHeap(newValue);
    }
  }

  private static addAsHeap(newValue: RN<any>) {
    const heap = this.engine.priorityQueue;
    heap.push(newValue);
    if (heap.length <= 1) return;

    // initialize
    let currentIdx = heap.length - 1;
    let parentIdx = Math.floor(currentIdx / 2);
    while (newValue.priority < heap[parentIdx].priority) {
      // swap
      [heap[currentIdx], heap[parentIdx]] = [heap[parentIdx], heap[currentIdx]];

      // update
      currentIdx = parentIdx;
      parentIdx = Math.floor(currentIdx / 2);
    }
  }

  private static removeAsHeap(): RN<any> | undefined {
    const heap = this.engine.priorityQueue;
    if (heap.length <= 1) return heap.shift();
    const result = heap[0];

    // move tail value to front
    heap[0] = heap.pop() as RN<any>;

    // initialize
    let currentIdx = 0;

    // swap down the root value
    while (1) {
      const childIdx1 = 2 * currentIdx + 1;
      const childIdx2 = childIdx1 + 1;

      // case: no children
      if (childIdx1 >= heap.length) break;

      // case: 1 or 2 children
      const child1priority = heap[childIdx1].priority;
      const child2priority =
        childIdx2 >= heap.length ? Infinity : heap[childIdx2].priority;
      const minChildIdx =
        child1priority < child2priority ? childIdx1 : childIdx2;
      const curr = heap[currentIdx];
      const minChild = heap[minChildIdx];
      if (curr.priority <= minChild.priority) break;
      // swap
      [heap[currentIdx], heap[minChildIdx]] = [minChild, curr];
      currentIdx = minChildIdx;
    }
    return result;
  }

  // accessors

  get value() {
    return this.valueInternal;
  }
  get index() {
    return this.indexInternal;
  }

  private get isCompleted() {
    return this.state === 'end-successfully' || this.state === 'end-with-error';
  }

  protected get parents() {
    return this.parentsInternal;
  }

  // methods for RN

  private addChild(c: RN<any>) {
    if (!c) return;
    this.children.push(c);
  }

  private addSubscriber(s: Subscriber<T>) {
    // return the index of added subscriber
    return this.subscribers.push(s) - 1;
  }

  protected fire() {}

  protected fireWith(v: T) {
    if (this.isCompleted) return;

    this.valueInternal = v;
    this.indexInternal += 1;

    // run subscribers for the current value
    this.subscribers.forEach((s) => {
      s.next(this.value);
    });

    // propagate to children
    RN.addTasks(this.children);
  }

  // RN can be manually terminated
  terminate() {
    this.complete();
  }

  protected askIfComplete() {
    if (this.isCompleted) return; // terminate only once

    /**
     * terminate this if
     *  - this is not root and all parents are at end-state
     * or
     *  - no RN or subscriber listen to this value
     * */
    if (
      (this.parents.length > 0 && this.parents.every((r) => r.isCompleted)) ||
      (this.subscribers.length === 0 &&
        this.children.every((r) => r.isCompleted))
    ) {
      this.complete();
    }
  }

  protected complete() {
    // move to end state
    if (this.isCompleted) return; // terminate only once

    // change state
    this.state = 'end-successfully';

    this.promiseResolver(this.value);

    // run subscribers for the current value
    this.subscribers.forEach((s) => {
      s.complete(this.value);
    });

    // remove all subscribers
    this.subscribers = [];

    // propagate to children
    this.children.forEach((rn) => {
      rn.askIfComplete();
    });

    // propagate to parents
    this.parents.forEach((rn) => {
      rn.askIfComplete();
    });
  }

  listen(
    runWithFirstValue: boolean = true,
    onFire: (v: T) => void,
    onError?: (e?: any) => void,
    onComplete?: (v: T) => void
  ): Subscription {
    return this.subscribe(onFire, onError, onComplete, runWithFirstValue);
  }

  subscribe(
    onFire: (v: T) => void,
    onError?: (e?: any) => void,
    onComplete?: (v: T) => void,
    runWithFirstValue?: boolean
  ): Subscription;

  // rxjs-like interface
  subscribe(
    next: (v: T) => void,
    error?: (e?: any) => void,
    complete?: (v: T) => void,
    runWithFirstValue?: boolean
  ): Subscription;

  subscribe(subscriber: Subscriber<T>): Subscription;

  subscribe(
    nextOrSubscriber: ((v: T) => void) | Subscriber<T>,
    error?: (e?: any) => void,
    complete?: (v: T) => void,
    runWithFirstValue: boolean = true
  ): Subscription {
    // unify to subscriber
    let subscriber: Subscriber<T>;
    if (typeof nextOrSubscriber === 'function') {
      // next
      subscriber = {
        next: nextOrSubscriber || (() => {}),
        error: error || (() => {}),
        complete: complete || (() => {}),
      };
    } else {
      // Subscriber
      subscriber = {
        next: nextOrSubscriber.next || (() => {}),
        error: nextOrSubscriber.error || (() => {}),
        complete: nextOrSubscriber.complete || (() => {}),
      };
    }

    // run subscriber once and return subscription
    switch (this.state) {
      case 'running': {
        if (runWithFirstValue) {
          // run with the current value
          subscriber.next(this.value);
        }

        const idx = this.addSubscriber(subscriber);

        const subscription: Subscription = {
          unsubscribe: () => {
            this.subscribers.splice(idx, 1);
            this.askIfComplete();
          },
        };
        return subscription;
      }

      case 'end-successfully': {
        subscriber.complete(this.value); // emit final value
        const subscription: Subscription = {
          unsubscribe: () => {}, // dummy
        };
        return subscription;
      }

      case 'end-with-error': {
        subscriber.error(this.value); // emit final value
        const subscription: Subscription = {
          unsubscribe: () => {}, // dummy
        };
        return subscription;
      }
    }
  }

  once(): Promise<T> {
    let sb: Subscription;
    const pr = new Promise<T>((res) => {
      sb = this.listen(false, res);
    });
    pr.then(() => sb.unsubscribe());
    return pr;
  }

  toPromise(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.promiseResolver = resolve;
      this.promiseRejector = reject;
    });
  }

  toObservable(runWithFirstValue: boolean = true): Observable<T> {
    const b = new BehaviorSubject<T>(this.value);
    this.listen(
      runWithFirstValue,
      (v) => b.next(v),
      (e) => b.error(e),
      (_) => b.complete()
    );
    return b.asObservable();
  }

  pipe<A>(op1: Operator<T, A>): RN<A>;
  pipe<A, B>(op1: Operator<T, A>, op2: Operator<A, B>): RN<B>;
  pipe<A, B, C>(
    op1: Operator<T, A>,
    op2: Operator<A, B>,
    op3: Operator<B, C>
  ): RN<C>;
  pipe<A, B, C, D>(
    op1: Operator<T, A>,
    op2: Operator<A, B>,
    op3: Operator<B, C>,
    op4: Operator<C, D>
  ): RN<D>;
  pipe<A, B, C, D, E>(
    op1: Operator<T, A>,
    op2: Operator<A, B>,
    op3: Operator<B, C>,
    op4: Operator<C, D>,
    op5: Operator<D, E>
  ): RN<E>;
  pipe<A, B, C, D, E, F>(
    op1: Operator<T, A>,
    op2: Operator<A, B>,
    op3: Operator<B, C>,
    op4: Operator<C, D>,
    op5: Operator<D, E>,
    op6: Operator<E, F>
  ): RN<F>;
  pipe<A, B, C, D, E, F, G>(
    op1: Operator<T, A>,
    op2: Operator<A, B>,
    op3: Operator<B, C>,
    op4: Operator<C, D>,
    op5: Operator<D, E>,
    op6: Operator<E, F>,
    op7: Operator<F, G>
  ): RN<G>;
  pipe<A, B, C, D, E, F, G, H>(
    op1: Operator<T, A>,
    op2: Operator<A, B>,
    op3: Operator<B, C>,
    op4: Operator<C, D>,
    op5: Operator<D, E>,
    op6: Operator<E, F>,
    op7: Operator<F, G>,
    op8: Operator<G, H>
  ): RN<H>;
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: Operator<T, A>,
    op2: Operator<A, B>,
    op3: Operator<B, C>,
    op4: Operator<C, D>,
    op5: Operator<D, E>,
    op6: Operator<E, F>,
    op7: Operator<F, G>,
    op8: Operator<G, H>,
    op9: Operator<H, I>,
    ...ops: Operator<any, any>[]
  ): RN<any>;

  pipe(...operators: Operator<any, any>[]): RN<any> {
    return operators.reduce((prev: RN<any>, op) => op(prev), this);
  }

  // methods for directly use of operators

  withInitialValue(initialValue: T): RN<T> {
    return withInitialValue(initialValue)(this);
  }

  debounce(time: number): RN<T> {
    return debounce<T>(time)(this);
  }

  delay(time: number): RN<T> {
    return delay<T>(time)(this);
  }

  filter(
    initialValue: T,
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean
  ): RN<T> {
    return filter<T>(initialValue, predicate)(this);
  }

  flatMap<U>(
    fn: (srcValue: T, srcIndex: number, index: number) => RN<U>
  ): RN<U> {
    return flatMap<T, U>(fn)(this);
  }

  map<U>(fn: (srcValue: T, srcIndex: number, index: number) => U): RN<U> {
    return map<T, U>(fn)(this);
  }

  mapTo<U>(value: U): RN<U> {
    return mapTo<T, U>(value)(this);
  }

  pairwise(initialPrevValue?: T): RN<[T, T]> {
    return pairwise<T>(initialPrevValue)(this);
  }

  pluck<K extends keyof T>(member: K): RN<T[K]> {
    return pluck<T, K>(member)(this);
  }

  scan<U>(
    initialValue: U,
    fn: (state: U, srcValue: T, srcIndex: number, index: number) => U
  ): RN<U> {
    return scan<T, U>(initialValue, fn)(this);
  }

  skip(initialValue: T, skipNum: number): RN<T> {
    return skip<T>(initialValue, skipNum)(this);
  }

  skipAlreadyAppeared<K extends keyof T>(key?: K): RN<T> {
    return skipAlreadyAppeared<T, K>(key)(this);
  }

  skipUnchanged(eq?: (a: T, b: T) => boolean): RN<T> {
    return skipUnchanged<T>(eq)(this);
  }

  skipWhile(
    initialValue: T,
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean
  ): RN<T> {
    return skipWhile<T>(initialValue, predicate)(this);
  }

  switchMap<U>(
    fn: (srcValue: T, srcIndex: number, index: number) => RN<U>
  ): RN<U> {
    return switchMap<T, U>(fn)(this);
  }

  take(takeNum: number): RN<T> {
    return take<T>(takeNum)(this);
  }

  takeWhile(
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean
  ): RN<T> {
    return takeWhile<T>(predicate)(this);
  }

  throttle(time: number): RN<T> {
    return throttle<T>(time)(this);
  }

  withLatest<U>(src: RN<U>): RN<[T, U]> {
    return withLatest<T, U>(src)(this);
  }

  withTimestamp(): RN<[T, number]> {
    return withTimestamp<T>()(this);
  }
}

export const debounce =
  <T>(time: number): Operator<T, T> =>
  (src: RN<T>) =>
    new DebounceRN<T>(src, time);

class DebounceRN<T> extends RN<T> {
  private time: number;
  private timerId: any;

  constructor(src: RN<T>, time: number) {
    super(src.value, [src]);
    this.time = time;
  }

  protected fire() {
    clearTimeout(this.timerId);

    this.timerId = setTimeout(() => {
      this.fireWith(this.parents[0].value);
    }, this.time);
  }

  complete() {
    super.complete();
    clearTimeout(this.timerId);
  }
}

export const delay =
  <T>(time: number): Operator<T, T> =>
  (src: RN<T>) =>
    new DelayRN<T>(src, time);

class DelayRN<T> extends RN<T> {
  private time: number;
  private timerId: any;

  constructor(src: RN<T>, time: number) {
    super(src.value, [src]);
    this.time = time;
  }

  protected fire() {
    this.timerId = setTimeout(() => {
      this.fireWith(this.parents[0].value);
    }, this.time);
  }

  complete() {
    super.complete();
    clearTimeout(this.timerId);
  }
}

export const filter =
  <T>(
    initialValue: T,
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean
  ): Operator<T, T> =>
  (src: RN<T>) =>
    new FilterRN<T>(src, initialValue, predicate);

class FilterRN<T> extends RN<T> {
  private predicate: (srcValue: T, srcIndex: number, index: number) => boolean;

  constructor(
    src: RN<T>,
    initialValue: T,
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean
  ) {
    super(initialValue, [src]);
    this.predicate = predicate;
  }

  protected fire() {
    const src = this.parents[0];
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    if (this.predicate(src.value, src.index, this.index + 1)) {
      this.fireWith(src.value);
    }
  }
}

export const flatMap =
  <T, U>(
    fn: (srcValue: T, srcIndex: number, index: number) => RN<U>
  ): Operator<T, U> =>
  (src: RN<T>) =>
    new FlatMapRN<T, U>(src, fn);

class FlatMapRN<T, U> extends RN<U> {
  private latestRN: RN<U>;
  private subscriptions: Subscription[];
  private fn: (srcValue: T, srcIndex: number, index: number) => RN<U>;

  constructor(
    src: RN<T>,
    fn: (srcValue: T, srcIndex: number, index: number) => RN<U>
  ) {
    super(fn(src.value, src.index, -1).value, [src]);
    this.latestRN = fn(src.value, src.index, -1);
    this.fn = fn;
    this.subscriptions = [];
    this.subscriptions.push(this.latestRN.subscribe((e) => this.fireWith(e)));
  }

  protected fire() {
    // switch latestRN here
    const src = this.parents[0];
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    this.latestRN = this.fn(src.value, src.index, this.index + 1);
    this.subscriptions.push(this.latestRN.subscribe((e) => this.fireWith(e)));
  }

  complete() {
    super.complete();
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}

export const map =
  <T, U>(
    fn: (srcValue: T, srcIndex: number, index: number) => U
  ): Operator<T, U> =>
  (src: RN<T>) =>
    new MapRN<T, U>(src, fn);

export const mapTo =
  <T, U>(value: U): Operator<T, U> =>
  (src: RN<T>) =>
    new MapRN<T, U>(src, () => value);

export const pluck =
  <T, K extends keyof T>(member: K): Operator<T, T[K]> =>
  (src: RN<T>) =>
    new MapRN<T, T[K]>(src, (value) => value[member]);

export const withTimestamp =
  <T>(): Operator<T, [T, number]> =>
  (src: RN<T>) =>
    new MapRN<T, [T, number]>(src, (value) => [value, Date.now()]);

class MapRN<T, U> extends RN<U> {
  private fn: (srcValue: T, srcIndex: number, index: number) => U;

  constructor(
    src: RN<T>,
    fn: (srcValue: T, srcIndex: number, index: number) => U
  ) {
    super(fn(src.value, src.index, -1), [src]);
    this.fn = fn;
  }

  protected fire() {
    const src = this.parents[0];
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    this.fireWith(this.fn(src.value, src.index, this.index + 1));
  }
}

export const pairwise =
  <T>(initialPrevValue?: T): Operator<T, [T, T]> =>
  (src: RN<T>) =>
    new PairwiseRN<T>(src, initialPrevValue);

class PairwiseRN<T> extends RN<[T, T]> {
  private prevVal: T;

  constructor(src: RN<T>, initialPrevValue?: T) {
    super([initialPrevValue || src.value, src.value], [src]);
    this.prevVal = initialPrevValue || src.value;
  }

  protected fire() {
    const nextVal = this.parents[0].value;
    this.fireWith([this.prevVal, nextVal]);
    this.prevVal = nextVal;
  }
}

export const scan =
  <T, U>(
    initialValue: U,
    fn: (state: U, srcValue: T, srcIndex: number, index: number) => U
  ): Operator<T, U> =>
  (src: RN<T>) =>
    new ScanRN<T, U>(initialValue, src, fn);

class ScanRN<T, U> extends RN<U> {
  private scanState: U;
  private fn: (state: U, srcValue: T, srcIndex: number, index: number) => U;

  constructor(
    initialValue: U,
    src: RN<T>,
    fn: (state: U, srcValue: T, srcIndex: number, index: number) => U
  ) {
    super(initialValue, [src]);
    this.scanState = initialValue;
    this.fn = fn;
  }

  protected fire() {
    const src = this.parents[0];
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    this.fireWith(
      this.fn(this.scanState, src.value, src.index, this.index + 1)
    );
  }
}

export const skip =
  <T>(initialValue: T, skipNum: number): Operator<T, T> =>
  (src: RN<T>) =>
    new SkipWhileRN<T>(
      src,
      initialValue,
      (_srcValue, srcIndex, _index) => srcIndex < skipNum
    );

export const skipWhile =
  <T>(
    initialValue: T,
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean
  ): Operator<T, T> =>
  (src: RN<T>) =>
    new SkipWhileRN<T>(src, initialValue, predicate);

class SkipWhileRN<T> extends RN<T> {
  private predicate: (srcValue: T, srcIndex: number, index: number) => boolean;

  constructor(
    src: RN<T>,
    initialValue: T,
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean
  ) {
    super(initialValue, [src]);
    this.predicate = predicate;
  }

  protected fire() {
    const src = this.parents[0];
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    if (!this.predicate(src.value, src.index, this.index + 1)) {
      this.fireWith(src.value);
    }
  }
}

export const skipAlreadyAppeared =
  <T, K extends keyof T>(key?: K): Operator<T, T> =>
  (src: RN<T>) =>
    new SkipAlreadyAppearedRN<T, K>(src, key);

class SkipAlreadyAppearedRN<T, K extends keyof T> extends RN<T> {
  private key?: K;
  private appeared: Set<T | T[K]>;

  constructor(src: RN<T>, key?: K) {
    super(src.value, [src]);
    this.appeared = new Set<T | T[K]>();
    this.appeared.add(src.value);
    this.key = key;
  }

  protected fire() {
    const nextVal = this.parents[0].value;
    const v = this.key ? nextVal[this.key] : nextVal;
    if (!this.appeared.has(v)) {
      this.appeared.add(v);
      this.fireWith(nextVal);
    }
  }

  complete() {
    super.complete();
    this.appeared.clear();
  }
}

export const skipUnchanged =
  <T>(eq: (a: T, b: T) => boolean = (a, b) => a === b): Operator<T, T> =>
  (src: RN<T>) =>
    new SkipUnchangedRN<T>(src, eq);

class SkipUnchangedRN<T> extends RN<T> {
  private eq: (a: T, b: T) => boolean = (a, b) => a === b;

  constructor(src: RN<T>, eq: (a: T, b: T) => boolean = (a, b) => a === b) {
    super(src.value, [src]);
    this.eq = eq;
  }

  protected fire() {
    const currVal = this.parents[0].value;
    const prevVal = this.value;

    if (!this.eq(currVal, prevVal)) {
      this.fireWith(currVal);
    }
  }
}

export const switchMap =
  <T, U>(
    fn: (srcValue: T, srcIndex: number, index: number) => RN<U>
  ): Operator<T, U> =>
  (src: RN<T>) =>
    new SwitchMapRN<T, U>(src, fn);

class SwitchMapRN<T, U> extends RN<U> {
  private latestRN: RN<U>;
  private subscription: Subscription;
  private fn: (srcValue: T, srcIndex: number, index: number) => RN<U>;

  constructor(
    src: RN<T>,
    fn: (srcValue: T, srcIndex: number, index: number) => RN<U>
  ) {
    super(fn(src.value, src.index, -1).value, [src]);
    this.latestRN = fn(src.value, src.index, -1);
    this.fn = fn;
    this.subscription = this.latestRN.subscribe((e) => this.fireWith(e));
  }

  protected fire() {
    // switch latestRN here
    this.subscription.unsubscribe();
    const src = this.parents[0];
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    this.latestRN = this.fn(src.value, src.index, this.index + 1);
    this.subscription = this.latestRN.subscribe((e) => this.fireWith(e));
  }

  complete() {
    super.complete();
    this.subscription.unsubscribe();
  }
}

export const take =
  <T>(takeNum: number): Operator<T, T> =>
  (src: RN<T>) =>
    new TakeWhileRN<T>(
      src,
      (_srcValue, srcIndex, _index) => srcIndex < takeNum
    );

export const takeWhile =
  <T>(
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean
  ): Operator<T, T> =>
  (src: RN<T>) =>
    new TakeWhileRN<T>(src, predicate);

class TakeWhileRN<T> extends RN<T> {
  private predicate: (srcValue: T, srcIndex: number, index: number) => boolean;

  constructor(
    src: RN<T>,
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean
  ) {
    super(src.value, [src]);
    this.predicate = predicate;
  }

  protected fire() {
    const src = this.parents[0];

    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    if (this.predicate(src.value, src.index, this.index + 1)) {
      this.fireWith(src.value);
    } else {
      this.complete();
    }
  }
}

export const throttle =
  <T>(time: number): Operator<T, T> =>
  (src: RN<T>) =>
    new ThrottleRN<T>(src, time);

class ThrottleRN<T> extends RN<T> {
  private time: number;
  private lastFireTime: number = 0;

  constructor(src: RN<T>, time: number) {
    super(src.value, [src]);
    this.time = time;
  }

  protected fire() {
    if (Date.now() > this.lastFireTime + this.time) {
      this.fireWith(this.parents[0].value);
      this.lastFireTime = Date.now();
    }
  }
}

export const withInitialValue =
  <T>(initialValue: T): Operator<T, T> =>
  (src: RN<T>) =>
    new WithInitialValueRN<T>(src, initialValue);

class WithInitialValueRN<T> extends RN<T> {
  constructor(src: RN<T>, initialValue: T) {
    super(initialValue, [src]);
  }

  protected fire() {
    const src = this.parents[0];
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    this.fireWith(src.value);
  }
}

export const withLatest =
  <T, U>(src2: RN<U>): Operator<T, [T, U]> =>
  (src: RN<T>) =>
    new WithLatestRN<T, U>(src, src2);

class WithLatestRN<T, U> extends RN<[T, U]> {
  private src2: RN<U>;

  constructor(src: RN<T>, src2: RN<U>) {
    super([src.value, src2.value], [src]);
    this.src2 = src2;
  }

  protected fire() {
    this.fireWith([this.parents[0].value, this.src2.value]);
  }
}
