import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';
import type { Rect, RectSize } from '@noshiro/ts-utils';
import { recordFromEntries } from '@noshiro/ts-utils';
import { useMemo } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';
import type { CardColor, CardNumber, DisplayValues, NWES } from '../../types';
import { PlayerCardsArea } from './player-cards-area';
import { PlayerName, playerNameRectSize } from './player-name';

type Props = Readonly<{
  displayValues: DisplayValues;
  tableSize: RectSize;
  windowSize: Rect;
  playerNamePositionsDispatcher: (action: readonly [NWES, Rect]) => void;
  cardPositionsDispatcher: (
    action: readonly [CardColor, CardNumber, Rect]
  ) => void;
}>;

const paddingPx = 5;
const sidesWidth = playerNameRectSize.height;
const containerPaddingPx = 7;

/**
 *
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
      const r = 225 / 145;
      const w = (innerRectWidth - 11 * paddingPx) / (2 * r + 6);
      const h = r * w;
      const areaWidth = 6 * w + 7 * paddingPx;
      const areaHeight = h + 2 * paddingPx;
      return {
        areaSize: { width: areaWidth, height: areaHeight },
        cardSize: { width: w, height: h },
      };
    }, [tableSize]);

    const tableStyle = useMemo<JSXInternal.CSSProperties>(
      () => ({
        width: `${tableSize.width}px`,
        height: `${tableSize.height}px`,
        gridTemplateRows: `${sidesWidth}px ${areaSize.height}px auto ${areaSize.height}px ${sidesWidth}px`,
        gridTemplateColumns: `${sidesWidth}px ${areaSize.height}px auto ${areaSize.height}px ${sidesWidth}px`,
        padding: `${containerPaddingPx}px`,
      }),
      [tableSize, areaSize]
    );

    const onBoundingClientRectChange = useMemo(
      () =>
        recordFromEntries(
          (['N', 'W', 'E', 'S'] as const).map((d) => [
            d,
            (rect: Readonly<DOMRect>) => {
              playerNamePositionsDispatcher([d, rect]);
            },
          ])
        ),
      [playerNamePositionsDispatcher]
    );

    return (
      <Container style={tableStyle}>
        <PlayerAreaS>
          <PlayerCardsArea
            areaSize={areaSize}
            cardSize={cardSize}
            rotate={0}
            cards={displayValues.playerCards.S}
            paddingPx={paddingPx}
            windowSize={windowSize}
            cardPositionsDispatcher={cardPositionsDispatcher}
          />
        </PlayerAreaS>
        <PlayerAreaW>
          <PlayerCardsArea
            areaSize={areaSize}
            cardSize={cardSize}
            rotate={90}
            cards={displayValues.playerCards.W}
            paddingPx={paddingPx}
            windowSize={windowSize}
            cardPositionsDispatcher={cardPositionsDispatcher}
          />
        </PlayerAreaW>
        <PlayerAreaN>
          <PlayerCardsArea
            areaSize={areaSize}
            cardSize={cardSize}
            rotate={180}
            cards={displayValues.playerCards.N}
            paddingPx={paddingPx}
            windowSize={windowSize}
            cardPositionsDispatcher={cardPositionsDispatcher}
          />
        </PlayerAreaN>
        <PlayerAreaE>
          <PlayerCardsArea
            areaSize={areaSize}
            cardSize={cardSize}
            rotate={270}
            cards={displayValues.playerCards.E}
            paddingPx={paddingPx}
            windowSize={windowSize}
            cardPositionsDispatcher={cardPositionsDispatcher}
          />
        </PlayerAreaE>
        <PlayerNameAreaS>
          <PlayerName
            playerName={'Player S'}
            rotate={0}
            isInTurn={displayValues.turnPlayer === 'S'}
            windowSize={windowSize}
            onBoundingClientRectChange={onBoundingClientRectChange.S}
          />
        </PlayerNameAreaS>
        <PlayerNameAreaW>
          <PlayerName
            playerName={'Player W'}
            rotate={90}
            isInTurn={displayValues.turnPlayer === 'W'}
            windowSize={windowSize}
            onBoundingClientRectChange={onBoundingClientRectChange.W}
          />
        </PlayerNameAreaW>
        <PlayerNameAreaN>
          <PlayerName
            playerName={'Player N'}
            rotate={180}
            isInTurn={displayValues.turnPlayer === 'N'}
            windowSize={windowSize}
            onBoundingClientRectChange={onBoundingClientRectChange.N}
          />
        </PlayerNameAreaN>
        <PlayerNameAreaE>
          <PlayerName
            playerName={'Player E'}
            rotate={270}
            isInTurn={displayValues.turnPlayer === 'E'}
            windowSize={windowSize}
            onBoundingClientRectChange={onBoundingClientRectChange.E}
          />
        </PlayerNameAreaE>
      </Container>
    );
  }
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
