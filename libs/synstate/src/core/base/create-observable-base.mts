import { Arr, Optional } from 'ts-data-forge';
import {
  type MutableMap,
  type MutableSet,
  type ReadonlyRecord,
} from 'ts-type-forge';
import {
  type ChildObservable,
  type InitializedObservable,
  type Observable,
  type ObservableBase,
  type ObservableId,
  type ObservableKind,
  type Operator,
  type Subscriber,
  type SubscriberId,
  type Subscription,
  type UpdateToken,
  type WithInitialValueOperator,
} from '../types/index.mjs';
import {
  binarySearch,
  issueObservableId,
  issueSubscriberId,
  issueUpdateToken,
  toSubscriber,
} from '../utils/index.mjs';

/**
 * The mutable core shared by every observable, expressed as closures instead of
 * a base class.
 *
 * The returned handle is the "protected" surface of the former
 * `ObservableBaseClass`: the layer factories (`createRootObservable`,
 * `createSyncChildObservable`, `createAsyncChildObservable`) build the public
 * object from it via {@link assembleObservable}, and leaf factories receive
 * only the narrow tools they need. Neither the handle nor its type is exported
 * from the package (`core/base/**` is excluded from index generation), so
 * `setNext` and friends stay internal, as `protected` kept them before.
 */
export type ObservableBaseHandle<A> = Readonly<{
  id: ObservableId;

  addChild: <B>(child: ChildObservable<B>) => void;

  getSnapshot: () => Optional<A>;

  isCompleted: () => boolean;

  updateToken: () => UpdateToken;

  hasSubscriber: () => boolean;

  hasChild: () => boolean;

  hasActiveChild: () => boolean;

  subscribe: (onNext: (v: A) => void, onComplete?: () => void) => Subscription;

  /** Stores `nextValue` as the current value and notifies subscribers. */
  setNext: (nextValue: A, updateToken: UpdateToken) => void;

  /**
   * The innermost part of `complete()` (what `ObservableBaseClass.complete`
   * used to do): marks this observable completed exactly once, notifies and
   * removes all subscribers, and propagates `tryComplete` to children. Layer
   * factories wrap this with leaf teardown and propagation to parents.
   */
  completeBase: () => void;
}>;

export const createObservableBaseHandle = <A,>(
  initialValue: Optional<A>,
): ObservableBaseHandle<A> => {
  const id = issueObservableId();

  let mut_children: readonly ChildObservable<unknown>[] = [];

  const mut_subscribers: MutableMap<SubscriberId, Subscriber<A>> = new Map();

  let mut_currentValue: Optional<A> = initialValue;

  let mut_isCompleted = false;

  let mut_updateToken: UpdateToken = issueUpdateToken();

  const addSubscriber = (s: Subscriber<A>): SubscriberId => {
    // return the id of added subscriber
    const subscriberId = issueSubscriberId();

    mut_subscribers.set(subscriberId, s);

    return subscriberId;
  };

  const removeSubscriber = (subscriberId: SubscriberId): void => {
    mut_subscribers.delete(subscriberId);
  };

  const addChild = <B,>(child: ChildObservable<B>): void => {
    mut_children = Arr.toPushed(
      mut_children,

      child as ChildObservable<unknown>,
    );
  };

  const getSnapshot = (): Optional<A> => mut_currentValue;

  const isCompleted = (): boolean => mut_isCompleted;

  const updateToken = (): UpdateToken => mut_updateToken;

  const hasSubscriber = (): boolean => mut_subscribers.size > 0;

  const hasChild = (): boolean => Arr.isNonEmpty(mut_children);

  const hasActiveChild = (): boolean =>
    mut_children.some((c) => !c.isCompleted);

  const setNext = (nextValue: A, nextUpdateToken: UpdateToken): void => {
    mut_updateToken = nextUpdateToken;

    mut_currentValue = Optional.some(nextValue);

    for (const s of mut_subscribers.values()) {
      s.onNext(nextValue);
    }
  };

  const completeBase = (): void => {
    if (mut_isCompleted) return; // terminate only once

    // change state
    mut_isCompleted = true;

    // run subscribers for the current value
    for (const s of mut_subscribers.values()) {
      s.onComplete();
    }

    // remove all subscribers
    mut_subscribers.clear();

    // propagate to children
    for (const o of mut_children) {
      o.tryComplete();
    }
  };

  const subscribe = (
    onNext: (v: A) => void,
    onComplete?: () => void,
  ): Subscription => {
    // first emit
    const curr = getSnapshot();

    if (Optional.isSome(curr)) {
      onNext(curr.value);
    }

    if (mut_isCompleted) {
      if (onComplete !== undefined) {
        onComplete();
      }

      return { unsubscribe: () => {} };
    }

    const subscriberId: SubscriberId = addSubscriber(
      toSubscriber(onNext, onComplete),
    );

    return {
      unsubscribe: () => {
        removeSubscriber(subscriberId);
      },
    };
  };

  return {
    id,
    addChild,
    getSnapshot,
    isCompleted,
    updateToken,
    hasSubscriber,
    hasChild,
    hasActiveChild,
    subscribe,
    setNext,
    completeBase,
  };
};

/**
 * The extra members every manager observable — a root or an async child — owns:
 * the depth-ordered descendant list and the update propagation that walks it.
 */
export type ManagerObservableParts<A> = Readonly<{
  addDescendant: <B>(child: ChildObservable<B>) => void;

  /** Emits `nextValue` and propagates the update to all descendants. */
  startUpdate: (nextValue: A) => void;
}>;

/**
 * Builds the manager half of a root or async-child observable. Both start their
 * own update propagation, so both keep a descendant set and a depth-ordered
 * propagation list; this is the single implementation of that pair (the class
 * version duplicated it across `RootObservableClass` and
 * `AsyncChildObservableClass`).
 */
export const createManagerObservableParts = <A,>(
  handle: ObservableBaseHandle<A>,
): ManagerObservableParts<A> => {
  let mut_propagationOrder: readonly ChildObservable<unknown>[] = [];

  const mut_descendantsIdSet: MutableSet<ObservableId> = new Set();

  const addDescendant = <B,>(child: ChildObservable<B>): void => {
    if (mut_descendantsIdSet.has(child.id)) return;

    mut_descendantsIdSet.add(child.id);

    const insertPos = binarySearch(
      mut_propagationOrder.map((a) => a.depth),
      child.depth,
    );

    mut_propagationOrder = Arr.toInserted(
      mut_propagationOrder,
      insertPos,
      child,
    );
  };

  const startUpdate = (nextValue: A): void => {
    const updateToken = issueUpdateToken();

    handle.setNext(nextValue, updateToken);

    for (const p of mut_propagationOrder) {
      p.tryUpdate(updateToken);
    }
  };

  return { addDescendant, startUpdate };
};

/** Default `tryUpdate` for observables that never receive parent updates. */
export const createTryUpdateNotImplemented = (): ((
  _updateToken: UpdateToken,
) => void) => tryUpdateNotImplemented;

const tryUpdateNotImplemented = (_updateToken: UpdateToken): void => {
  throw new Error('not implemented');
};

type AssembleObservableArgs<
  A,
  Kind extends ObservableKind,
  Extra extends ReadonlyRecord<string, unknown>,
> = Readonly<{
  kind: Kind;
  depth: number;
  handle: ObservableBaseHandle<A>;
  tryUpdate: (updateToken: UpdateToken) => void;
  tryComplete: () => void;
  complete: () => void;
  /**
   * Kind-specific public members (`parents`, `addDescendant`) and leaf
   * extensions (`next`, `start`). They are merged here, in the one place the
   * final object literal is created, because the public getters below must not
   * be copied by a spread (spreading would freeze their current values).
   */
  extra: Extra;
}>;

/**
 * Builds the public observable object from a base handle. This replaces the
 * implicit assembly a `class` performs: state stays in the handle's closures,
 * `isCompleted` / `updateToken` / `hasSubscriber` / `hasChild` become getters
 * delegating to the handle, and the kind-specific behavior (`tryUpdate`,
 * `tryComplete`, `complete`) is passed in already composed.
 */
export const assembleObservable = <
  A,
  Kind extends ObservableKind,
  Extra extends ReadonlyRecord<string, unknown>,
>({
  kind,
  depth,
  handle,
  tryUpdate,
  tryComplete,
  complete,
  extra,
}: AssembleObservableArgs<A, Kind, Extra>): Extra &
  ObservableBase<A> &
  Readonly<{ kind: Kind }> => {
  function pipe<B>(
    operator: WithInitialValueOperator<A, B>,
  ): InitializedObservable<B>;

  function pipe<B>(operator: Operator<A, B>): Observable<B>;

  function pipe<B>(operator: Operator<A, B>): Observable<B> {
    return operator(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      observable as unknown as InitializedObservable<A>,
    );
  }

  const observable = {
    ...extra,

    id: handle.id,

    kind,

    depth,

    addChild: handle.addChild,

    getSnapshot: handle.getSnapshot,

    get isCompleted(): boolean {
      return handle.isCompleted();
    },

    get updateToken(): UpdateToken {
      return handle.updateToken();
    },

    get hasSubscriber(): boolean {
      return handle.hasSubscriber();
    },

    get hasChild(): boolean {
      return handle.hasChild();
    },

    hasActiveChild: handle.hasActiveChild,

    tryUpdate,

    tryComplete,

    complete,

    subscribe: handle.subscribe,

    pipe,
  } as const;

  return observable;
};
