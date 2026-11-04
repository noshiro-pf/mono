import {
  combine,
  createBooleanState,
  map,
  type InitializedObservable,
} from 'synstate';
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
  placeholderCardColor,
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
  /**
   * Drawn as a blank placeholder that answers no click, as every card is before
   * the game starts.
   */
  hidden?: InitializedObservable<boolean>;
  onClick?: () => void;
  /**
   * Reports where the card is after every value of `measureOn`, the current one
   * included: once the update that brought it has been drawn.
   */
  rectReport?: Readonly<{
    measureOn: InitializedObservable<unknown>;
    onBoundingClientRectChange: (rect: Rect) => void;
  }>;
}>;

export const CardComponent = ({
  card,
  size,
  hidden,
  onClick,
  rectReport,
}: Props): JSX.Element => {
  const [isMouseOver, { setTrue: onMouseEnter, setFalse: onMouseLeave }] =
    createBooleanState(false);

  const cardSize = mapBindable(size, fillCardSize);

  const color = mapBindable(card, (c) => c.color);

  // A placeholder shows neither face nor outline, and does not float.
  const shown: InitializedObservable<CardDisplay> =
    hidden === undefined
      ? card
      : combine([card, hidden]).pipe(
          map(([c, isHidden]) =>
            isHidden
              ? ({
                  ...c,
                  visibilityFromMe: 'faceDown',
                  float: 'never',
                  showOutline: 'never',
                  isClickable: false,
                } as const)
              : c,
          ),
        );

  const textColor = mapBindable(shown, (c): CardTextColor =>
    c.visibilityFromMe === 'faceDownButVisibleToMe'
      ? c.color === 'black'
        ? darkGray
        : lightGray
      : flipColor(c.color),
  );

  const eyeIconColor = mapBindable(shown, (c) =>
    c.color === 'black' ? eyeIconColorDef.light : eyeIconColorDef.dark,
  );

  const showOutline = derive(
    [shown, isMouseOver],
    (c, over) =>
      c.showOutline === 'always' || (c.showOutline === 'onHover' && over),
  );

  // The values above feed several slots each, so they are nodes of their own;
  // a value that feeds one slot is a `view`.

  // Shared by both sides' rectangles.
  const rectStyle = {
    stroke: derive([shown, showOutline], (c, show) =>
      show ? c.outlineColor : undefined,
    ),
    'stroke-width': mapBindable(showOutline, (show) => (show ? '8px' : '0px')),
    fill:
      hidden === undefined
        ? color
        : derive([color, hidden], (c, isHidden) =>
            isHidden ? placeholderCardColor : c,
          ),
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
          cursor: view(shown, (c) => (c.isClickable ? 'pointer' : 'default')),
          transform: derive(
            [shown, isMouseOver],
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
          if (shown.getSnapshot().value.isClickable) {
            onClick?.();
          }
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <CardSide
          color={color}
          number={view(shown, (c) =>
            c.visibilityFromMe === 'faceDownButVisibleToMe'
              ? c.number
              : undefined,
          )}
          rectStyle={rectStyle}
          textColor={textColor}
          turnedAway={view(shown, (c) => c.visibilityFromMe === 'faceUp')}
        >
          <If
            cond={view(
              shown,
              (c) =>
                c.visibilityFromMe === 'faceDownButVisibleToCounter' ||
                c.visibilityFromMe === 'faceDownButVisibleToMe',
            )}
            then={<EyeIcon color={eyeIconColor} />}
          />
        </CardSide>
        <CardSide
          color={color}
          number={view(shown, (c) =>
            c.visibilityFromMe === 'faceUp' ? c.number : undefined,
          )}
          rectStyle={rectStyle}
          textColor={textColor}
          turnedAway={view(shown, (c) => c.visibilityFromMe !== 'faceUp')}
        />
      </div>
    </div>
  );
};
