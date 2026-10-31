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
   * The last update that queued this node (`propagation-state.mts`). Left in
   * place after the visit: the next update has another token.
   */
  queuedFor: UpdateToken | undefined;

  setQueuedFor: (updateToken: UpdateToken) => void;
}>;

/** An observable, as the other nodes of the graph see it. */
export type ObservableNode<A = unknown> = NodeInternals & Observable<A>;

export type ChildNode = NodeInternals &
  ObservableBase<unknown> &
  Readonly<{
    parents: readonly Observable<unknown>[];
  }>;

/**
 * The one place a public observable is seen as the node it is. Every observable
 * is built by a synstate class, and the public types carry a brand an object
 * literal cannot supply, so this holds for every value of those types.
 */
export const toNode = <A,>(observable: Observable<A>): ObservableNode<A> =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  observable as ObservableNode<A>;
