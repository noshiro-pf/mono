// cspell:ignore Menlo Consolas -- font names in the monospace stack
export type Point = Readonly<{ x: number; y: number }>;

export const nodeRadius = 26;

export const laneX = 12;

export const laneWidth = 230;

export const chipWidth = 40;

export const chipX = (slot: number): number => laneX + 112 + slot * 50;

export const rowY = (depth: number): number => 52 + depth * 136;

export const translate = (p: Point): string =>
  `translate(${p.x.toString()}px, ${p.y.toString()}px)` as const;

export const monoFont =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export const colors = {
  background: '#37474f',
  laneBackground: 'rgba(255, 255, 255, 0.04)',
  laneActive: 'rgba(255, 64, 129, 0.12)',
  laneBorder: 'rgba(255, 255, 255, 0.18)',
  text: '#eceff1',
  mutedText: '#b0bec5',
  nodeText: '#263238',
  values: '#fff59d',
  fresh: '#69f0ae',
  token: '#4dd0e1',
  tokenStale: '#78909c',
  visiting: '#ff4081',
  opBackground: '#546e7a',
  opText: '#c5e1a5',
  chip: '#fff59d',
  chipBorder: '#fbc02d',
  glitch: '#ff5252',
} as const;

export const nodeFill = {
  idle: '#e0e0e0',
  visiting: '#e0e0e0',
  emitted: '#ffb74d',
  skipped: '#78909c',
} as const;
