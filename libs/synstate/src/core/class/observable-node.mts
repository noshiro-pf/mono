import type {
  Observable,
  ObservableBase,
  UpdateToken,
} from '../types/index.mjs';

/**
 * The members the nodes of the graph call on one another, which the public
 * types leave out (#2117). Every observable is an instance of
 * `ObservableBaseClass` — of this copy of synstate or of another — and has
 * them.
 */
type NodeInternals = Readonly<{
  hasSubscriber: boolean;
  hasChild: boolean;
  hasActiveChild: () => boolean;
  tryUpdate: (updateToken: UpdateToken) => void;
  tryComplete: () => void;
  addChild: (child: ChildNode) => void;
  deleteChild: (child: ChildNode) => void;

  /**
   * The managers this node's own descendants register to: itself for a
   * manager, its parents' for a sync child, shared with its parent when it
   * has one. Cached so that creating a child does not walk its ancestors.
   */
  managers: readonly ManagerNode[];
}>;

/** An observable, as the other nodes of the graph see it. */
export type ObservableNode<A = unknown> = NodeInternals & Observable<A>;

export type ChildNode = NodeInternals &
  ObservableBase<unknown> &
  Readonly<{
    parents: readonly Observable<unknown>[];
  }>;

export type ManagerNode = NodeInternals &
  ObservableBase<unknown> &
  Readonly<{
    addDescendant: (child: ChildNode) => void;
    deleteDescendant: (child: ChildNode) => void;
  }>;

/**
 * The one place a public observable is seen as the node it is. Every
 * observable is built by a synstate class, and the public types carry a
 * brand an object literal cannot supply, so this holds for every value of
 * those types.
 */
export const toNode = <A,>(observable: Observable<A>): ObservableNode<A> =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  observable as ObservableNode<A>;
