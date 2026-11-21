/**
 * Ownership. Everything created while an owner's `run` executes belongs to it,
 * and `dispose()` disposes it: it takes the whole subtree out of the updates
 * first, then disposes the child owners, then runs the cleanups, then disposes
 * the nodes, each newest first. A cleanup or a disposal that throws does not
 * stop the rest: the first exception is thrown once everything is disposed.
 * This is the only lifetime a node has; there is no reference counting and no
 * completion travelling down the graph.
 */

/**
 * What an owner disposes. `retire`, where a node has it, takes the node out of
 * the updates to come without running any code of the application; see
 * `retireOwner`. It does not throw, and does nothing when called again.
 */
export type OwnedNode = Readonly<{
  dispose: () => void;
  disposed: boolean;
  retire?: () => void;
}>;

/** Filled by `Owner`'s static block; see `ownerBelow` and `retireOwner`. */
const mut_internals: {
  setDepthFloor: (owner: Owner, depthFloor: number) => void;
  retire: (owner: Owner) => void;
} = {
  setDepthFloor: () => {},
  retire: () => {},
};

/**
 * Everything created while its `run` executes belongs to it, and `dispose()`
 * disposes it: it takes everything in it, its child owners' included, out of
 * the updates first, then disposes the child owners, then runs the cleanups,
 * then disposes the nodes, each newest first. So no subscription or binding in
 * it hears what a cleanup writes or anything the disposal sets off, and a
 * cleanup reads the derived values its nodes held when the disposal began. The
 * exception is a projection or a setup that disposes an owner of its own
 * observable: what it made there before may still hear the cleanups. Made by
 * `createOwner` or `createRootOwner`.
 */
export class Owner {
  static {
    // The internal operations of `ownerBelow` and `retireOwner`, which reach the
    // private fields: no method of the public class offers them.
    mut_internals.setDepthFloor = (owner, depthFloor) => {
      if (depthFloor > owner.#mut_depthFloor) {
        owner.#mut_depthFloor = depthFloor;
      }
    };

    mut_internals.retire = (owner) => {
      // Reported, not thrown: it is called in the drain, and from a node's
      // `retire`, which does not throw.
      reportFailure(owner.#retire(undefined, false));
    };
  }

  readonly #parent: Owner | undefined;

  #mut_children: Owner[] | undefined;

  #mut_cleanups: (() => void)[] | undefined;

  #mut_nodes: OwnedNode[] | undefined;

  #mut_disposed: boolean;

  /** Disposed owners left in `#mut_children`. */
  #mut_deadChildren: number;

  /** `#mut_nodes` is swept of disposed nodes when it reaches this length. */
  #mut_sweepAt: number;

  /** What was created after this owner was disposed during its own `run`. */
  #mut_late: OwnedNode[] | undefined;

  /** How many calls of `run` of this owner are executing. */
  #mut_running: number;

  /**
   * The least depth of a node created in this owner; see `ownerBelow`. A child
   * owner starts from its parent's.
   */
  #mut_depthFloor: number;

  /**
   * Whether `retireOwner` or `dispose` took it out of the updates. It stays
   * out: a child owner made in it before it is disposed starts retired, and a
   * node made in it is retired once the `run` that made it returns (see
   * `#retireJoined`). What is made after it is disposed during its own `run`
   * goes to `#takeLate`.
   */
  #mut_retired: boolean;

  /** What was made in this owner during its `run` after it was retired. */
  #mut_joined: OwnedNode[] | undefined;

  constructor(parent: Owner | undefined) {
    this.#parent = parent;

    this.#mut_depthFloor = parent === undefined ? 0 : parent.#mut_depthFloor;

    // A child made in a retired parent starts retired; one made after the
    // parent was disposed during its `run` lives until that `run` ends.
    this.#mut_retired =
      parent !== undefined && !parent.#mut_disposed && parent.#mut_retired;

    this.#mut_joined = undefined;

    this.#mut_children = undefined;

    this.#mut_deadChildren = 0;

    this.#mut_sweepAt = minimumSweep;

    this.#mut_late = undefined;

    this.#mut_running = 0;

    this.#mut_cleanups = undefined;

    this.#mut_nodes = undefined;

    this.#mut_disposed = false;

    if (parent === undefined) {
      return;
    }

    if (!parent.#mut_disposed) {
      if (parent.#mut_children === undefined) {
        parent.#mut_children = [this];
      } else {
        parent.#mut_children.push(this);
      }
    } else if (parent.#mut_running > 0) {
      // Made after the parent was disposed during its `run`, as a node made
      // then is: it lives until that `run` ends.
      parent.#takeLate(this);
    } else {
      this.#mut_disposed = true;
    }
  }

  #takeJoined(node: OwnedNode): void {
    if (this.#mut_joined === undefined) {
      this.#mut_joined = [node];
    } else {
      this.#mut_joined.push(node);
    }
  }

  #takeLate(node: OwnedNode): void {
    if (this.#mut_late === undefined) {
      this.#mut_late = [node];
    } else {
      this.#mut_late.push(node);
    }
  }

  /**
   * Disposes what was made after this owner was disposed, newest first. After
   * an exception from `fn`, an exception from a disposal is reported rather
   * than thrown, so that it does not replace the first. Not covered yet: these
   * are not taken out of the updates first, so an older one hears what a newer
   * one's teardown writes.
   */
  #disposeLate(fnThrew: boolean): void {
    const late = this.#mut_late;

    if (late === undefined) {
      return;
    }

    this.#mut_late = undefined;

    const failure = disposeNewestFirst(late, undefined);

    if (!fnThrew) {
      throwFailure(failure);
    } else if (failure !== undefined) {
      console.error(failure.error);
    }
  }

  /**
   * Called by a child owner that was disposed. It is not looked up: it stays
   * until half of the children are gone, which costs less than a splice per row
   * of a list. Disposing a child twice does nothing.
   */
  #childGone(): void {
    const children = this.#mut_children;

    // The parent is being disposed, and has let go of its children already.
    if (children === undefined) {
      return;
    }

    this.#mut_deadChildren += 1;

    if (this.#mut_deadChildren * 2 < children.length) {
      return;
    }

    this.#mut_children = children.filter((child) => !child.#mut_disposed);

    this.#mut_deadChildren = 0;
  }

  /**
   * Retires the subtree (see `retireOwner`). Each node is retired once: in an
   * owner retired before, only what joined it since and waits for its `run` to
   * return (see `#retireJoined`), which `dispose` retires now, walking the whole
   * tree, and `retireOwner` leaves to the `run`. A node whose `retire` throws,
   * against its contract, does not stop the rest; in an owner a node made for
   * itself, which that node retires through `retireOwner`, it is reported.
   */
  #retire(failure: Failure, joinedToo: boolean): Failure {
    if (this.#mut_disposed) {
      return failure;
    }

    let mut_failure = failure;

    if (this.#mut_retired) {
      if (!joinedToo) {
        return mut_failure;
      }

      const joined = this.#mut_joined;

      this.#mut_joined = undefined;

      mut_failure = retireEach(joined, mut_failure);
    } else {
      this.#mut_retired = true;

      mut_failure = retireEach(this.#mut_nodes, mut_failure);
    }

    for (const child of this.#mut_children ?? []) {
      mut_failure = child.#retire(mut_failure, joinedToo);
    }

    return mut_failure;
  }

  /**
   * Retires what joined this owner, retired, during the `run` that is
   * returning: not as it joined, since a node joins its owner before its
   * constructor ends. Until then it is in the updates, and hears what that
   * `run` writes; a disposal in it retires it at once (see `#retire`).
   * Reported, not thrown, as `retireOwner` reports.
   *
   * Not covered: a projection or a setup that retires or disposes an owner of
   * its own node while it runs. The node is retired or torn down before the
   * owner the projection runs in is among those it holds, so what the
   * projection makes may still hear that owner's cleanups. Code of the
   * application that ends its own enclosing lifetime from inside a projection
   * is rare, so it waits for a change of its own.
   */
  #retireJoined(): void {
    const joined = this.#mut_joined;

    if (joined === undefined) {
      return;
    }

    this.#mut_joined = undefined;

    reportFailure(retireEach(joined, undefined));
  }

  /**
   * Disposes this owner once its subtree is retired: its child owners are
   * disposed the same way, so that the tree is walked once, not once per level.
   */
  #disposeRetired(failure: Failure): Failure {
    this.#mut_disposed = true;

    const children = this.#mut_children;

    const cleanups = this.#mut_cleanups;

    const nodes = this.#mut_nodes;

    this.#mut_children = undefined;

    this.#mut_cleanups = undefined;

    this.#mut_nodes = undefined;

    if (this.#parent !== undefined) {
      this.#parent.#childGone();
    }

    // Newest first, by index: the lists are this owner's no longer, and a
    // reversed copy would allocate one per row of a list. Everything is
    // disposed even when something throws; see `disposeAll`.
    let mut_failure = failure;

    for (let mut_i = (children?.length ?? 0) - 1; mut_i >= 0; mut_i -= 1) {
      const child = children?.[mut_i];

      if (child === undefined || child.#mut_disposed) {
        continue;
      }

      mut_failure = child.#disposeRetired(mut_failure);
    }

    mut_failure = runNewestFirst(cleanups, mut_failure);

    return disposeNewestFirst(nodes, mut_failure);
  }

  get parent(): Owner | undefined {
    return this.#parent;
  }

  get disposed(): boolean {
    return this.#mut_disposed;
  }

  /**
   * Calls `fn` with this owner current, and returns what it returns. In a
   * disposed owner, `fn` still runs, and what it creates belongs to no owner.
   * What `fn` creates after disposing this owner is disposed when the outermost
   * `run` of this owner returns: not at once, since a node is adopted before
   * its constructor ends.
   */
  run<R>(fn: (this: unknown) => R): R {
    const previous = mut_current.owner;

    const previousFloor = mut_current.depthFloor;

    mut_current.owner = this.#mut_disposed ? undefined : this;

    mut_current.depthFloor = this.#mut_disposed ? 0 : this.#mut_depthFloor;

    this.#mut_running += 1;

    let mut_threw = true;

    try {
      const result = fn();

      mut_threw = false;

      return result;
    } finally {
      mut_current.owner = previous;

      mut_current.depthFloor = previousFloor;

      this.#mut_running -= 1;

      if (this.#mut_running === 0) {
        this.#retireJoined();

        this.#disposeLate(mut_threw);
      }
    }
  }

  /** Registers `cleanup` to run when this owner is disposed. */
  onCleanup(cleanup: (this: unknown) => void): void {
    if (this.#mut_disposed) {
      cleanup();

      return;
    }

    if (this.#mut_cleanups === undefined) {
      this.#mut_cleanups = [cleanup];
    } else {
      this.#mut_cleanups.push(cleanup);
    }
  }

  /**
   * Takes `node` into this owner; called by every node when it is created. An
   * owner disposed during its `run` disposes it when that `run` ends.
   *
   * A node disposed on its own (an unsubscribed subscriber) does not tell its
   * owner, so the list is swept of disposed nodes each time it doubles: a
   * long-lived owner that subscribes and unsubscribes keeps a bounded list, at
   * an amortized constant cost per node.
   */
  adopt(node: OwnedNode): void {
    if (this.#mut_disposed) {
      if (this.#mut_running > 0) {
        this.#takeLate(node);
      } else {
        node.dispose();
      }

      return;
    }

    if (this.#mut_retired) {
      if (this.#mut_running > 0) {
        this.#takeJoined(node);
      } else {
        // A node adopts itself only into the current owner, during a `run`:
        // one adopted outside a `run` was handed over constructed.
        reportFailure(retireEach([node], undefined));
      }
    }

    const nodes = this.#mut_nodes;

    if (nodes === undefined) {
      this.#mut_nodes = [node];

      return;
    }

    nodes.push(node);

    if (nodes.length < this.#mut_sweepAt) {
      return;
    }

    const live = nodes.filter((n) => !n.disposed);

    this.#mut_nodes = live;

    this.#mut_sweepAt = Math.max(minimumSweep, live.length * 2);
  }

  dispose(): void {
    if (this.#mut_disposed) {
      return;
    }

    // First out of the updates, the whole subtree at once (the child owners,
    // and the owners its nodes made for themselves): no effect anywhere in it,
    // a sibling's or a setup's included, runs for what a cleanup writes or for
    // anything the disposal sets off. Its nodes keep the values they hold for
    // the cleanups to read, and no longer follow their parents: a cleanup that
    // writes a state reads the owner's derived values from before the write.
    throwFailure(this.#disposeRetired(this.#retire(undefined, true)));
  }
}

/** The owner whose `run` is executing, and its depth floor. */
const mut_current: { owner: Owner | undefined; depthFloor: number } = {
  owner: undefined,
  depthFloor: 0,
};

/** The shortest node list that is swept; see `Owner.adopt`. */
const minimumSweep = 32;

/** Creates an owner, a child of the current owner (a root outside every one). */
export const createOwner = (): Owner => new Owner(mut_current.owner);

/** Creates an owner with no parent: only its own `dispose` disposes it. */
export const createRootOwner = (): Owner => new Owner(undefined);

/** The owner whose `run` is executing, if any. */
export const getOwner = (): Owner | undefined => mut_current.owner;

/**
 * Registers `cleanup` with the current owner. Outside every owner it warns,
 * since the cleanup would never run. The `this` of `cleanup` is `unknown`, so a
 * method of an observable (`onCleanup(o.dispose)`) does not type-check; wrap
 * it.
 */
export const onCleanup = (cleanup: (this: unknown) => void): void => {
  const owner = mut_current.owner;

  if (owner === undefined) {
    console.warn(
      'synstate-next: onCleanup() was called outside any owner; the cleanup will never run.',
    );

    return;
  }

  owner.onCleanup(cleanup);
};

/** Calls `fn` with no current owner: what it creates outlives the caller. */
export const untracked = <R,>(fn: (this: unknown) => R): R => {
  const previous = mut_current.owner;

  const previousFloor = mut_current.depthFloor;

  mut_current.owner = undefined;

  mut_current.depthFloor = 0;

  try {
    return fn();
  } finally {
    mut_current.owner = previous;

    mut_current.depthFloor = previousFloor;
  }
};

/**
 * The least depth of a node created now: the depth floor of the current owner,
 * 0 outside every owner. A node is placed at this depth when its parents would
 * put it higher.
 */
export const currentDepthFloor = (): number => mut_current.depthFloor;

/**
 * Creates an owner, a child of `parent`, whose nodes are all at depth
 * `depthFloor` or deeper: the nodes it creates, and those of its child owners.
 * A switch places its branch below the node that decides it this way, so that
 * the drain decides before it visits the branch; see `retireOwner`. An owner a
 * node makes for itself has no parent: the node retires it from its `retire`.
 */
export const ownerBelow = (
  parent: Owner | undefined,
  depthFloor: number,
): Owner => {
  const owner = new Owner(parent);

  mut_internals.setDepthFloor(owner, depthFloor);

  return owner;
};

/**
 * Takes the nodes and effects of `owner` and of its child owners out of the
 * updates to come, without running any code of the application: no cleanup,
 * no teardown. Called in the drain by a switch that decided to drop a branch,
 * before the drain reaches the branch's nodes (see `ownerBelow`), so that none
 * of them computes from a value the switch rules out. The owner is to be
 * disposed once the update has settled; until then its nodes keep their values
 * and emit nothing. The owner stays retired: a child owner made in it starts
 * retired, and a node made in it is retired when the `run` that made it
 * returns. A node's `retire` that throws is reported, not thrown.
 */
export const retireOwner = (owner: Owner): void => {
  mut_internals.retire(owner);
};

/**
 * Disposes `disposable`, reporting an exception from the disposal rather than
 * throwing it. For a disposal on the way out of a failure, so that it does not
 * replace the exception being thrown, and for one nobody asked for (an inner
 * observable let go of), which has no caller to throw to: thrown, it would
 * abandon the update under way.
 */
export const disposeReporting = (
  disposable: Readonly<{ dispose: () => void }>,
): void => {
  try {
    disposable.dispose();
  } catch (error) {
    console.error(error);
  }
};

/** Takes `node` into the current owner, if any. */
export const adoptIntoCurrentOwner = (node: OwnedNode): void => {
  mut_current.owner?.adopt(node);
};

/**
 * Disposes each of `items`, newest first: every one of them even when one
 * throws. The first exception is thrown once they are all disposed; a later one
 * is reported, so that it does not replace the first.
 */
export const disposeAll = (
  items: readonly (Readonly<{ dispose: () => void }> | undefined)[],
): void => {
  throwFailure(disposeEach(items));
};

/**
 * Disposes each of `items` as `disposeAll` does, and returns the first
 * exception rather than throwing it: for a caller that has work to finish
 * before it throws the exception with `throwFailure`.
 */
export const disposeEach = (
  items: readonly (Readonly<{ dispose: () => void }> | undefined)[],
): Failure => disposeNewestFirst(items, undefined);

/** The first exception of a disposal, held while the rest of it runs. */
export type Failure = Readonly<{ error: unknown }> | undefined;

/** Keeps the first exception, and reports `error` if it is a later one. */
export const keepFirst = (failure: Failure, error: unknown): Failure => {
  if (failure === undefined) {
    return { error };
  }

  console.error(error);

  return failure;
};

/** Keeps `first`'s exception, and reports `later`'s if it holds one. */
export const keepFirstOf = (
  first: NonNullable<Failure>,
  later: Failure,
): Failure => (later === undefined ? first : keepFirst(first, later.error));

/** Throws the exception `failure` holds, if any. */
export const throwFailure = (failure: Failure): void => {
  if (failure !== undefined) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- what a cleanup or a disposal threw, passed on unchanged
    throw failure.error;
  }
};

/** Reports the exception `failure` holds, if any, with `console.error`. */
const reportFailure = (failure: Failure): void => {
  if (failure !== undefined) {
    console.error(failure.error);
  }
};

const disposeNewestFirst = (
  items: readonly (Readonly<{ dispose: () => void }> | undefined)[] | undefined,
  failure: Failure,
): Failure => {
  if (items === undefined) {
    return failure;
  }

  let mut_failure = failure;

  for (let mut_i = items.length - 1; mut_i >= 0; mut_i -= 1) {
    try {
      items[mut_i]?.dispose();
    } catch (error) {
      mut_failure = keepFirst(mut_failure, error);
    }
  }

  return mut_failure;
};

const runNewestFirst = (
  fns: readonly (() => void)[] | undefined,
  failure: Failure,
): Failure => {
  if (fns === undefined) {
    return failure;
  }

  let mut_failure = failure;

  for (let mut_i = fns.length - 1; mut_i >= 0; mut_i -= 1) {
    // Taken out first, so that it is called with no `this`, as a cleanup
    // registered after the owner was disposed is, not with the array.
    const fn = fns[mut_i];

    try {
      fn?.();
    } catch (error) {
      mut_failure = keepFirst(mut_failure, error);
    }
  }

  return mut_failure;
};

/** Retires each node, keeping the first exception; see `keepFirst`. */
const retireEach = (
  nodes: readonly OwnedNode[] | undefined,
  failure: Failure,
): Failure => {
  let mut_failure = failure;

  for (const node of nodes ?? []) {
    try {
      node.retire?.();
    } catch (error) {
      mut_failure = keepFirst(mut_failure, error);
    }
  }

  return mut_failure;
};
