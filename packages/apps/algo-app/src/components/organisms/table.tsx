import { type Rect, type RectSize } from '@noshiro/ts-utils-additional';
import { playerNameRectSize } from '../../constants';
import {
  type CardColor,
  type CardNumber,
  type DisplayValues,
  type NWES,
} from '../../types';
import { PlayerCardsArea } from './player-cards-area';
import { PlayerName } from './player-name';

type Props = Readonly<{
  displayValues: DisplayValues;
  tableSize: RectSize;
  windowSize: Rect;
  playerNamePositionsDispatcher: (action: readonly [NWES, Rect]) => void;
  cardPositionsDispatcher: (
    action: readonly [CardColor, CardNumber, Rect],
  ) => void;
}>;

const paddingPx = 5;
const sidesWidth = playerNameRectSize.height;
const containerPaddingPx = 7;

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
export const Table = memoNamed(
  'Table',
  ({
    tableSize,
    displayValues,
    windowSize,
    playerNamePositionsDispatcher,
    cardPositionsDispatcher,
  }: Props) => {
    const { areaSize, cardSize } = useMemo<{
      areaSize: RectSize;
      cardSize: RectSize;
    }>(() => {
      const innerRectWidth =
        tableSize.width - 2 * (sidesWidth + containerPaddingPx); /* px */
      const r = toPositiveFiniteNumber(225 / 145);
      const w = Num.div(
        innerRectWidth - 11 * paddingPx,
        toPositiveFiniteNumber(2 * r + 6),
      );
      const h = r * w;
      const areaWidth = 6 * w + 7 * paddingPx;
      const areaHeight = h + 2 * paddingPx;
      return {
        areaSize: { width: areaWidth, height: areaHeight },
        cardSize: { width: w, height: h },
      };
    }, [tableSize]);

    const tableStyle = useMemo<preact.JSX.CSSProperties>(
      () => ({
        width: `${tableSize.width}px`,
        height: `${tableSize.height}px`,
        gridTemplateRows: `${sidesWidth}px ${areaSize.height}px auto ${areaSize.height}px ${sidesWidth}px`,
        gridTemplateColumns: `${sidesWidth}px ${areaSize.height}px auto ${areaSize.height}px ${sidesWidth}px`,
        padding: `${containerPaddingPx}px`,
      }),
      [tableSize, areaSize],
    );

    const onBoundingClientRectChange = useMemo(
      () =>
        Object.fromEntries(
          Tpl.map(
            ['N', 'W', 'E', 'S'] as const,
            (d) =>
              [
                d,
                (rect: Readonly<DOMRect>) => {
                  playerNamePositionsDispatcher([d, rect]);
                },
              ] as const,
          ),
        ),
      [playerNamePositionsDispatcher],
    );

    return (
      <Container style={tableStyle}>
        <PlayerAreaS>
          <PlayerCardsArea
            areaSize={areaSize}
            cardPositionsDispatcher={cardPositionsDispatcher}
            cardSize={cardSize}
            cards={displayValues.playerCards.S}
            paddingPx={paddingPx}
            rotate={0}
            windowSize={windowSize}
          />
        </PlayerAreaS>
        <PlayerAreaW>
          <PlayerCardsArea
            areaSize={areaSize}
            cardPositionsDispatcher={cardPositionsDispatcher}
            cardSize={cardSize}
            cards={displayValues.playerCards.W}
            paddingPx={paddingPx}
            rotate={90}
            windowSize={windowSize}
          />
        </PlayerAreaW>
        <PlayerAreaN>
          <PlayerCardsArea
            areaSize={areaSize}
            cardPositionsDispatcher={cardPositionsDispatcher}
            cardSize={cardSize}
            cards={displayValues.playerCards.N}
            paddingPx={paddingPx}
            rotate={180}
            windowSize={windowSize}
          />
        </PlayerAreaN>
        <PlayerAreaE>
          <PlayerCardsArea
            areaSize={areaSize}
            cardPositionsDispatcher={cardPositionsDispatcher}
            cardSize={cardSize}
            cards={displayValues.playerCards.E}
            paddingPx={paddingPx}
            rotate={270}
            windowSize={windowSize}
          />
        </PlayerAreaE>
        <PlayerNameAreaS>
          <PlayerName
            isInTurn={displayValues.turnPlayer === 'S'}
            playerName={'Player S'}
            rotate={0}
            windowSize={windowSize}
            onBoundingClientRectChange={onBoundingClientRectChange.S}
          />
        </PlayerNameAreaS>
        <PlayerNameAreaW>
          <PlayerName
            isInTurn={displayValues.turnPlayer === 'W'}
            playerName={'Player W'}
            rotate={90}
            windowSize={windowSize}
            onBoundingClientRectChange={onBoundingClientRectChange.W}
          />
        </PlayerNameAreaW>
        <PlayerNameAreaN>
          <PlayerName
            isInTurn={displayValues.turnPlayer === 'N'}
            playerName={'Player N'}
            rotate={180}
            windowSize={windowSize}
            onBoundingClientRectChange={onBoundingClientRectChange.N}
          />
        </PlayerNameAreaN>
        <PlayerNameAreaE>
          <PlayerName
            isInTurn={displayValues.turnPlayer === 'E'}
            playerName={'Player E'}
            rotate={270}
            windowSize={windowSize}
            onBoundingClientRectChange={onBoundingClientRectChange.E}
          />
        </PlayerNameAreaE>
      </Container>
    );
  },
);

const Container = styled('div')`
  background-color: #c4c4c4;
  border-radius: 20px;
  display: grid;
  grid-template:
    '. . n . .'
    '. . N . .'
    'w W . E e'
    '. . S . .'
    '. . s . .';
`;

const PlayerAreaS = styled('div')`
  grid-area: S;
`;
const PlayerAreaW = styled('div')`
  grid-area: W;
`;
const PlayerAreaN = styled('div')`
  grid-area: N;
`;
const PlayerAreaE = styled('div')`
  grid-area: E;
`;

const PlayerNameAreaS = styled('div')`
  grid-area: s;
`;
const PlayerNameAreaW = styled('div')`
  grid-area: w;
`;
const PlayerNameAreaN = styled('div')`
  grid-area: n;
`;
const PlayerNameAreaE = styled('div')`
  grid-area: e;
`;
