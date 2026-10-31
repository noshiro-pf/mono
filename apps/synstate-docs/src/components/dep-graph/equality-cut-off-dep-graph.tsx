import * as React from 'react';
import {
  DepGraph,
  type DepGraphStyles,
  type EdgeDef,
  type NodeDef,
} from './dep-graph.js';

export const EqualityCutOffDepGraph = React.memo(() => (
  <DepGraph edges={edges} nodes={nodes} styles={styles} />
));

EqualityCutOffDepGraph.displayName = 'EqualityCutOffDepGraph';

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
    id: 'source',
    label: 'source',
    sublabel: '(source: 0)',
    color: '#3b82f6',
    col: 0,
    row: 2,
  },
  {
    id: 'bucket',
    label: 'bucket',
    sublabel: '\u{230A}source / 1000\u{230B}',
    color: '#818cf8',
    col: 1,
    row: 2,
  },
  {
    id: 'view0',
    label: 'view[0]',
    sublabel: 'bucket + 0',
    color: '#818cf8',
    col: 2,
    row: 0,
  },
  {
    id: 'view1',
    label: 'view[1]',
    sublabel: 'bucket + 1',
    color: '#818cf8',
    col: 2,
    row: 1,
  },
  {
    id: 'viewN',
    label: 'view[W\u{2212}1]',
    sublabel: 'bucket + (W\u{2212}1)',
    color: '#818cf8',
    col: 2,
    row: 3,
  },
  {
    id: 'subscriber0',
    label: 'subscriber',
    sublabel: 'records last value',
    color: '#f59e0b',
    col: 3,
    row: 0,
  },
  {
    id: 'subscriber1',
    label: 'subscriber',
    sublabel: 'records last value',
    color: '#f59e0b',
    col: 3,
    row: 1,
  },
  {
    id: 'subscriberN',
    label: 'subscriber',
    sublabel: 'records last value',
    color: '#f59e0b',
    col: 3,
    row: 3,
  },
] as const;

const edges: readonly EdgeDef[] = [
  { from: 'source', to: 'bucket' },
  { from: 'bucket', to: 'view0' },
  { from: 'bucket', to: 'view1' },
  { from: 'bucket', to: 'viewN' },
  { from: 'view0', to: 'subscriber0' },
  { from: 'view1', to: 'subscriber1' },
  { from: 'viewN', to: 'subscriberN' },
] as const;
