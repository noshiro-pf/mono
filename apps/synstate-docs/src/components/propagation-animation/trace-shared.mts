// cspell:ignore Menlo Consolas -- font names in the monospace stack
import type * as React from 'react';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { NodeRow, TraceNode } from './trace-step.mjs';

export type Point = Readonly<{ x: number; y: number }>;

export type Pointer = Readonly<{ label: string; kind: PointerKind }>;

export type PointerKind = 'bucket' | 'local';

export const nodeFields = [
  'snapshot',
  'updateToken',
  'queuedFor',
] as const satisfies readonly (keyof NodeRow)[];

export type Graph = Readonly<{
  nodes: readonly TraceNode[];
  nodeById: ReadonlyMap<string, TraceNode>;
  viewHeight: number;
}>;

export const centerOf = (n: TraceNode): Point =>
  ({ x: n.x, y: 62 + n.depth * 112 }) as const;

export const nodeRadius = 24;

export const monoFont =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export const colors = {
  background: '#37474f',
  edge: '#90a4ae',
  text: '#eceff1',
  muted: '#b0bec5',
  nodeText: '#263238',
  values: '#fff59d',
  fresh: '#69f0ae',
  token: '#4dd0e1',
  tokenStale: '#78909c',
  active: '#ff4081',
  queued: '#fff59d',
  op: '#c5e1a5',
  idle: '#e0e0e0',
  emitted: '#ffb74d',
  skipped: '#78909c',
  changed: 'rgba(255, 64, 129, 0.35)',
} as const;

export const pointerColors = {
  bucket: '#4dd0e1',
  local: '#f48fb1',
} as const satisfies ReadonlyRecord<PointerKind, string>;

export const panelStyle: React.CSSProperties = {
  flex: '1 1 12rem',
  margin: 0,
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  background: colors.background,
  color: colors.text,
  fontFamily: monoFont,
  fontSize: '0.78rem',
  lineHeight: 1.6,
} as const;

export const panelTitleStyle: React.CSSProperties = {
  margin: '0 0 0.25rem',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: colors.muted,
} as const;

export const fieldNameStyle: React.CSSProperties = {
  color: colors.muted,
} as const;

export const valueStyle: React.CSSProperties = {
  padding: '0 0.3rem',
  borderRadius: '3px',
  transition: 'background 300ms ease',
} as const;

export const valueChangedStyle: React.CSSProperties = {
  ...valueStyle,
  background: colors.changed,
  fontWeight: 700,
} as const;

export const mutedStyle: React.CSSProperties = {
  color: colors.muted,
} as const;
