import type { InitializedObservable } from 'synstate';
import { constant, type Bindable, type JSX } from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Rect } from 'ts-utils-additional';
import {
  playerNameRectPadding,
  playerNameRectSize,
} from '../../constants/index.mjs';
import { reportRectOn } from '../report-rect-on.mjs';
import * as styles from './player-name.module.css';

type Props = Readonly<{
  playerName: string;
  rotate: 0 | 90 | 180 | 270;
  isInTurn: Bindable<boolean>;
  /** When to measure the name again: whatever may have moved it. */
  measureOn: InitializedObservable<unknown>;
  onBoundingClientRectChange: (rect: Rect) => void;
}>;

export const PlayerName = ({
  playerName,
  rotate,
  isInTurn,
  measureOn,
  onBoundingClientRectChange,
}: Props): JSX.Element => {
  const ref = reportRectOn(measureOn, onBoundingClientRectChange);

  return (
    <div class={constant(styles.wrapper)}>
      <div class={{ [styles.inTurn]: isInTurn }}>
        <div ref={ref}>
          <div class={constant(styles.name)} style={rotateStyleOf(rotate)}>
            {constant(playerName)}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Only 0 and 90 were ever handled; the other two are drawn as they are, as they
 * always were.
 */
const rotateStyleOf = (
  rotate: 0 | 90 | 180 | 270,
): ReadonlyRecord<string, Bindable<string>> => {
  switch (rotate) {
    case 0:
      return {
        width: constant(
          `${playerNameRectSize.width - 2 * playerNameRectPadding}px`,
        ),
        height: constant(
          `${playerNameRectSize.height - 2 * playerNameRectPadding}px`,
        ),
      };

    case 90:
      return {
        'text-orientation': constant('sideways'),
        transform: constant('rotate(180deg)'),
        width: constant(
          `${playerNameRectSize.height - 2 * playerNameRectPadding}px`,
        ),
        height: constant(
          `${playerNameRectSize.width - 2 * playerNameRectPadding}px`,
        ),
      };

    case 180:
    case 270:
      return {};
  }
};
