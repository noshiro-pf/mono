import { Arr, Optional } from 'ts-data-forge';
import { unreachable } from 'ts-std-forge';
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

  /**
   * Registers the public object {@link assembleObservable} built from this
   * handle, so that the four state flags below can be mirrored onto it as
   * plain data properties.
   *
   * They used to be getters delegating to this handle's closures, and that
   * costs more than it looks. Reading one was an accessor call plus a closure
   * call where a field read would do — `updateToken` is read once per child
   * per update, so the propagation path paid it on every step — and an object
   * literal carrying accessors is far more expensive to create than one
   * carrying data, which is most of what building a graph costs. Measured on
   * one machine with `pnpm run benchmark`: the derived chain's 100,000 updates
   * 16.7 ms -> 13.6 ms, and the cascaded diamond at N=20, whose measurement is
   * dominated by graph construction, 587 ms -> 362 ms.
   *
   * Every write below therefore has to keep the mirror in step; that is the
   * price of not reading through a closure on the hot path.
   */
  attach: (writers: ObservableStateWriters) => void;

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

/**
 * How the handle writes the four state flags onto the public object. The
 * writers are closures over that object rather than the object itself, because
 * a parameter this side could mutate has to be a mutable type, which
 * `@typescript-eslint/prefer-readonly-parameter-types` rejects — and the object
 * is `Readonly` to everyone else.
 */
type ObservableStateWriters = Readonly<{
  setIsCompleted: (value: boolean) => void;
  setUpdateToken: (value: UpdateToken) => void;
  setHasSubscriber: (value: boolean) => void;
  setHasChild: (value: boolean) => void;
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

  /**
   * Set once {@link assembleObservable} has built the public object. It does
   * not exist while a leaf factory's `init` callback runs — that callback may
   * already subscribe or complete — so every write below is optional, and
   * `attach` copies the state as it stands rather than assuming defaults.
   */
  let mut_writers: ObservableStateWriters | undefined;

  const attach = (writers: ObservableStateWriters): void => {
    mut_writers = writers;

    writers.setIsCompleted(mut_isCompleted);

    writers.setUpdateToken(mut_updateToken);

    writers.setHasSubscriber(mut_subscribers.size > 0);

    writers.setHasChild(Arr.isNonEmpty(mut_children));
  };

  const addSubscriber = (s: Subscriber<A>): SubscriberId => {
    // return the id of added subscriber
    const subscriberId = issueSubscriberId();

    mut_subscribers.set(subscriberId, s);

    mut_writers?.setHasSubscriber(true);

    return subscriberId;
  };

  const removeSubscriber = (subscriberId: SubscriberId): void => {
    mut_subscribers.delete(subscriberId);

    mut_writers?.setHasSubscriber(mut_subscribers.size > 0);
  };

  const addChild = <B,>(child: ChildObservable<B>): void => {
    mut_children = Arr.toPushed(
      mut_children,

      child as ChildObservable<unknown>,
    );

    mut_writers?.setHasChild(true);
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

    mut_writers?.setUpdateToken(nextUpdateToken);

    mut_currentValue = Optional.some(nextValue);

    for (const s of mut_subscribers.values()) {
      s.onNext(nextValue);
    }
  };

  const completeBase = (): void => {
    if (mut_isCompleted) return; // terminate only once

    // change state
    mut_isCompleted = true;

    mut_writers?.setIsCompleted(true);

    // run subscribers for the current value
    for (const s of mut_subscribers.values()) {
      s.onComplete();
    }

    // remove all subscribers
    mut_subscribers.clear();

    mut_writers?.setHasSubscriber(false);

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
    attach,
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
  // Not `todo()`: nothing here is waiting to be written. This is the base
  // default of what was a base-class method, and every observable that can
  // receive a parent update supplies its own `tryUpdate`; an observable with
  // no parents never gets one. Reaching this is the invariant breaking, which
  // is what `unreachable` says (Sumi D-48). There is no `never` value to
  // hand it — the fact of the call is the error.
  unreachable();
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
      mut_observable as unknown as InitializedObservable<A>,
    );
  }

  // The four state flags are plain data properties kept in step by the handle,
  // not getters delegating to it — see `ObservableBaseHandle.attach` for the
  // measurements that decided this. `updateToken` in particular is read once
  // per child per update, and `tryUpdate` reading a field rather than calling
  // through an accessor is most of what the change buys.
  const mut_observable = {
    ...extra,

    id: handle.id,

    kind,

    depth,

    addChild: handle.addChild,

    getSnapshot: handle.getSnapshot,

    isCompleted: false,

    updateToken: handle.updateToken(),

    hasSubscriber: false,

    hasChild: false,

    hasActiveChild: handle.hasActiveChild,

    tryUpdate,

    tryComplete,

    complete,

    subscribe: handle.subscribe,

    pipe,
  };

  handle.attach({
    setIsCompleted: (value) => {
      mut_observable.isCompleted = value;
    },

    setUpdateToken: (value) => {
      mut_observable.updateToken = value;
    },

    setHasSubscriber: (value) => {
      mut_observable.hasSubscriber = value;
    },

    setHasChild: (value) => {
      mut_observable.hasChild = value;
    },
  });

  return mut_observable;
};
