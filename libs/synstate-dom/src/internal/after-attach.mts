import { getCurrentScope, onScopeDispose } from 'synstate';

/**
 * Nodes are mounted before they are inserted: an element mounts all its
 * children and then appends them, `render` mounts the app and then appends it,
 * and `For` and `If` mount a row or a branch and then insert it. A child
 * mounted later that writes to what an earlier `For` or `If` reads updates them
 * while their anchor is in no parent yet (#2935).
 *
 * Every mount-and-insert goes through {@link mountThenInsert}. A `For` or a
 * switch takes {@link applyWhenAttached} when it is mounted, which notes the
 * mount open then; a value that arrives while its anchor is detached is kept,
 * and the latest one is applied once that mount has inserted its nodes.
 *
 * `mount` takes `arg` rather than closing over it, so that the element and
 * `render` paths allocate nothing; a mount that nothing defers to allocates no
 * frame.
 */
export const mountThenInsert = <A, N, T>(
  mount: (input: A) => N,
  arg: A,
  insert: (into: T, mounted: N) => void,
  target: T,
): N => {
  mut_state.depth += 1;

  mut_state.lastId += 1;

  const { depth } = mut_state;

  mut_state.ids[depth] = mut_state.lastId;

  // Left behind by a mount at this depth that threw.
  takeFrame(depth);

  const nodes = runMount(mount, arg, depth);

  const frame = takeFrame(depth);

  insert(target, nodes);

  if (frame !== undefined) {
    runAll(frame);
  }

  return nodes;
};

/** Appends `nodes` to `parent`: an `insert` for {@link mountThenInsert}. */
export const appendTo = (
  parent: Element,
  nodes: readonly ChildNode[],
): void => {
  parent.append(...nodes);
};

/** Inserts `nodes` in front of `next`: an `insert` for {@link mountThenInsert}. */
export const insertBefore = (
  next: ChildNode,
  nodes: readonly ChildNode[],
): void => {
  next.before(...nodes);
};

/**
 * Returns the function a `For` or a switch calls with each value after its
 * first. While `anchor` is attached the value is applied at once, and replaces
 * any value still waiting. While it is detached the value is kept, and the
 * latest one is applied once the mount open now has inserted its nodes, and
 * only if `anchor` is then attached: it is not when the `For` or switch was
 * disposed in between.
 *
 * Mounted outside every {@link mountThenInsert} (a description mounted by hand),
 * there is nothing to wait for: a value that arrives while `anchor` is detached
 * is dropped.
 *
 * A value that arrives while `apply` runs (a row or a branch it mounts writes
 * what chose it, #3141) is kept too, and the latest one is applied once `apply`
 * returns, if `anchor` is still attached: applying it at once would act on rows
 * or a branch the running call has not finished recording. A write that keeps
 * coming back this way is an error after {@link maxReapply} passes, as synstate
 * stops a nested update loop.
 *
 * Once the scope current when it was taken is disposed, nothing more is
 * applied: `anchor` can still have a parent then, a disposed element that held
 * the `For` or switch.
 */
export const applyWhenAttached = <V,>(
  anchor: Node,
  apply: (value: V) => void,
): ((value: V) => void) => {
  const { depth } = mut_state;

  const id = mut_state.ids[depth];

  const mut_pending: { latest: Readonly<{ value: V }> | undefined } = {
    latest: undefined,
  };

  const mut_running = { current: false };

  const mut_disposed = { current: false };

  if (getCurrentScope() !== undefined) {
    onScopeDispose(() => {
      mut_disposed.current = true;
    });
  }

  const attached = (): boolean =>
    !mut_disposed.current && anchor.parentNode !== null;

  /** Applies `value`, then each value that arrived meanwhile, while attached. */
  const applyNow = (value: V): void => {
    mut_running.current = true;

    try {
      apply(value);

      for (let mut_pass = 1; ; mut_pass += 1) {
        const { latest } = mut_pending;

        mut_pending.latest = undefined;

        if (latest === undefined || !attached()) {
          return;
        }

        if (mut_pass >= maxReapply) {
          throw new Error(reapplyLoopMessage);
        }

        apply(latest.value);
      }
    } finally {
      mut_running.current = false;
    }
  };

  const flush = (): void => {
    const { latest } = mut_pending;

    mut_pending.latest = undefined;

    if (latest !== undefined && attached()) {
      applyNow(latest.value);
    }
  };

  return (value) => {
    if (mut_running.current) {
      mut_pending.latest = { value };

      return;
    }

    if (attached()) {
      mut_pending.latest = undefined;

      applyNow(value);

      return;
    }

    const scheduled = mut_pending.latest !== undefined;

    mut_pending.latest = { value };

    if (scheduled) {
      return;
    }

    if (depth === 0 || mut_state.depth < depth || mut_state.ids[depth] !== id) {
      // That mount has ended: its nodes are inserted.
      flush();

      return;
    }

    const mut_frame = mut_state.frames[depth];

    if (mut_frame === undefined) {
      mut_state.frames[depth] = [flush];
    } else {
      mut_frame.push(flush);
    }
  };
};

/** How many times a value written from inside `apply` is applied in a row. */
const maxReapply = 100;

const reapplyLoopMessage =
  `synstate-dom: a For or a switch was updated more than ${maxReapply.toString()} times in a row by the rows or branch it was mounting: a row or branch keeps writing the value that chose it. Make the write stop (a condition, or a value that leads to rows or a branch that do not write).` as const;

const mut_state: {
  depth: number;
  lastId: number;
  /** The id of the mount open at each depth. */
  ids: number[];
  /** What was deferred to the mount open at each depth, in order. */
  frames: ((() => void)[] | undefined)[];
} = { depth: 0, lastId: 0, ids: [0], frames: [] };

/** Takes what was deferred to the mount at `depth` out of the state. */
const takeFrame = (depth: number): readonly (() => void)[] | undefined => {
  const frame = mut_state.frames[depth];

  mut_state.frames[depth] = undefined;

  return frame;
};

/**
 * Runs what was deferred to a mount. One that throws does not keep the rest
 * from running, or they would keep their value waiting for good; the first
 * error is rethrown once they have run.
 */
const runAll = (frame: readonly (() => void)[]): void => {
  for (const [index, apply] of frame.entries()) {
    try {
      apply();
    } catch (error) {
      runAll(frame.slice(index + 1));

      throw error;
    }
  }
};

/** A mount that throws must not leave the depth raised. */
const runMount = <A, N>(mount: (input: A) => N, arg: A, depth: number): N => {
  try {
    return mount(arg);
  } finally {
    mut_state.depth = depth - 1;
  }
};
