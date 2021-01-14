import {
  auditTime,
  debounce,
  delay,
  filter,
  flatMap,
  map,
  mapTo,
  pairwise,
  pluck,
  scan,
  skip,
  skipAlreadyAppeared,
  skipUnchanged,
  skipWhile,
  startWith,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  terminateBy,
  throttle,
  valueIs,
  valueIsNot,
  withDefault,
  withInitialValue,
  withLatest,
  withTimestamp,
} from './mod';
import { Operator } from './types/Operator';
import { Subscriber } from './types/Subscriber';
import { Subscription } from './types/Subscription';
import { noop } from './utils';

export class RN<T> {
  private static subscriberId: number = 0;
  private static rnId: number = 0;

  // shared priority queue
  private static engine: {
    priorityQueue: RN<any>[]; // RNs to fire
    doTaskIsRunning: boolean;
  } = {
    priorityQueue: [],
    doTaskIsRunning: false,
  };

  private static addTasks(rns: RN<any>[]): void {
    if (rns.length === 0) return;
    rns.forEach((rn) => this.addAsHeapUniq(rn));
    if (!this.engine.doTaskIsRunning) this.doTask();
  }

  private static doTask(): void {
    this.engine.doTaskIsRunning = true;
    const rn = this.removeAsHeap();
    if (rn === undefined) {
      this.engine.doTaskIsRunning = false;
    } else {
      rn.fire();
      this.doTask();
    }
  }

  private static exists(newValue: RN<any>): boolean {
    return (
      this.engine.priorityQueue.findIndex((e) => e.id === newValue.id) !== -1
    );
  }

  private static addAsHeapUniq(newValue: RN<any>): void {
    if (!this.exists(newValue)) {
      this.addAsHeap(newValue);
    }
  }

  private static addAsHeap(newValue: RN<any>): void {
    const heap = this.engine.priorityQueue;
    heap.push(newValue);
    if (heap.length <= 1) return;

    // initialize
    let currentIdx = heap.length - 1;
    let parentIdx = Math.floor(currentIdx / 2);
    while (newValue.priority < heap[parentIdx].priority) {
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
    // eslint-disable-next-line no-constant-condition
    while (true) {
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
      [heap[currentIdx], heap[minChildIdx]] = [minChild, curr]; // swap
      currentIdx = minChildIdx;
    }
    return result;
  }

  // name for debug
  readonly name: string = '';

  // id
  private readonly id: number;

  // dependencies
  private readonly priority: number;
  private readonly parentsInternal: RN<any>[];
  private children: RN<any>[];
  private subscribers: Map<number, Subscriber<T>>;

  // RN states
  private state: 'running' | 'end-successfully' | 'end-with-error' = 'running';
  private valueInternal: T;
  private indexInternal: number;

  private promiseResolver: (value: T | PromiseLike<T>) => void;
  private promiseRejector: (reason?: any) => void;

  constructor(initialValue: T, parents: RN<any>[], name: string) {
    this.id = RN.rnId++;
    this.name = name;
    if (!Array.isArray(parents)) {
      throw new Error('"parents" must be an array');
    }

    this.children = [];
    this.parentsInternal = parents;
    this.parents.forEach((src) => src.addChild(this));

    this.priority =
      1 + this.parents.reduce((prev, curr) => Math.max(prev, curr.priority), 0);
    this.subscribers = new Map<number, Subscriber<T>>();

    this.valueInternal = initialValue;
    this.indexInternal = -1;

    this.promiseResolver = () => undefined;
    this.promiseRejector = () => undefined;
  }

  // methods for engine

  // accessors

  get value(): T {
    return this.valueInternal;
  }
  get index(): number {
    return this.indexInternal;
  }

  // RN can be manually terminated
  terminate(): void {
    this.complete();
  }

  listen(
    runWithFirstValue: boolean = true,
    onFire: (v: T) => void,
    onError?: (e?: any) => void,
    onComplete?: (v: T) => void
  ): Subscription {
    return this.subscribe(onFire, onError, onComplete, runWithFirstValue);
  }

  // eslint-disable-next-line no-dupe-class-members
  subscribe(
    onFire: (v: T) => void,
    onError?: (e?: any) => void,
    onComplete?: (v: T) => void,
    runWithFirstValue?: boolean
  ): Subscription;

  // rxjs-like interface
  // eslint-disable-next-line no-dupe-class-members
  subscribe(
    next: (v: T) => void,
    error?: (e?: any) => void,
    complete?: (v: T) => void,
    runWithFirstValue?: boolean
  ): Subscription;

  // eslint-disable-next-line no-dupe-class-members
  subscribe(subscriber: Subscriber<T>): Subscription;

  // eslint-disable-next-line no-dupe-class-members
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
        next: nextOrSubscriber,
        error: error || noop,
        complete: complete || noop,
      };
    } else {
      // Subscriber
      subscriber = {
        next: nextOrSubscriber.next,
        error: nextOrSubscriber.error,
        complete: nextOrSubscriber.complete,
      };
    }

    // run subscriber once and return subscription
    switch (this.state) {
      case 'running': {
        if (runWithFirstValue) {
          // run with the current value
          subscriber.next(this.value);
        }

        const id = this.addSubscriber(subscriber);

        const subscription: Subscription = {
          unsubscribe: () => {
            this.removeSubscriber(id);
            this.askIfComplete();
          },
        };
        return subscription;
      }

      case 'end-successfully': {
        subscriber.complete(this.value); // emit final value
        const subscription: Subscription = {
          unsubscribe: noop, // dummy
        };
        return subscription;
      }

      case 'end-with-error': {
        subscriber.error(this.value); // emit final value
        const subscription: Subscription = {
          unsubscribe: noop, // dummy
        };
        return subscription;
      }

      default: {
        const subscription: Subscription = {
          unsubscribe: noop, // dummy
        };
        return subscription;
      }
    }
  }

  listenUntil(
    terminator: RN<void>,
    runWithFirstValue: boolean = true,
    onFire: (v: T) => void,
    onError?: (e?: any) => void,
    onComplete?: (v: T) => void,
    name: string = ''
  ): Subscription {
    return this.takeUntil(terminator, name).listen(
      runWithFirstValue,
      onFire,
      onError,
      onComplete
    );
  }

  // get the next value emitted right after this method is called
  once(): Promise<T> {
    let sb: Subscription;
    const pr = new Promise<T>((res) => {
      sb = this.listen(false, res);
    });
    pr.then(() => sb.unsubscribe()).catch((err) => console.error(err));
    return pr;
  }

  toPromise(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.promiseResolver = resolve;
      this.promiseRejector = reject;
    });
  }

  // eslint-disable-next-line no-dupe-class-members
  pipe<A>(op1: Operator<T, A>): RN<A>;
  // eslint-disable-next-line no-dupe-class-members
  pipe<A, B>(op1: Operator<T, A>, op2: Operator<A, B>): RN<B>;
  // eslint-disable-next-line no-dupe-class-members
  pipe<A, B, C>(
    op1: Operator<T, A>,
    op2: Operator<A, B>,
    op3: Operator<B, C>
  ): RN<C>;
  // eslint-disable-next-line no-dupe-class-members
  pipe<A, B, C, D>(
    op1: Operator<T, A>,
    op2: Operator<A, B>,
    op3: Operator<B, C>,
    op4: Operator<C, D>
  ): RN<D>;
  // eslint-disable-next-line no-dupe-class-members
  pipe<A, B, C, D, E>(
    op1: Operator<T, A>,
    op2: Operator<A, B>,
    op3: Operator<B, C>,
    op4: Operator<C, D>,
    op5: Operator<D, E>
  ): RN<E>;
  // eslint-disable-next-line no-dupe-class-members
  pipe<A, B, C, D, E, F>(
    op1: Operator<T, A>,
    op2: Operator<A, B>,
    op3: Operator<B, C>,
    op4: Operator<C, D>,
    op5: Operator<D, E>,
    op6: Operator<E, F>
  ): RN<F>;
  // eslint-disable-next-line no-dupe-class-members
  pipe<A, B, C, D, E, F, G>(
    op1: Operator<T, A>,
    op2: Operator<A, B>,
    op3: Operator<B, C>,
    op4: Operator<C, D>,
    op5: Operator<D, E>,
    op6: Operator<E, F>,
    op7: Operator<F, G>
  ): RN<G>;
  // eslint-disable-next-line no-dupe-class-members
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
  // eslint-disable-next-line no-dupe-class-members
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
  // eslint-disable-next-line no-dupe-class-members
  pipe(...operators: Operator<any, any>[]): RN<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return operators.reduce((prev: RN<any>, op) => op(prev), this);
  }

  // methods for directly use of operators

  auditTime(time: number, name: string = ''): RN<T> {
    return auditTime<T>(time, name)(this);
  }

  debounce(time: number, name: string = ''): RN<T> {
    return debounce<T>(time, name)(this);
  }

  delay(time: number, name: string = ''): RN<T> {
    return delay<T>(time, name)(this);
  }

  filter(
    initialValue: T,
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean,
    name: string = ''
  ): RN<T> {
    return filter<T>(initialValue, predicate, name)(this);
  }

  filterByLatest(src: RN<boolean>, name: string = ''): RN<T> {
    return this.withLatest(src, name)
      .filter([this.value, src.value], ([_a, b]) => b)
      .map(([a, _b]) => a);
  }

  flatMap<U>(
    fn: (srcValue: T, srcIndex: number, index: number) => RN<U>,
    name: string = ''
  ): RN<U> {
    return flatMap<T, U>(fn, name)(this);
  }

  map<U>(
    fn: (srcValue: T, srcIndex: number, index: number) => U,
    name: string = ''
  ): RN<U> {
    return map<T, U>(fn, name)(this);
  }

  mapTo<U>(value: U, name: string = ''): RN<U> {
    return mapTo<T, U>(value, name)(this);
  }

  valueIs(value: T, name: string = ''): RN<boolean> {
    return valueIs<T>(value, name)(this);
  }

  valueIsNot(value: T, name: string = ''): RN<boolean> {
    return valueIsNot<T>(value, name)(this);
  }

  pluck<K extends keyof T>(member: K, name: string = ''): RN<T[K]> {
    return pluck<T, K>(member, name)(this);
  }

  get<K extends keyof T>(member: K, name: string = ''): RN<T[K]> {
    return pluck<T, K>(member, name)(this);
  }

  withTimestamp(name: string = ''): RN<[T, number]> {
    return withTimestamp<T>(name)(this);
  }

  pairwise(initialPrevValue?: T, name: string = ''): RN<[T, T]> {
    return pairwise<T>(initialPrevValue, name)(this);
  }

  scan<U>(
    initialValue: U,
    fn: (state: U, srcValue: T, srcIndex?: number, index?: number) => U,
    name: string = ''
  ): RN<U> {
    return scan<T, U>(initialValue, fn, name)(this);
  }

  skip(initialValue: T, skipNum: number, name: string = ''): RN<T> {
    return skip<T>(initialValue, skipNum, name)(this);
  }

  skipWhile(
    initialValue: T,
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean,
    name: string = ''
  ): RN<T> {
    return skipWhile<T>(initialValue, predicate, name)(this);
  }

  skipAlreadyAppeared<K extends keyof T>(key?: K, name: string = ''): RN<T> {
    return skipAlreadyAppeared<T, K>(key, name)(this);
  }

  skipUnchanged(eq?: (a: T, b: T) => boolean, name: string = ''): RN<T> {
    return skipUnchanged<T>(eq, name)(this);
  }

  startWith(initialValue: T, name: string = ''): RN<T> {
    return startWith(initialValue, name)(this);
  }

  switchMap<U>(
    fn: (srcValue: T, srcIndex: number, index: number) => RN<U>,
    name: string = ''
  ): RN<U> {
    return switchMap<T, U>(fn, name)(this);
  }

  take(takeNum: number, name: string = ''): RN<T> {
    return take<T>(takeNum, name)(this);
  }

  takeWhile(
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean,
    name: string = ''
  ): RN<T> {
    return takeWhile<T>(predicate, name)(this);
  }

  takeUntil(terminator: RN<void>, name: string = ''): RN<T> {
    return takeUntil<T>(terminator, name)(this);
  }
  terminateBy(terminator: RN<void>, name: string = ''): RN<T> {
    return terminateBy<T>(terminator, name)(this);
  }

  throttle(time: number, name: string = ''): RN<T> {
    return throttle<T>(time, name)(this);
  }

  withDefault(defaultValue: T, name: string = ''): RN<T> {
    return withDefault(defaultValue, name)(this);
  }

  withInitialValue(initialValue: T, name: string = ''): RN<T> {
    return withInitialValue(initialValue, name)(this);
  }

  withLatest<U>(src: RN<U>, name: string = ''): RN<[T, U]> {
    return withLatest<T, U>(src, name)(this);
  }

  protected get parents(): RN<any>[] {
    return this.parentsInternal;
  }

  protected fire(): void {
    noop();
  }

  protected fireWith(v: T): void {
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

  protected askIfComplete(): void {
    if (this.isCompleted) return; // terminate only once

    /**
     * terminate this if
     *  - this is not root and all parents are at end-state
     * or
     *  - no RN or subscriber listen to this value
     */
    if (
      (this.parents.length > 0 && this.parents.every((r) => r.isCompleted)) ||
      (this.subscribers.size === 0 && this.children.every((r) => r.isCompleted))
    ) {
      this.complete();
    }
  }

  protected complete(): void {
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
    this.subscribers.clear();

    // propagate to children
    this.children.forEach((rn) => {
      rn.askIfComplete();
    });

    // propagate to parents
    // this.parents.forEach( rn => { rn.askIfComplete(); });
  }

  protected completeWithError(): void {
    // move to end state
    if (this.isCompleted) return; // terminate only once

    // change state
    this.state = 'end-with-error';

    this.promiseRejector('completed with error');

    // run subscribers for the current value
    this.subscribers.forEach((s) => {
      s.error(this.value);
    });

    // remove all subscribers
    this.subscribers.clear();

    // propagate to children
    this.children.forEach((rn) => {
      rn.completeWithError();
    });

    // propagate to parents
    // this.parents.forEach( rn => { rn.askIfComplete(); });
  }

  private get isCompleted(): boolean {
    return this.state === 'end-successfully' || this.state === 'end-with-error';
  }

  // methods for RN

  private addChild(c: RN<any>): void {
    this.children.push(c);
  }

  private addSubscriber(s: Subscriber<T>): number {
    // return the index of added subscriber
    const id = RN.subscriberId++;
    this.subscribers.set(id, s);
    return id;
  }

  private removeSubscriber(id: number): void {
    this.subscribers.delete(id);
  }
}
