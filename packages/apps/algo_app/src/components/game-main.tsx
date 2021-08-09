import { styled } from '@noshiro/goober';
import { useStreamValue } from '@noshiro/preact-syncflow-hooks';
import { memoNamed } from '@noshiro/preact-utils';
import type { Rect } from '@noshiro/ts-utils';
import { createElement } from 'preact';
import { useEffect } from 'preact/hooks';
import {
  cardPositionsDispatcher,
  decidedAnswerBalloonProps$,
  displayValues$,
  playerNamePositionsDispatcher,
  selectAnswerBalloonProps$,
  setMyPlayerIndex,
  turnPlayerHighlighterPosition$,
} from '../store';
import type { DisplayValues } from '../types';
import { DecidedAnswerBalloon, SelectAnswerBalloon } from './balloon';
import {
  GameMessage,
  MyCards,
  Table,
  TurnPlayerHighlighter,
} from './organisms';
import { useWindowSize } from './use-window-size';

type Props = Readonly<{ windowSize: Rect }>;

export const GameMain = memoNamed<Props>('GameMain', ({ windowSize }) => {
  const { tableSize, footerHeight, headerStyle, footerStyle } =
    useWindowSize(windowSize);

  useEffect(() => {
    setMyPlayerIndex(1);
  }, []);

  const displayValues: DisplayValues = useStreamValue(displayValues$);
  const turnPlayerHighlighterPosition = useStreamValue(
    turnPlayerHighlighterPosition$
  );
  const selectAnswerBalloonProps = useStreamValue(selectAnswerBalloonProps$);
  const decidedAnswerBalloonProps = useStreamValue(decidedAnswerBalloonProps$);

  return (
    <Root>
      <Header style={headerStyle}>
        <GameMessage message={displayValues.gameMessage} />
      </Header>
      <Main>
        <Table
          cardPositionsDispatcher={cardPositionsDispatcher}
          displayValues={displayValues}
          playerNamePositionsDispatcher={playerNamePositionsDispatcher}
          tableSize={tableSize}
          windowSize={windowSize}
        />
      </Main>
      <Footer style={footerStyle}>
        <MyCards cards={displayValues.playerCards.S} height={footerHeight} />
      </Footer>

      {turnPlayerHighlighterPosition !== undefined ? (
        <TurnPlayerHighlighter position={turnPlayerHighlighterPosition} />
      ) : undefined}

      {selectAnswerBalloonProps !== undefined
        ? createElement(SelectAnswerBalloon, selectAnswerBalloonProps)
        : undefined}

      {decidedAnswerBalloonProps !== undefined
        ? createElement(DecidedAnswerBalloon, decidedAnswerBalloonProps)
        : undefined}
    </Root>
  );
});

const Root = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
`;

const Header = styled('div')`
  flex: 0;
`;

const Main = styled('div')`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Footer = styled('div')`
  flex: 0;
`;
