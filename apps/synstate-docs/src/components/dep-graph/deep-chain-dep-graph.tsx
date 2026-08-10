import * as React from 'react';
import { DepGraph, type EdgeDef, type NodeDef } from './dep-graph.js';

export const DeepChainDepGraph = React.memo(() => (
  <DepGraph edges={edges} nodes={nodes} />
));

DeepChainDepGraph.displayName = 'DeepChainDepGraph';

const nodes: readonly NodeDef[] = [
  {
    id: 'source',
    label: 'source',
    sublabel: '(head position)',
    color: '#3b82f6',
    col: 0,
    row: 0,
  },
  {
    id: 'scan1',
    label: 'scan₁',
    sublabel: 'lerp stage 1',
    color: '#60a5fa',
    col: 1,
    row: 0,
  },
  {
    id: 'scan2',
    label: 'scan₂',
    sublabel: 'lerp stage 2',
    color: '#60a5fa',
    col: 2,
    row: 0,
  },
  {
    id: 'scan3',
    label: 'scan₃',
    sublabel: 'lerp stage 3',
    color: '#60a5fa',
    col: 3,
    row: 0,
  },
  {
    id: 'combine',
    label: 'combine',
    sublabel: 'all N+1 outputs',
    color: '#818cf8',
    col: 4,
    row: 1,
  },
  {
    id: 'subscriber',
    label: 'subscriber',
    sublabel: 'draw snake',
    color: '#ce8b17',
    col: 5,
    row: 1,
  },
] as const;

const edges: readonly EdgeDef[] = [
  { from: 'source', to: 'scan1' },
  { from: 'scan1', to: 'scan2' },
  { from: 'scan2', to: 'scan3' },
  { from: 'source', to: 'combine', fromSide: 'bottom' },
  { from: 'scan1', to: 'combine', fromSide: 'bottom' },
  { from: 'scan2', to: 'combine', fromSide: 'bottom' },
  { from: 'scan3', to: 'combine', fromSide: 'bottom' },
  { from: 'combine', to: 'subscriber' },
] as const;
