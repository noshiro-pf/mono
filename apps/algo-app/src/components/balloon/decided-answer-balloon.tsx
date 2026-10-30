import { map, type InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import type { RectSize } from 'ts-utils-additional';
import type { DecidedAnswerBalloonProps } from '../../types/index.mjs';
import {
  CardComponent,
  faceUpCard,
  isSameCardDisplay,
} from '../card/index.mjs';
import {
  balloonClasses,
  balloonPositionStyle,
  balloonSizeStyle,
} from './balloon-base.mjs';
import * as styles from './decided-answer-balloon.module.css';
import { smallCardSize } from './small-card-size.mjs';

type Props = Readonly<{
  props: InitializedObservable<DecidedAnswerBalloonProps>;
}>;

const balloonPaddingPx = 5;

const balloonSize: RectSize = {
  width: balloonPaddingPx * 2 + smallCardSize.width,
  height: balloonPaddingPx * 2 + smallCardSize.height,
} as const;

const symbolSize: number = smallCardSize.height;

export const DecidedAnswerBalloon = ({ props }: Props): JSX.Element => {
  const symbolStyle = {
    top: constant(`${(balloonSize.height - symbolSize) / 2}px`),
    left: constant(`${(balloonSize.width - symbolSize) / 2}px`),
  } as const;

  return (
    <div
      class={constant(styles.balloon)}
      style={{
        ...balloonSizeStyle(balloonSize),
        ...balloonPositionStyle(props, balloonSize),
      }}
    >
      <div
        class={balloonClasses(view(props, (p) => p.arrowDirection))}
        style={balloonSizeStyle(balloonSize)}
      >
        <div
          class={constant(styles.content)}
          style={{ padding: constant(`${balloonPaddingPx}px`) }}
        >
          <CardComponent
            card={props.pipe(
              map(({ card }) => faceUpCard(card), {
                equals: isSameCardDisplay,
              }),
            )}
            size={constant(smallCardSize)}
          />
        </div>
      </div>

      <svg
        class={constant(styles.symbol)}
        fill={constant('none')}
        height={constant(symbolSize)}
        style={{
          ...symbolStyle,
          opacity: view(props, (p) => (p.showSymbol === 'o' ? '1' : '0')),
        }}
        viewBox={constant('0 0 100 100')}
        width={constant(symbolSize)}
      >
        <circle
          cx={constant('50')}
          cy={constant('50')}
          r={constant('45.5')}
          stroke={constant('#FF0000')}
          stroke-width={constant('9')}
        />
      </svg>

      <svg
        class={constant(styles.symbol)}
        fill={constant('none')}
        height={constant(symbolSize)}
        style={{
          ...symbolStyle,
          opacity: view(props, (p) => (p.showSymbol === 'x' ? '1' : '0')),
        }}
        viewBox={constant('0 0 104 104')}
        width={constant(symbolSize)}
      >
        <rect
          fill={constant('#FF0000')}
          height={constant('9')}
          transform={constant('rotate(-45 0 96.8735)')}
          width={constant('137')}
          y={constant('96.8735')}
        />
        <rect
          fill={constant('#FF0000')}
          height={constant('9')}
          transform={constant('rotate(-135 96.9924 103.356)')}
          width={constant('137')}
          x={constant('96.9924')}
          y={constant('103.356')}
        />
      </svg>
    </div>
  );
};
