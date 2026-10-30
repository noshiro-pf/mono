import type { LocalizedText } from '../constants.mjs';

/**
 * A graph to animate. `nodes` is in creation order, the source first: a
 * parent's children are queued in the order they were created, as in
 * synstate.
 */
export type Scenario = Readonly<{
  nodes: readonly ScenarioNode[];
  initialValue: number;
  inputs: readonly number[];
}>;

export type ScenarioNode = Readonly<{
  id: string;
  depth: number;
  parents: readonly string[];
  /** Center of the node in the drawing. */
  x: number;
  /** Which side of the node its values are written on. */
  valuesSide: 'left' | 'right';
  op?: OperatorLabel;
  /** Absent on the source. */
  evaluate?: (parentValues: readonly number[]) => Evaluation;
}>;

export type OperatorLabel = Readonly<{ text: string; x: number; y: number }>;

export type Evaluation = Readonly<
  | { type: 'emit'; value: number; formula: string }
  | { type: 'skip'; reason: LocalizedText }
>;
