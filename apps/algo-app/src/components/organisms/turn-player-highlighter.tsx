import type { InitializedObservable } from 'synstate';
import { constant, inlineMap, type JSX } from 'synstate-dom';
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
      top: inlineMap(position, (p) => `${p.top - playerNameRectPadding}px`),
      left: inlineMap(position, (p) => `${p.left - playerNameRectPadding}px`),
      width: inlineMap(
        position,
        (p) => `${p.width + 2 * playerNameRectPadding}px`,
      ),
      height: inlineMap(
        position,
        (p) => `${p.height + 2 * playerNameRectPadding}px`,
      ),
    }}
  />
);
