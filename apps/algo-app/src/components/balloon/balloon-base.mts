import { map, type InitializedObservable } from 'synstate';
import { constant, mapBindable, view, type Bindable } from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Rect, RectSize } from 'ts-utils-additional';
import type { NWES } from '../../types/index.mjs';
import * as styles from './balloon.module.css';
import { calcBalloonPosition } from './calc-balloon-position.mjs';

/**
 * The classes of a balloon whose arrow points to `arrowDirection` — the side
 * the card it is about is on. The look is `balloon.module.css`, whose
 * `buttons*` classes the balloons use for their button rows.
 */
export const balloonClasses = (
  arrowDirection: Bindable<NWES>,
): ReadonlyRecord<string, Bindable<boolean>> =>
  ({
    [styles.body]: constant(true),
    [styles.arrowS]: mapBindable(arrowDirection, (d) => d === 'S'),
    [styles.arrowN]: mapBindable(arrowDirection, (d) => d === 'N'),
    [styles.arrowW]: mapBindable(arrowDirection, (d) => d === 'W'),
    [styles.arrowE]: mapBindable(arrowDirection, (d) => d === 'E'),
  }) as const;

/** The `style` entries that size a balloon to `balloonSize`. */
export const balloonSizeStyle = (
  balloonSize: RectSize,
): ReadonlyRecord<'height' | 'width', Bindable<string>> =>
  ({
    width: constant(`${balloonSize.width}px`),
    height: constant(`${balloonSize.height}px`),
  }) as const;

/**
 * The `style` entries that place a balloon of `balloonSize` beside the card
 * `placement` names, on the side its arrow points away from.
 */
export const balloonPositionStyle = (
  placement: InitializedObservable<
    Readonly<{ anchorCardRect: Rect; arrowDirection: NWES }>
  >,
  balloonSize: RectSize,
): ReadonlyRecord<'left' | 'top', Bindable<string>> => {
  const position = placement.pipe(
    map(
      ({ anchorCardRect, arrowDirection }) =>
        calcBalloonPosition({
          anchorCardRect,
          arrowDirection,
          balloonSize,
          marginBetweenCardAndBalloon,
        }),
      { equals: (a, b) => a.top === b.top && a.left === b.left },
    ),
  );

  return {
    top: view(position, (p) => p.top),
    left: view(position, (p) => p.left),
  } as const;
};

const marginBetweenCardAndBalloon = 10;
