import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import type { RectSize } from 'ts-utils-additional';
import { dictionary } from '../../constants/index.mjs';
import type { ConfirmTossBalloonProps } from '../../types/index.mjs';
import { Button } from '../bp/index.mjs';
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
import * as balloonStyles from './balloon.module.css';
import * as styles from './confirm-toss-balloon.module.css';
import { smallCardSize, smallestCardSize } from './small-card-size.mjs';

type Props = Readonly<{
  props: InitializedObservable<ConfirmTossBalloonProps>;
}>;

const balloonPaddingPx = 5;

const cardMarginPx = 2;

const balloonSize: RectSize = {
  width: balloonPaddingPx * 2 + 120 + smallCardSize.width,
  height: 100,
} as const;

export const ConfirmTossBalloon = ({ props }: Props): JSX.Element => {
  const position = props.pipe(
    map(
      ({ anchorCardRect }) =>
        ({ anchorCardRect, arrowDirection: 'S' }) as const,
    ),
  );

  return (
    <div
      class={{
        ...balloonClasses(constant('S')),
        [styles.balloon]: constant(true),
      }}
      style={{
        ...balloonSizeStyle(balloonSize),
        ...balloonPositionStyle(position, balloonSize),
      }}
    >
      <div
        class={constant(styles.content)}
        style={{
          ...balloonSizeStyle(balloonSize),
          padding: constant(`${balloonPaddingPx}px`),
          '--card-margin': constant(`${cardMarginPx}px`),
        }}
      >
        <div class={constant(styles.cardAndMessage)}>
          <div class={constant(styles.card)}>
            <CardComponent
              card={props.pipe(
                map(({ card }) => faceUpCard(card, { isClickable: true }), {
                  equals: isSameCardDisplay,
                }),
              )}
              size={constant(smallestCardSize)}
            />
          </div>
          <div class={constant(styles.message)}>
            <div>{constant(dictionary.submitTossMessage[0])}</div>
            <div>{constant(dictionary.submitTossMessage[1])}</div>
          </div>
        </div>
        <div
          class={constant(
            `${balloonStyles.buttons} ${balloonStyles.buttonsCenter}`,
          )}
        >
          <div>
            <Button
              onClick={() => {
                props.getSnapshot().value.cancel();
              }}
            >
              {constant(dictionary.cancel)}
            </Button>
          </div>
          <div>
            <Button
              onClick={() => {
                props.getSnapshot().value.submit();
              }}
            >
              {constant(dictionary.submitToss)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
