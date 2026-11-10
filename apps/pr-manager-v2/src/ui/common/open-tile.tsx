import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import './common.css';

/** `open`: what is shown of all, not a switch. */
export const OpenTile = ({
  open,
}: Readonly<{
  open: InitializedObservable<Readonly<{ shown: number; total: number }>>;
}>): JSX.Element => (
  <div class={constant('tile')}>
    <span class={constant('tile-value')}>
      {open.pipe(
        map(({ shown, total }) =>
          shown === total ? total.toString() : `${shown} of ${total}`,
        ),
      )}
    </span>
    <span class={constant('tile-label')}>{constant('open')}</span>
  </div>
);
