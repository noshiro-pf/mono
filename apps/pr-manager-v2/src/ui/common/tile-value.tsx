import { map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import type { TileCount } from '../../domain/index.mjs';
import './common.css';
import { OfTotal } from './of-total.js';

/**
 * A tile's or chip's count, struck through while what it counts is hidden, and
 * followed in small by how many there are when that is more.
 */
export const TileValue = ({
  count,
}: Readonly<{ count: InitializedObservable<TileCount> }>): JSX.Element => (
  <span
    class={constant('tile-value')}
    data-hidden={count.pipe(map(({ hidden }) => (hidden ? 'true' : 'false')))}
  >
    {count.pipe(map(({ count: n }) => n.toString()))}
    <If
      cond={count.pipe(map(({ count: n, total }) => n !== total))}
      then={<OfTotal total={count.pipe(map(({ total }) => total))} />}
    />
  </span>
);
