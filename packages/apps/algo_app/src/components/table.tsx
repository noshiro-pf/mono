import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';
import type { RectSize } from '@noshiro/ts-utils';
import { useMemo } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';
import type { Player6Cards } from '../types/player-6-card';
import { PlayerCardsArea } from './player-cards-area';

type Props = Readonly<{
  tableSize: RectSize;
  plyaerCards: Readonly<{
    playerS: Player6Cards;
    playerW: Player6Cards;
    playerN: Player6Cards;
    playerE: Player6Cards;
  }>;
}>;

const paddingPx = 3;

/**
 *  +--------+-------------------------------+--------+
 *  |        |                               |        |
 *  |        |                               |        |
 *  |        |                               |        |
 *  +--------+-------------------------------+--------+
 *  |        |                               |        |
 *  |        |                               |        |
 *  |        |                               |        |
 *  |        |                               |        |
 *  |        |                               |        |
 *  |        |                               |        |
 *  |        |                               |        |
 *  |        |                               |        |
 *  |        |                               |        |
 *  |        |                               |        |
 *  |        |                               |        |
 *  |        |                               |        |
 *  +--------+-------------------------------+--------+
 *  |        |                               |        |
 *  |        |                               |        |
 *  |        |                               |        |
 *  +--------+-------------------------------+--------+
 *      H                   W                    H
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
export const Table = memoNamed('Table', ({ tableSize, plyaerCards }: Props) => {
  const { areaSize, cardSize } = useMemo<{
    areaSize: RectSize;
    cardSize: RectSize;
  }>(() => {
    const r = 225 / 145;
    const w = (tableSize.width - 11 * paddingPx) / (2 * r + 6);
    const h = r * w;
    const areaWidth = 6 * w + 7 * paddingPx;
    const areaHeight = h + 2 * paddingPx;
    console.log(tableSize, areaWidth, areaHeight);
    return {
      areaSize: { width: areaWidth, height: areaHeight },
      cardSize: { width: w, height: h },
    };
  }, [tableSize]);

  const tableStyle = useMemo<JSXInternal.CSSProperties>(
    () => ({
      width: `${tableSize.width}px`,
      height: `${tableSize.height}px`,
      gridTemplateRows: `${areaSize.height}px auto ${areaSize.height}px`,
      gridTemplateColumns: `${areaSize.height}px auto ${areaSize.height}px`,
    }),
    [tableSize, areaSize]
  );

  return (
    <Container style={tableStyle}>
      <PlayerAreaA>
        <PlayerCardsArea
          areaSize={areaSize}
          cardSize={cardSize}
          rotate={0}
          cards={plyaerCards.playerS}
          paddingPx={paddingPx}
        />
      </PlayerAreaA>
      <PlayerAreaB>
        <PlayerCardsArea
          areaSize={areaSize}
          cardSize={cardSize}
          rotate={90}
          cards={plyaerCards.playerW}
          paddingPx={paddingPx}
        />
      </PlayerAreaB>
      <PlayerAreaC>
        <PlayerCardsArea
          areaSize={areaSize}
          cardSize={cardSize}
          rotate={180}
          cards={plyaerCards.playerN}
          paddingPx={paddingPx}
        />
      </PlayerAreaC>
      <PlayerAreaD>
        <PlayerCardsArea
          areaSize={areaSize}
          cardSize={cardSize}
          rotate={270}
          cards={plyaerCards.playerE}
          paddingPx={paddingPx}
        />
      </PlayerAreaD>
    </Container>
  );
});

const Container = styled('div')`
  background-color: #c4c4c4;
  border-radius: 5px;
  display: grid;
  grid-template:
    '. C .'
    'B . D'
    '. A .';
`;

const PlayerAreaA = styled('div')`
  grid-area: A;
`;
const PlayerAreaB = styled('div')`
  grid-area: B;
`;
const PlayerAreaC = styled('div')`
  grid-area: C;
`;
const PlayerAreaD = styled('div')`
  grid-area: D;
`;
