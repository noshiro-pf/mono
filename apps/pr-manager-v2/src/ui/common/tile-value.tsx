import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import type { TileCount } from '../../domain/index.mjs';
import './common.css';

/** A tile's count, struck through while what it counts is hidden. */
export const TileValue = ({
  count,
}: Readonly<{ count: InitializedObservable<TileCount> }>): JSX.Element => (
  <span
    class={constant('tile-value')}
    data-hidden={count.pipe(map(({ hidden }) => (hidden ? 'true' : 'false')))}
  >
    {count.pipe(map(({ count: n }) => n.toString()))}
  </span>
);
