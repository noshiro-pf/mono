import * as React from 'react';
import { DepGraph, type EdgeDef, type NodeDef } from './dep-graph.js';

export const DerivedChainDepGraph = React.memo(() => (
  <DepGraph edges={edges} nodes={nodes} />
));

DerivedChainDepGraph.displayName = 'DerivedChainDepGraph';

const nodes: readonly NodeDef[] = [
  {
    id: 'counter',
    label: 'counter',
    sublabel: '(source: 0)',
    color: '#3b82f6',
    col: 0,
    row: 0,
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
    id: 'quadrupled',
    label: 'quadrupled',
    sublabel: '= doubled \u00D7 2',
    color: '#60a5fa',
    col: 2,
    row: 0,
  },
  {
    id: 'subscriber',
    label: 'subscriber',
    sublabel: 'records last value',
    color: '#f59e0b',
    col: 3,
    row: 0,
  },
] as const;

const edges: readonly EdgeDef[] = [
  { from: 'counter', to: 'doubled' },
  { from: 'doubled', to: 'quadrupled' },
  { from: 'quadrupled', to: 'subscriber' },
] as const;
