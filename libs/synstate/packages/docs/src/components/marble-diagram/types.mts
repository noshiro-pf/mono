import { type MarbleColor } from '../constants.mjs';

export type TimelineDef = Readonly<{
  marbles: readonly Marble[];
  completion?: number; // time position of "|" marker
  error?: number; // time position of "X" marker
}>;

export type Marble = Readonly<{
  t: number; // time position (0–100 scale)
  label: string; // text inside the marble
  color: MarbleColor; // fill + text color
}>;
