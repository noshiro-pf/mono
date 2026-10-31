import type { InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
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
      top: view(position, (p) => `${p.top - playerNameRectPadding}px`),
      left: view(position, (p) => `${p.left - playerNameRectPadding}px`),
      width: view(position, (p) => `${p.width + 2 * playerNameRectPadding}px`),
      height: view(
        position,
        (p) => `${p.height + 2 * playerNameRectPadding}px`,
      ),
    }}
  />
);
