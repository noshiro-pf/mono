import { combine, map, type InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import { Num, asPositiveFiniteNumber } from 'ts-data-forge';
import type { Rect, RectSize } from 'ts-utils-additional';
import { playerNameRectSize } from '../../constants/index.mjs';
import type {
  CardColor,
  CardNumber,
  DisplayValues,
  NWES,
} from '../../types/index.mjs';
import { PlayerCardsArea } from './player-cards-area.js';
import { PlayerName } from './player-name.js';
import * as styles from './table.module.css';

type Props = Readonly<{
  displayValues: InitializedObservable<DisplayValues>;
  tableSize: InitializedObservable<RectSize>;
  windowSize: InitializedObservable<Rect>;
  playerNamePositionsDispatcher: (action: readonly [NWES, Rect]) => void;
  cardPositionsDispatcher: (
    action: readonly [CardColor, CardNumber, Rect],
  ) => void;
}>;

const sidesWidth = playerNameRectSize.height;

/**
 * ```txt
 * +---------------------------------------------------------+
 * |                                                         |
 * |   +--------+-------------------------------+--------+   |
 * |   |        |                               |        |   |
 * |   |        |                               |        |   |
 * |   |        |                               |        |   |
 * |   +--------+-------------------------------+--------+   |
 * |   |        |                               |        |   |
 * |   |        |                               |        |   |
 * |   |        |                               |        |   |
 * |   |        |                               |        |   |
 * |   |        |                               |        |   |
 * |   |        |                               |        |   |
 * |   |        |                               |        |   |
 * |   |        |                               |        |   |
 * |   |        |                               |        |   |
 * |   |        |                               |        |   |
 * |   |        |                               |        |   |
 * |   |        |                               |        |   |
 * |   +--------+-------------------------------+--------+   |
 * |   |        |                               |        |   |
 * |   |H       |                               |        |   |
 * |   |   H    |               W               |    H   |   |
 * |   +--------+-------------------------------+--------+   |
 * |                      playerS.name                       |
 * +---------------------------------------------------------+
 *
 *                  W
 *   +-------------------------------+
 *   | +--+ +--+ +--+ +--+ +--+ +--+ |
 * H | |  | |  | |  | |  | |  | |  | |
 *   | +--+ +--+ +--+ +--+ +--+ +--+ |
 *   +-------------------------------+
 *
 * W = 6w + 7pad
 * H = h + 2pad
 * w:h = 145:225
 *
 * tableWidth = 2H + W
 *            = 2(h + 2pad) + (6w + 7pad)
 *            = 2h + 6w + 11pad
 *            = 2(225/145 * w) + 6w + 11pad
 *            = (2 * 225/145 + 6)w + 11pad
 * ```
 */
export const Table = ({
  tableSize,
  displayValues,
  windowSize,
  playerNamePositionsDispatcher,
  cardPositionsDispatcher,
}: Props): JSX.Element => {
  const sizes = tableSize.pipe(map(sizesOf));

  const paddingPx = sizes.pipe(map((s) => s.paddingPx));

  const cardsAreHidden = displayValues.pipe(map((v) => v.cardsAreHidden));

  const areaSize = sizes.pipe(map((s) => s.areaSize));

  const cardSize = sizes.pipe(map((s) => s.cardSize));

  // The cards and the names are measured again after every update of the window
  // size or of what the table shows, rather than after a list of what can move
  // them, which would go stale silently; `reportRectOn` reports only the rects
  // that changed.
  const measureOn = combine([windowSize, displayValues]);

  return (
    <div
      class={constant(styles.table)}
      style={{
        width: view(tableSize, (s) => `${s.width}px`),
        height: view(tableSize, (s) => `${s.height}px`),
        'grid-template-rows': view(areaSize, gridTrackSizes),
        'grid-template-columns': view(areaSize, gridTrackSizes),
        padding: view(sizes, (s) => `${s.containerPaddingPx}px`),
      }}
    >
      {seats.map(({ direction, rotate }) => (
        <div style={{ 'grid-area': constant(direction) }}>
          <PlayerCardsArea
            areaSize={areaSize}
            cardPositionsDispatcher={cardPositionsDispatcher}
            cardSize={cardSize}
            cards={view(displayValues, (v) => v.playerCards[direction])}
            cardsAreHidden={cardsAreHidden}
            paddingPx={paddingPx}
            measureOn={measureOn}
            rotate={rotate}
          />
        </div>
      ))}
      {seats.map(({ direction, rotate }) => (
        <div style={{ 'grid-area': constant(direction.toLowerCase()) }}>
          <PlayerName
            isInTurn={view(displayValues, (v) => v.turnPlayer === direction)}
            measureOn={measureOn}
            playerName={displayValues.pipe(
              map((v) => v.playerNames[direction]),
            )}
            rotate={rotate}
            onBoundingClientRectChange={(rect) => {
              playerNamePositionsDispatcher([direction, rect]);
            }}
          />
        </div>
      ))}
    </div>
  );
};

const seats = [
  { direction: 'S', rotate: 0 },
  { direction: 'W', rotate: 90 },
  { direction: 'N', rotate: 180 },
  { direction: 'E', rotate: 270 },
] as const satisfies readonly Readonly<{
  direction: NWES;
  rotate: 0 | 90 | 180 | 270;
}>[];

/** The paddings grow with the table, so that the cards keep their share of it. */
const sizesOf = (
  tableSize: RectSize,
): Readonly<{
  areaSize: RectSize;
  cardSize: RectSize;
  paddingPx: number;
  containerPaddingPx: number;
}> => {
  const paddingPx = Math.round(tableSize.width / 500);

  const containerPaddingPx = Math.round(tableSize.width / 100);

  const innerRectWidth =
    tableSize.width - 2 * (sidesWidth + containerPaddingPx); /* px */

  const r = asPositiveFiniteNumber(225 / 145);

  const w = Num.div(
    innerRectWidth - 11 * paddingPx,
    asPositiveFiniteNumber(2 * r + 6),
  );

  const h = r * w;

  const areaWidth = 6 * w + 7 * paddingPx;

  const areaHeight = h + 2 * paddingPx;

  return {
    areaSize: { width: areaWidth, height: areaHeight },
    cardSize: { width: w, height: h },
    paddingPx,
    containerPaddingPx,
  };
};

const gridTrackSizes = (areaSize: RectSize): string =>
  `${sidesWidth}px ${areaSize.height}px auto ${areaSize.height}px ${sidesWidth}px` as const;
