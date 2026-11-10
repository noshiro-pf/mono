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
  /** The layer's commit, its tree and its parent's tree. */
  sha: string;
  tree: string;
  parentTree: string;
  /** When the commit was made, which orders two stacks on one tree. */
  committedAt: string;
  /** The runs dispatched on the layer commit, and their rounds. */
  checks: Read<HeadChecks>;
}>;
