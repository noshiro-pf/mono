import { combine, map, type InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { RectSize } from 'ts-utils-additional';
import { dictionary, outlineColorDef } from '../../constants/index.mjs';
import type { SelectAnswerBalloonProps } from '../../types/index.mjs';
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
import * as styles from './select-answer-balloon.module.css';
import { smallestCardSize } from './small-card-size.mjs';

type Props = Readonly<{
  props: InitializedObservable<SelectAnswerBalloonProps>;
}>;

const balloonPaddingPx = 5;

const cardMarginPx = 2;

const balloonSize: RectSize = {
  width: balloonPaddingPx * 2 + (smallestCardSize.width + 2 * cardMarginPx) * 6,
  height: 150,
} as const;

export const SelectAnswerBalloon = ({ props }: Props): JSX.Element => {
  // Only these two of `props` change how the cards look; the rest, such as
  // where the balloon is, need not draw them again.
  const choice = combine([
    props.pipe(map(({ cardColor }) => cardColor)),
    props.pipe(map(({ selectedNumber }) => selectedNumber)),
  ]);

  return (
    <div
      class={balloonClasses(view(props, (p) => p.arrowDirection))}
      style={{
        ...balloonSizeStyle(balloonSize),
        ...balloonPositionStyle(props, balloonSize),
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
        <div class={constant(styles.cards)}>
          {Arr.seq(12).map((n) => (
            <CardComponent
              card={choice.pipe(
                map(
                  ([cardColor, selectedNumber]) =>
                    faceUpCard(
                      { color: cardColor, number: n },
                      selectedNumber === n
                        ? {
                            isClickable: true,
                            showOutline: 'always',
                            outlineColor: outlineColorDef.red,
                          }
                        : { isClickable: true, showOutline: 'onHover' },
                    ),
                  { equals: isSameCardDisplay },
                ),
              )}
              size={constant(smallestCardSize)}
              onClick={() => {
                props.getSnapshot().value.onSelectedNumberChange(n);
              }}
            />
          ))}
        </div>
        <div
          class={constant(
            `${balloonStyles.buttons} ${balloonStyles.buttonsEnd}`,
          )}
        >
          <Button
            onClick={() => {
              props.getSnapshot().value.onCancelClick();
            }}
          >
            {constant(dictionary.cancel)}
          </Button>
          <Button
            disabled={view(
              props,
              (p) => p.submitButtonIsDisabled || p.selectedNumber === undefined,
            )}
            onClick={() => {
              props.getSnapshot().value.submitAnswer();
            }}
          >
            {constant(dictionary.submitAnswer)}
          </Button>
        </div>
      </div>
    </div>
  );
};
