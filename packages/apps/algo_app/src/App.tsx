import { useResizeObserver } from '@noshiro/preact-resize-observer-hooks';
import { pipe } from '@noshiro/ts-utils';
import type { FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';
import { Table } from './components/table';
import { incrementPlayerIndexBy } from './functions/increment-player-index-by';
import { mapCards } from './functions/map-6-cards';
import { sortCards } from './functions/sort-6-cards';
import type { CardsWithDisplayValue } from './types/card-type';
import type { GameState } from './types/game-state';
import type { Player6CardsWithDisplayValue } from './types/player-6-card';
import type { PlayerIndex } from './types/player-index';

export const App: FunctionalComponent = () => {
  const [windowSize, ref] = useResizeObserver({ width: 1280, height: 720 });

  console.log(windowSize);
  const tableSize = useMemo(() => {
    const min = Math.min(windowSize.height, windowSize.width);
    return {
      width: min * 0.7,
      height: min * 0.7,
    };
  }, [windowSize]);

  const myPlayerIndex: PlayerIndex = 1;

  const gameState: GameState = {
    currentPlayerIndex: 0,
    playerCards: [
      [
        { color: 'black', number: 0, faceUp: true, visibleToPair: false },
        { color: 'black', number: 1, faceUp: true, visibleToPair: true },
        { color: 'white', number: 2, faceUp: true, visibleToPair: false },
        { color: 'black', number: 4, faceUp: true, visibleToPair: true },
        { color: 'black', number: 5, faceUp: true, visibleToPair: false },
        { color: 'white', number: 9, faceUp: true, visibleToPair: true },
      ],
      [
        { color: 'white', number: 5, faceUp: true, visibleToPair: false },
        { color: 'black', number: 6, faceUp: true, visibleToPair: true },
        { color: 'white', number: 7, faceUp: true, visibleToPair: false },
        { color: 'black', number: 9, faceUp: true, visibleToPair: true },
        { color: 'black', number: 10, faceUp: true, visibleToPair: false },
        { color: 'white', number: 10, faceUp: true, visibleToPair: true },
      ],
      [
        { color: 'white', number: 0, faceUp: true, visibleToPair: false },
        { color: 'white', number: 1, faceUp: true, visibleToPair: true },
        { color: 'black', number: 2, faceUp: true, visibleToPair: false },
        { color: 'white', number: 4, faceUp: true, visibleToPair: true },
        { color: 'black', number: 8, faceUp: true, visibleToPair: false },
        { color: 'white', number: 11, faceUp: true, visibleToPair: true },
      ],
      [
        { color: 'black', number: 3, faceUp: true, visibleToPair: false },
        { color: 'white', number: 3, faceUp: true, visibleToPair: true },
        { color: 'white', number: 6, faceUp: true, visibleToPair: false },
        { color: 'black', number: 7, faceUp: true, visibleToPair: true },
        { color: 'white', number: 8, faceUp: true, visibleToPair: false },
        { color: 'black', number: 11, faceUp: true, visibleToPair: true },
      ],
    ],
  };

  const plyaerCards: Readonly<{
    playerS: Player6CardsWithDisplayValue;
    playerW: Player6CardsWithDisplayValue;
    playerN: Player6CardsWithDisplayValue;
    playerE: Player6CardsWithDisplayValue;
  }> = {
    playerS: pipe(gameState.playerCards[myPlayerIndex])
      .chain(sortCards)
      .chain(
        mapCards<CardsWithDisplayValue>((c) => ({
          ...c,
          visibleToMe: false,
          visibleToCounter: c.visibleToPair,
        }))
      ).value,

    playerW: pipe(
      gameState.playerCards[incrementPlayerIndexBy(myPlayerIndex, 1)]
    )
      .chain(sortCards)
      .chain(
        mapCards<CardsWithDisplayValue>((c) => ({
          ...c,
          visibleToMe: false,
          visibleToCounter: c.visibleToPair,
        }))
      ).value,

    playerN: pipe(
      gameState.playerCards[incrementPlayerIndexBy(myPlayerIndex, 2)]
    )
      .chain(sortCards)
      .chain(
        mapCards<CardsWithDisplayValue>((c) => ({
          ...c,
          visibleToMe: false,
          visibleToCounter: c.visibleToPair,
        }))
      ).value,

    playerE: pipe(
      gameState.playerCards[incrementPlayerIndexBy(myPlayerIndex, 3)]
    )
      .chain(sortCards)
      .chain(
        mapCards<CardsWithDisplayValue>((c) => ({
          ...c,
          visibleToMe: false,
          visibleToCounter: c.visibleToPair,
        }))
      ).value,
  };

  return (
    <div style={rootStyle} ref={ref}>
      <Table tableSize={tableSize} plyaerCards={plyaerCards} />
    </div>
  );
};

const rootStyle: JSXInternal.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100vw',
  height: '100vh',
};
