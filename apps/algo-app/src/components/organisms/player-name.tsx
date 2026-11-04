import type { InitializedObservable } from 'synstate';
import {
  constant,
  MatchOptional,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { Rect } from 'ts-utils-additional';
import {
  playerNameRectPadding,
  playerNameRectSize,
} from '../../constants/index.mjs';
import { reportRectOn } from '../report-rect-on.mjs';
import * as styles from './player-name.module.css';

type Props = Readonly<{
  /** `undefined` while nobody sits here: drawn as dots, waiting for them. */
  playerName: InitializedObservable<string | undefined>;
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

  // The name is laid out unturned, and the whole highlighter turned with the
  // seat, so that every seat reads its name the same way up.
  return (
    <div class={constant(styles.wrapper)}>
      <div
        class={{
          [styles.highlighter]: constant(true),
          [styles.inTurn]: isInTurn,
        }}
        style={{ transform: constant(`rotate(${rotate}deg)`) }}
      >
        <div ref={ref}>
          <div
            class={constant(styles.name)}
            style={{
              width: constant(
                `${playerNameRectSize.width - 2 * playerNameRectPadding}px`,
              ),
              height: constant(
                `${playerNameRectSize.height - 2 * playerNameRectPadding}px`,
              ),
            }}
          >
            <MatchOptional
              none={<div class={constant(styles.loadingDots)} />}
              some={(name) => <span>{name}</span>}
              value={view(playerName, Optional.fromNullable)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
