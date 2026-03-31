import * as React from 'react';
import { DepGraph, type EdgeDef, type NodeDef } from './dep-graph.js';

export const DiamondDepGraph = React.memo(() => (
  <DepGraph edges={edges} nodes={nodes} />
));

DiamondDepGraph.displayName = 'DiamondDepGraph';

const nodes: readonly NodeDef[] = [
  {
    id: 'counter',
    label: 'counter',
    sublabel: '(source: 0)',
    color: '#3b82f6',
    col: 0,
    row: 1,
  },
  {
    id: 'doubled',
    label: 'doubled',
    sublabel: '= counter \u00D7 2',
    color: '#60a5fa',
    col: 1,
    row: 0,
  },
  {
    id: 'tripled',
    label: 'tripled',
    sublabel: '= counter \u00D7 3',
    color: '#60a5fa',
    col: 1,
    row: 2,
  },
  {
    id: 'sum',
    label: 'sum',
    sublabel: '= doubled + tripled',
    color: '#818cf8',
    col: 2,
    row: 1,
  },
  {
    id: 'subscriber',
    label: 'subscriber',
    sublabel: 'records last value',
    color: '#f59e0b',
    col: 3,
    row: 1,
  },
] as const;

const edges: readonly EdgeDef[] = [
  { from: 'counter', to: 'doubled' },
  { from: 'counter', to: 'tripled' },
  { from: 'doubled', to: 'sum' },
  { from: 'tripled', to: 'sum' },
  { from: 'sum', to: 'subscriber' },
] as const;
