/**
 * Ownership. Everything created while an owner's `run` executes belongs to it,
 * and `dispose()` disposes it: the child owners first, then the cleanups, then
 * the nodes, each newest first. This is the only lifetime a node has; there is
 * no reference counting and no completion travelling down the graph.
 */

/** What an owner disposes. */
export type OwnedNode = Readonly<{ dispose: () => void; disposed: boolean }>;

export class Owner {
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

  constructor(parent: Owner | undefined) {
    this.#parent = parent;

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
   * than thrown, so that it does not replace the first.
   */
  #disposeLate(fnThrew: boolean): void {
    const late = this.#mut_late;

    if (late === undefined) {
      return;
    }

    this.#mut_late = undefined;

    for (let mut_i = late.length - 1; mut_i >= 0; mut_i -= 1) {
      const node = late[mut_i];

      if (node === undefined) {
        continue;
      }

      if (!fnThrew) {
        node.dispose();

        continue;
      }

      try {
        node.dispose();
      } catch (error) {
        console.error(error);
      }
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
  run<R>(fn: () => R): R {
    const previous = mut_current.owner;

    mut_current.owner = this.#mut_disposed ? undefined : this;

    this.#mut_running += 1;

    let mut_threw = true;

    try {
      const result = fn();

      mut_threw = false;

      return result;
    } finally {
      mut_current.owner = previous;

      this.#mut_running -= 1;

      if (this.#mut_running === 0) {
        this.#disposeLate(mut_threw);
      }
    }
  }

  /** Registers `cleanup` to run when this owner is disposed. */
  onCleanup(cleanup: () => void): void {
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
    // reversed copy would allocate one per row of a list.
    if (children !== undefined) {
      for (let mut_i = children.length - 1; mut_i >= 0; mut_i -= 1) {
        children[mut_i]?.dispose();
      }
    }

    if (cleanups !== undefined) {
      for (let mut_i = cleanups.length - 1; mut_i >= 0; mut_i -= 1) {
        cleanups[mut_i]?.();
      }
    }

    if (nodes !== undefined) {
      for (let mut_i = nodes.length - 1; mut_i >= 0; mut_i -= 1) {
        nodes[mut_i]?.dispose();
      }
    }
  }
}

const mut_current: { owner: Owner | undefined } = { owner: undefined };

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
 * since the cleanup would never run.
 */
export const onCleanup = (cleanup: () => void): void => {
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
export const untracked = <R,>(fn: () => R): R => {
  const previous = mut_current.owner;

  mut_current.owner = undefined;

  try {
    return fn();
  } finally {
    mut_current.owner = previous;
  }
};

/** Takes `node` into the current owner, if any. */
export const adoptIntoCurrentOwner = (node: OwnedNode): void => {
  mut_current.owner?.adopt(node);
};
