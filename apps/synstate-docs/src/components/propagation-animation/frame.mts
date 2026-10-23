import { Arr } from 'ts-data-forge';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import type { Lang, LocalizedText, Scenario } from './scenario.mjs';

/** What a simulator hands the player: the graph, its code, and the frames. */
export type Trace = Readonly<{
  label: string;
  scenario: Scenario;
  /** The pseudo-code shown beside the drawing, one `[id, text]` per line. */
  code: readonly CodeLine[];
  showTokens: boolean;
  legend: readonly LegendKey[];
  frames: readonly Frame[];
}>;

export type CodeLine = FixedLengthTuple<2, string>;

export type LegendKey =
  'emitted' | 'visiting' | 'skipped' | 'queued' | 'glitch';

export type Frame = Readonly<{
  /** 0 before the first update. */
  update: number;
  nodes: ReadonlyRecord<string, NodeState>;
  panel: Panel;
  activeNode: string | undefined;
  edges: readonly EdgeHighlight[];
  /** Ids of the code lines to highlight. */
  code: readonly string[];
  caption: LocalizedText;
}>;

/** The left-hand side of the drawing: where the algorithm keeps its work. */
export type Panel = Readonly<
  | {
      type: 'buckets';
      maxDepth: number;
      activeDepth: number | undefined;
      chips: readonly Chip[];
    }
  | { type: 'priorityQueue'; chips: readonly Chip[] }
  | { type: 'callStack'; calls: readonly string[] }
>;

export type NodeState = Readonly<{
  history: readonly HistoryEntry[];
  /** The update the node last emitted in; 0 is the initial one. */
  token: number;
  status: NodeStatus;
}>;

export type HistoryEntry = Readonly<{ value: number; glitch: boolean }>;

export type NodeStatus = 'idle' | 'visiting' | 'emitted' | 'skipped';

/** A node waiting in a queue, or, when `leaving`, just taken out of one. */
export type Chip = Readonly<{
  key: string;
  node: string;
  /** The parent that queued it. */
  from: string;
  /** The bucket's depth; 0 for the single lane of a priority queue. */
  lane: number;
  slot: number;
  leaving: boolean;
  /** A small note under the chip, such as its level. */
  note?: string;
}>;

export type EdgeHighlight = Readonly<{
  from: string;
  to: string;
  kind: EdgeKind;
}>;

export type EdgeKind = 'queue' | 'already' | 'emitted' | 'stale' | 'call';

/** The mutable state a simulator keeps per node. */
// transformer-ignore-next-line convert-to-readonly
export type MutableNodeState = {
  history: HistoryEntry[];
  token: number;
  status: NodeStatus;
};

export const initialStates = (
  scenario: Scenario,
): ReadonlyMap<string, MutableNodeState> =>
  new Map(
    scenario.nodes.map((n) => [
      n.id,
      {
        history: [{ value: scenario.initialValue, glitch: false }],
        token: 0,
        status: 'idle',
      },
    ]),
  );

/** A copy of the node states, for a frame. */
export const freezeStates = (
  states: ReadonlyMap<string, NodeState>,
): ReadonlyRecord<string, NodeState> =>
  Object.fromEntries(
    Array.from(states, ([id, s]) => [
      id,
      { history: Array.from(s.history), token: s.token, status: s.status },
    ]),
  );

export const latestValue = (state: NodeState | undefined): number =>
  state?.history.at(-1)?.value ?? 0;

/** Picks the singular or the plural form for the number of `ids`. */
export const byCount = (
  ids: readonly string[],
  one: string,
  many: string,
): string => (Arr.isFixedLengthArray(1, ids) ? one : many);

export const list = (ids: readonly string[], lang: Lang): string =>
  lang === 'ja'
    ? ids.join('、')
    : Arr.isMaxLengthArray(2, ids)
      ? ids.join(' and ')
      : (`${Arr.butLast(ids).join(', ')} and ${ids.at(-1) ?? ''}` as const);
