import * as React from 'react';
import {
  DepGraph,
  type DepGraphStyles,
  type EdgeDef,
  type NodeDef,
} from './dep-graph.js';

export const ConditionalFanOutDepGraph = React.memo(() => (
  <DepGraph edges={edges} nodes={nodes} styles={styles} />
));

ConditionalFanOutDepGraph.displayName = 'ConditionalFanOutDepGraph';

const styles: DepGraphStyles = {
  NODE_WIDTH: 140,
  NODE_HEIGHT: 48,
  H_GAP: 60,
  V_GAP: 16,
  FONT_SIZE: 14,
  SUB_FONT_SIZE: 11,
} as const;

const nodes: readonly NodeDef[] = [
  {
    id: 'selector',
    label: 'selector',
    sublabel: '(source: 0)',
    color: '#3b82f6',
    col: 0,
    row: 0,
  },
  {
    id: 'branch0',
    label: 'branch[0]',
    sublabel: '(source: 0) \u2190 active',
    color: '#3b82f6',
    col: 0,
    row: 1,
  },
  {
    id: 'branch1',
    label: 'branch[1]',
    sublabel: '(source: 0)',
    color: '#94a3b8',
    col: 0,
    row: 2,
  },
  {
    id: 'branchN',
    label: 'branch[B\u22121]',
    sublabel: '(source: 0)',
    color: '#94a3b8',
    col: 0,
    row: 4,
  },
  {
    id: 'result',
    label: 'result',
    sublabel: 'combine \u2192 map',
    color: '#818cf8',
    col: 1,
    row: 2,
  },
  {
    id: 'subscriber',
    label: 'subscriber',
    sublabel: 'records last value',
    color: '#f59e0b',
    col: 2,
    row: 2,
  },
] as const;

const edges: readonly EdgeDef[] = [
  { from: 'selector', to: 'result' },
  { from: 'branch0', to: 'result' },
  { from: 'branch1', to: 'result' },
  { from: 'branchN', to: 'result' },
  { from: 'result', to: 'subscriber' },
] as const;
