import * as React from 'react';
import { DepGraph, type EdgeDef, type NodeDef } from './dep-graph.js';

export const SimpleDiamondDepGraph = React.memo(() => (
  <DepGraph edges={edges} nodes={nodes} />
));

SimpleDiamondDepGraph.displayName = 'SimpleDiamondDepGraph';

const nodes: readonly NodeDef[] = [
  {
    id: 'counter',
    label: 'A: counter',
    sublabel: '(source)',
    color: '#f59e0b',
    col: 0,
    row: 1,
  },
  {
    id: 'multipliedBy10',
    label: 'B: multipliedBy10',
    sublabel: '= counter × 10',
    color: '#8b5cf6',
    col: 1,
    row: 0,
  },
  {
    id: 'multipliedBy1000',
    label: 'C: multipliedBy1000',
    sublabel: '= counter × 1000',
    color: '#8b5cf6',
    col: 1,
    row: 2,
  },
  {
    id: 'combine',
    label: 'combine',
    sublabel: '[×10, ×1000]',
    color: '#6366f1',
    col: 2,
    row: 1,
  },
  {
    id: 'sum',
    label: 'D: sum',
    sublabel: '= ×10 + ×1000',
    color: '#10b981',
    col: 3,
    row: 1,
  },
] as const;

const edges: readonly EdgeDef[] = [
  { from: 'counter', to: 'multipliedBy10' },
  { from: 'counter', to: 'multipliedBy1000' },
  { from: 'multipliedBy10', to: 'combine' },
  { from: 'multipliedBy1000', to: 'combine' },
  { from: 'combine', to: 'sum' },
] as const;
