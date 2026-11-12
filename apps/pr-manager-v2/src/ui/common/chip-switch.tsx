import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import type { TileCount } from '../../domain/index.mjs';
import './common.css';
import { TileValue } from './tile-value.js';

/** A small switch with its count, for priorities, drafts and the like. */
export const ChipSwitch = ({
  count,
  label,
  title,
  onToggle,
}: Readonly<{
  count: InitializedObservable<TileCount>;
  label: string;
  title: string;
  onToggle: () => void;
}>): JSX.Element => (
  <button
    aria-pressed={count.pipe(map(({ hidden }) => !hidden))}
    class={constant('chip')}
    title={constant(title)}
    type={constant('button')}
    onClick={onToggle}
  >
    {constant(label)}
    <TileValue count={count} />
  </button>
);
