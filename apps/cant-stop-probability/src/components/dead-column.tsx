import { Button, ButtonGroup } from 'blueprint-synstate';
import { map } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import {
  columnIds,
  columnsAlive$,
  hitSomeAliveColumnProbability$,
  toggleColumn,
} from '../store.mjs';
import * as styles from './dead-column.module.css';

/**
 * A toggle per column, pressed while it is closed, and the chance a roll hits
 * one still open.
 */
export const DeadColumn = (): JSX.Element => (
  <div>
    <ButtonGroup>
      {columnIds.map((columnId, index) => {
        const closed$ = columnsAlive$.pipe(
          map((alive) => alive[index] !== true),
        );

        return (
          <Button
            active={closed$}
            aria-pressed={view(closed$, String)}
            class={styles.toggle}
            onClick={() => {
              toggleColumn(index);
            }}
          >
            <span class={{ [styles.closed]: closed$ }}>
              {constant(columnId)}
            </span>
          </Button>
        );
      })}
    </ButtonGroup>
    <div
      class={constant(styles.probability)}
      data-e2e={constant('hit-probability')}
    >
      {constant('確率： ')}
      {view(hitSomeAliveColumnProbability$, String)}
    </div>
  </div>
);
