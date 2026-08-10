import { type ReadonlyRecord } from 'ts-type-forge';

/**
 * Marble color definitions with optimal text color (black or white) */
export const colors = {
  yellow: { fill: 'rgb(255, 203, 70)', text: '#000' },
  orange: { fill: 'rgb(255, 105, 70)', text: '#fff' },
  blue: { fill: 'rgb(62, 161, 203)', text: '#fff' },
  purple: { fill: 'rgb(155, 89, 182)', text: '#fff' },
  green: { fill: 'rgb(46, 204, 113)', text: '#fff' },
  red: { fill: 'rgb(231, 76, 60)', text: '#fff' },
  gray: { fill: 'rgb(136, 136, 136)', text: '#fff' },
  teal: { fill: 'rgb(26, 188, 156)', text: '#fff' },
} as const satisfies ReadonlyRecord<string, MarbleColor>;

export type MarbleColor = Readonly<{
  fill: string;
  text: string;
}>;
