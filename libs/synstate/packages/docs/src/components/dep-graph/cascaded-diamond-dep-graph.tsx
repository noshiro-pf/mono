import * as React from 'react';
import { DepGraph, type EdgeDef, type NodeDef } from './dep-graph.js';

export const CascadedDiamondDepGraph = React.memo(() => (
  <DepGraph edges={edges} nodes={nodes} />
));

CascadedDiamondDepGraph.displayName = 'CascadedDiamondDepGraph';

const nodes: readonly NodeDef[] = [
  {
    id: 'source',
    label: 'source',
    sublabel: '(root)',
    color: '#3b82f6',
    col: 0,
    row: 1,
  },
  {
    id: 'left1',
    label: 'left₁',
    sublabel: '= source + 1',
    color: '#60a5fa',
    col: 1,
    row: 0,
  },
  {
    id: 'right1',
    label: 'right₁',
    sublabel: '= source + 2',
    color: '#60a5fa',
    col: 1,
    row: 2,
  },
  {
    id: 'combine1',
    label: 'combine₁',
    color: '#818cf8',
    col: 2,
    row: 1,
  },
  {
    id: 'left2',
    label: 'left₂',
    sublabel: '= combine₁ + 1',
    color: '#60a5fa',
    col: 3,
    row: 0,
  },
  {
    id: 'right2',
    label: 'right₂',
    sublabel: '= combine₁ + 2',
    color: '#60a5fa',
    col: 3,
    row: 2,
  },
  {
    id: 'combine2',
    label: 'combine₂',
    color: '#818cf8',
    col: 4,
    row: 1,
  },
  {
    id: 'left3',
    label: 'left₃',
    sublabel: '= combine₂ + 1',
    color: '#60a5fa',
    col: 5,
    row: 0,
  },
  {
    id: 'right3',
    label: 'right₃',
    sublabel: '= combine₂ + 2',
    color: '#60a5fa',
    col: 5,
    row: 2,
  },
  {
    id: 'combine3',
    label: 'combine₃',
    color: '#818cf8',
    col: 6,
    row: 1,
  },
  {
    id: 'subscriber',
    label: 'subscriber',
    color: '#ce8b17',
    col: 7,
    row: 1,
  },
] as const;

const edges: readonly EdgeDef[] = [
  { from: 'source', to: 'left1' },
  { from: 'source', to: 'right1' },
  { from: 'left1', to: 'combine1' },
  { from: 'right1', to: 'combine1' },
  { from: 'combine1', to: 'left2' },
  { from: 'combine1', to: 'right2' },
  { from: 'left2', to: 'combine2' },
  { from: 'right2', to: 'combine2' },
  { from: 'combine2', to: 'left3' },
  { from: 'combine2', to: 'right3' },
  { from: 'left3', to: 'combine3' },
  { from: 'right3', to: 'combine3' },
  { from: 'combine3', to: 'subscriber' },
] as const;
