import { map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import './common.css';
import { OfTotal } from './of-total.js';

/** `open`: what is shown, of all when that is more; not a switch. */
export const OpenTile = ({
  open,
}: Readonly<{
  open: InitializedObservable<Readonly<{ shown: number; total: number }>>;
}>): JSX.Element => (
  <div class={constant('tile')}>
    <span class={constant('tile-value')}>
      {open.pipe(map(({ shown }) => shown.toString()))}
      <If
        cond={open.pipe(map(({ shown, total }) => shown !== total))}
        then={<OfTotal total={open.pipe(map(({ total }) => total))} />}
      />
    </span>
    <span class={constant('tile-label')}>{constant('open')}</span>
  </div>
);
