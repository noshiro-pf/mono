import { type InitializedObservable, map } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import type { Rect } from 'ts-utils-additional';
import { playerNameRectPadding } from '../../constants/index.mjs';
import * as styles from './turn-player-highlighter.module.css';

type Props = Readonly<{
  position: InitializedObservable<Rect>;
}>;

export const TurnPlayerHighlighter = ({ position }: Props): JSX.Element => (
  <div
    class={constant(styles.highlighter)}
    style={{
      top: position.pipe(map((p) => `${p.top - playerNameRectPadding}px`)),
      left: position.pipe(map((p) => `${p.left - playerNameRectPadding}px`)),
      width: position.pipe(
        map((p) => `${p.width + 2 * playerNameRectPadding}px`),
      ),
      height: position.pipe(
        map((p) => `${p.height + 2 * playerNameRectPadding}px`),
      ),
    }}
  />
);
