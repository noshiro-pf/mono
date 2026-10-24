import type { LocalizedText } from './scenario.mjs';

/**
 * One step of a traced update: every field the propagation reads or writes,
 * as it stands after the step, written as source text (`undefined`, `t1`,
 * `[10, 0]`).
 */
export type TraceStep = Readonly<{
  /** The tokens issued since the outermost update began, oldest first. */
  freshTokens: readonly string[];
  module: ModuleState;
  /** The queues of the updates open now, the outermost first. */
  queues: readonly QueueState[];
  /** The local variables of the function running, by name. */
  locals: readonly Local[];
  nodes: readonly NodeRow[];
  /** Outermost call first. */
  stack: readonly string[];
  /** Ids of the code lines to highlight. */
  code: readonly string[];
  activeNode: string | undefined;
  caption: LocalizedText;
}>;

/** The module state of `propagation-state.mts`. */
export type ModuleState = Readonly<{
  propagationDepth: number;
  outermostToken: string;
  level: number;
  heads: readonly string[];
  tails: readonly string[];
}>;

/** The private fields of an `UpdateQueue`, which is also its token. */
export type QueueState = Readonly<{
  token: string;
  base: number;
  ownsLists: boolean;
  size: number;
  spill: string;
  spilled: string;
}>;

export type Local = Readonly<{ name: string; value: string }>;

export type NodeRow = Readonly<{
  id: string;
  depth: number;
  snapshot: string;
  updateToken: string;
  queuedFor: string;
  nextInQueue: string;
  /** Whether the node emitted in the update this step belongs to. */
  emitted: boolean;
  /** Whether the node was visited and did not emit. */
  skipped: boolean;
}>;

export type TraceNode = Readonly<{
  id: string;
  depth: number;
  parents: readonly string[];
  /** How the node is created, for the drawing. */
  op: string;
  /** Center of the node in the drawing. */
  x: number;
}>;

export type CodeLine = readonly [id: string, text: string];

export const undefinedText = 'undefined';
