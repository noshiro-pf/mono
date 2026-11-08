/**
 * The low-level API: a description that creates its DOM nodes by hand, for what
 * JSX cannot say (an error boundary that catches a mount, a router that mounts
 * a branch of its own), and the mount of a child into those nodes. `isChild` is
 * `mount.mts`'s.
 */
import { createOwner, getOwner } from 'synstate-next';
import { disposeReporting } from 'synstate-next/internal';
import * as Arr from 'ts-data-forge/array';
import {
  ControlDescription,
  MountedNodes,
  appendChildTo,
  mountChildInto,
  type Child,
  type Description,
} from './mount.mjs';

/**
 * A description that mounts with `mount`, which creates the nodes and returns
 * them: one node, or several in order. `mount` runs where the description is
 * mounted, in its owner, so that what it creates (a `subscribe`, a nested
 * mount) is disposed with it, and in its namespace. The same description may be
 * mounted any number of times; each mount calls `mount` again.
 *
 * The first and last nodes returned are where the mount begins and ends: a
 * `For` row or a branch is moved and removed by them. They stay where they are
 * while it is mounted, and nothing is inserted outside them; what changes goes
 * inside an element they hold, through a binding or `mountChild`.
 *
 * ```tsx
 * const Clock = (): JSX.Element =>
 *   mountable(() => {
 *     const time = document.createElement('time');
 *
 *     mountChild(
 *       now$.pipe(map((d) => d.toISOString())),
 *       time,
 *     );
 *
 *     return time;
 *   });
 * ```
 */
export const mountable = (
  mount: () => ChildNode | readonly ChildNode[],
): Description =>
  new ControlDescription((out) => {
    const nodes = mount();

    if (Arr.isArray(nodes)) {
      for (const node of nodes) {
        out.push(node);
      }
    } else {
      out.push(nodes);
    }
  });

/**
 * Mounts `child` and returns its nodes, in order: what a `mountable` puts inside
 * the elements it creates. What the child makes (a binding of text to an
 * observable, a `Switch`) belongs to an owner under the current one, and goes
 * when it does. A child that throws partway fails the call and leaves nothing
 * of itself: what it made before is disposed, and no node is appended.
 *
 * Given `parent`, the nodes are appended to it in one insertion, and created in
 * its namespace: SVG inside an `<svg>` built by hand, HTML inside its
 * `<foreignObject>`. Without, they are created in the namespace of the mount
 * under way, and the caller places them. Either way they are not removed when
 * the owner goes, which suits a `parent` the `mountable` created: it goes with
 * its element. To mount into an element that outlives the mount, use `Portal`.
 *
 * Called outside every owner (from an event handler, say), what it makes is
 * never disposed; it warns, whether or not this child makes anything.
 */
export const mountChild = (
  child: Child,
  parent?: Element,
): readonly ChildNode[] => {
  if (getOwner() === undefined) {
    console.warn(
      'synstate-dom-next: mountChild() was called outside any owner; its bindings will never be disposed.',
    );
  }

  if (typeof child === 'string' || typeof child === 'number') {
    // Constant text makes nothing to dispose: no owner for it.
    return mountNodes(child, parent);
  }

  // Under the current owner, from its depth floor.
  const owner = createOwner();

  try {
    return owner.run(() => mountNodes(child, parent));
  } catch (error) {
    disposeReporting(owner);

    throw error;
  }
};

const mountNodes = (
  child: Child,
  parent: Element | undefined,
): readonly ChildNode[] => {
  if (parent !== undefined) {
    return appendChildTo(child, parent).list;
  }

  const out = new MountedNodes();

  mountChildInto(child, out);

  return out.list;
};
