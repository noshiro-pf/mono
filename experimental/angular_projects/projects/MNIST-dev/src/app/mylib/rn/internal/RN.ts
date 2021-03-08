import {
  debounce,
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
  switchMap,
  take,
  takeWhile,
  withLatest,
  withTimestamp,
} from './mod';
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

  /* @deprecated This is an internal implementation detail, do not use. */
  get value() {
    return this.valueInternal;
  }
  get index() {
    return this.indexInternal < 0 ? 0 : this.indexInternal;
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
    onFire: (v: T) => void,
    onError?: (e?: any) => void,
    onComplete?: (v: T) => void,
    runWithFirstValue: boolean = true
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

  debounce(time: number): RN<T> {
    return debounce<T>(time)(this);
  }

  filter(initialValue: T, predicate: (e: T) => boolean): RN<T> {
    return filter<T>(initialValue, predicate)(this);
  }

  flatMap<U>(fn: (e: T) => RN<U>): RN<U> {
    return flatMap<T, U>(fn)(this);
  }

  map<U>(fn: (value: T, index: number) => U): RN<U> {
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

  scan<U>(initialValue: U, fn: (prev: U, curr: T, index?: number) => U): RN<U> {
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
    predicate: (value: T, index: number) => boolean
  ): RN<T> {
    return skipWhile<T>(initialValue, predicate)(this);
  }

  switchMap<U>(fn: (e: T) => RN<U>): RN<U> {
    return switchMap<T, U>(fn)(this);
  }

  take(takeNum: number): RN<T> {
    return take<T>(takeNum)(this);
  }

  takeWhile(predicate: (value: T, index: number) => boolean): RN<T> {
    return takeWhile<T>(predicate)(this);
  }

  withLatest<U>(src: RN<U>): RN<[T, U]> {
    return withLatest<T, U>(src)(this);
  }

  withTimestamp(): RN<[T, number]> {
    return withTimestamp<T>()(this);
  }
}
