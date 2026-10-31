import { createBooleanState, type InitializedObservable } from 'synstate';
import {
  constant,
  derive,
  If,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import type { Rect, RectSize } from 'ts-utils-additional';
import {
  darkGray,
  eyeIconColorDef,
  lightGray,
  type CardTextColor,
} from '../../constants/index.mjs';
import { fillCardSize, flipColor } from '../../functions/index.mjs';
import { reportRectOn } from '../report-rect-on.mjs';
import type { CardDisplay } from './card-display.mjs';
import { CardSide } from './card-side.js';
import * as styles from './card.module.css';
import { EyeIcon } from './eye-icon.js';

type Props = Readonly<{
  card: InitializedObservable<CardDisplay>;
  size: Bindable<Partial<RectSize>>;
  onClick?: () => void;
  /**
   * Reports where the card is after every value of `measureOn`, the current
   * one included: once the update that brought it has been drawn.
   */
  rectReport?: Readonly<{
    measureOn: InitializedObservable<unknown>;
    onBoundingClientRectChange: (rect: Rect) => void;
  }>;
}>;

export const CardComponent = ({
  card,
  size,
  onClick,
  rectReport,
}: Props): JSX.Element => {
  const [isMouseOver, { setTrue: onMouseEnter, setFalse: onMouseLeave }] =
    createBooleanState(false);

  const cardSize = mapBindable(size, fillCardSize);

  const color = mapBindable(card, (c) => c.color);

  const textColor = mapBindable(card, (c): CardTextColor =>
    c.visibilityFromMe === 'faceDownButVisibleToMe'
      ? c.color === 'black'
        ? darkGray
        : lightGray
      : flipColor(c.color),
  );

  const eyeIconColor = mapBindable(card, (c) =>
    c.color === 'black' ? eyeIconColorDef.light : eyeIconColorDef.dark,
  );

  const showOutline = derive(
    [card, isMouseOver],
    (c, over) =>
      c.showOutline === 'always' || (c.showOutline === 'onHover' && over),
  );

  // The values above feed several slots each, so they are nodes of their own;
  // a value that feeds one slot is a `view`.

  // Shared by both sides' rectangles.
  const rectStyle = {
    stroke: derive([card, showOutline], (c, show) =>
      show ? c.outlineColor : undefined,
    ),
    'stroke-width': mapBindable(showOutline, (show) => (show ? '8px' : '0px')),
    fill: color,
  } as const;

  const outerRef =
    rectReport === undefined
      ? undefined
      : reportRectOn(
          rectReport.measureOn,
          rectReport.onBoundingClientRectChange,
        );

  // The rect is read off the outer element, which floating does not move.
  return (
    <div ref={outerRef}>
      <div
        class={constant(styles.wrapper)}
        style={{
          cursor: view(card, (c) => (c.isClickable ? 'pointer' : 'default')),
          transform: derive(
            [card, isMouseOver],
            (c, over) =>
              `translateY(${
                c.float === 'always' || (over && c.float === 'onHover')
                  ? -20
                  : 0
              }px)`,
          ),
          height: mapBindable(cardSize, (s) => `${s.height}px`),
          width: mapBindable(cardSize, (s) => `${s.width}px`),
        }}
        onClick={() => {
          if (card.getSnapshot().value.isClickable) {
            onClick?.();
          }
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <CardSide
          color={color}
          number={view(card, (c) =>
            c.visibilityFromMe === 'faceDownButVisibleToMe'
              ? c.number
              : undefined,
          )}
          rectStyle={rectStyle}
          textColor={textColor}
          turnedAway={view(card, (c) => c.visibilityFromMe === 'faceUp')}
        >
          <If
            cond={view(
              card,
              (c) =>
                c.visibilityFromMe === 'faceDownButVisibleToCounter' ||
                c.visibilityFromMe === 'faceDownButVisibleToMe',
            )}
            then={<EyeIcon color={eyeIconColor} />}
          />
        </CardSide>
        <CardSide
          color={color}
          number={view(card, (c) =>
            c.visibilityFromMe === 'faceUp' ? c.number : undefined,
          )}
          rectStyle={rectStyle}
          textColor={textColor}
          turnedAway={view(card, (c) => c.visibilityFromMe !== 'faceUp')}
        />
      </div>
    </div>
  );
};
