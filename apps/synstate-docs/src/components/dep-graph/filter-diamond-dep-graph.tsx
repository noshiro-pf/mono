import * as React from 'react';
import { DepGraph, type EdgeDef, type NodeDef } from './dep-graph.js';

export const FilterDiamondDepGraph = React.memo(() => (
  <DepGraph edges={edges} nodes={nodes} />
));

FilterDiamondDepGraph.displayName = 'FilterDiamondDepGraph';

const nodes: readonly NodeDef[] = [
  {
    id: 'A',
    label: 'A: counter',
    sublabel: '(source)',
    color: '#6366f1',
    col: 0,
    row: 1,
  },
  {
    id: 'B',
    label: 'B: multipliedBy10',
    sublabel: '= counter × 10',
    color: '#8b5cf6',
    col: 1,
    row: 0,
  },
  {
    id: 'D',
    label: 'D: filteredEven',
    sublabel: '= counter | filter even',
    color: '#ec4899',
    col: 1,
    row: 2,
  },
  {
    id: 'C',
    label: 'C: sum',
    // Letters, not names: B and E are both labelled multipliedBy10 here, so a
    // name would not say which of them C reads; D is a letter too, so the sum
    // reads as one expression.
    sublabel: '= B + D',
    color: '#10b981',
    col: 2,
    row: 1,
  },
  {
    id: 'E',
    label: 'E: multipliedBy10',
    sublabel: '= filteredEven × 10',
    color: '#8b5cf6',
    col: 2,
    row: 3,
  },
] as const;

const edges: readonly EdgeDef[] = [
  { from: 'A', to: 'B' },
  { from: 'A', to: 'D' },
  { from: 'B', to: 'C' },
  { from: 'D', to: 'C' },
  { from: 'D', to: 'E' },
] as const;
