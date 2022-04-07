import type { Rect, RectSize } from '@noshiro/ts-utils-additional';
import type { NWES } from '../../types';

export const calcBalloonPosition = ({
  anchorCardRect,
  arrowDirection,
  balloonSize,
  marginBetweenCardAndBalloon,
}: Readonly<{
  anchorCardRect: Rect;
  arrowDirection: NWES;
  balloonSize: RectSize;
  marginBetweenCardAndBalloon: number;
}>): ReadonlyRecord<'left' | 'top', `${number}px`> =>
  pipe(
    match(arrowDirection, {
      W: {
        top:
          anchorCardRect.top +
          anchorCardRect.height / 2 -
          balloonSize.height / 2,
        left:
          anchorCardRect.left +
          anchorCardRect.width +
          marginBetweenCardAndBalloon,
      },
      E: {
        top:
          anchorCardRect.top +
          anchorCardRect.height / 2 -
          balloonSize.height / 2,
        left:
          anchorCardRect.left - balloonSize.width - marginBetweenCardAndBalloon,
      },
      N: {
        top:
          anchorCardRect.top +
          anchorCardRect.height +
          marginBetweenCardAndBalloon,
        left:
          anchorCardRect.left +
          anchorCardRect.width / 2 -
          balloonSize.width / 2,
      },
      S: {
        top:
          anchorCardRect.top - balloonSize.height - marginBetweenCardAndBalloon,
        left:
          anchorCardRect.left +
          anchorCardRect.width / 2 -
          balloonSize.width / 2,
      },
    })
  ).chain(({ top: t, left }: Readonly<{ top: number; left: number }>) => ({
    top: `${t}px` as const,
    left: `${left}px` as const,
  })).value;
