/** The `queue/pr-<N>` branches the worker checks ahead on. */

import type { HeadChecks } from './checks.mjs';
import type { Read } from './read-result.mjs';

export type QueueLayerFacts = Readonly<{
  /** `queue/pr-<N>`. */
  branch: string;
  /**
   * The pull request and head its `Queue-Layer:` trailer names, or `undefined`
   * where the trailer is missing or malformed: such a layer is no longer valid,
   * and checking ahead cleans it up like any other.
   */
  origin: Readonly<{ number: number; builtFromHead: string }> | undefined;
  /** The layer's commit, its tree, and its parent and the parent's tree. */
  sha: string;
  tree: string;
  parent: string;
  parentTree: string;
  /** When the commit was made, which orders two stacks on one tree. */
  committedAt: string;
  /** The runs dispatched on the layer commit, and their rounds. */
  checks: Read<HeadChecks>;
}>;

/** The layers, and the tree of the default branch's tip they stand on. */
export type QueueLayersFacts = Readonly<{
  baseTree: string;
  layers: readonly QueueLayerFacts[];
  /**
   * For each open pull request whose layer was built from another head, its
   * current head and that head's tree, which may be the layer's
   * (`withMovedHeads`). A head whose tree could not be read is left out: its
   * layer is then built again.
   */
  movedHeads: ReadonlyMap<number, MovedHead>;
}>;

/** A pull request's current head, and its tree. */
export type MovedHead = Readonly<{ head: string; tree: string }>;
