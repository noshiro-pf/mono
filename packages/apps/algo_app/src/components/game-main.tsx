import { styled } from '@noshiro/goober';
import { useStreamValue } from '@noshiro/preact-syncflow-hooks';
import { memoNamed } from '@noshiro/preact-utils';
import type { Rect } from '@noshiro/ts-utils';
import { useEffect } from 'preact/hooks';
import {
  cardPositionsDispatcher,
  confirmTossBalloonProps$,
  decidedAnswerBalloonProps$,
  displayValues$,
  playerNamePositionsDispatcher,
  selectAnswerBalloonProps$,
  setMyPlayerIndex,
  turnPlayerHighlighterPosition$,
} from '../observables';
import type { DisplayValues } from '../types';
import {
  ConfirmTossBalloon,
  DecidedAnswerBalloon,
  SelectAnswerBalloon,
} from './balloon';
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
  const confirmTossBalloonProps = useStreamValue(confirmTossBalloonProps$);
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

      {confirmTossBalloonProps !== undefined ? (
        <ConfirmTossBalloon
          anchorCardRect={confirmTossBalloonProps.anchorCardRect}
          cancel={confirmTossBalloonProps.cancel}
          card={confirmTossBalloonProps.card}
          submit={confirmTossBalloonProps.submit}
        />
      ) : undefined}

      {selectAnswerBalloonProps !== undefined ? (
        <SelectAnswerBalloon
          anchorCardRect={selectAnswerBalloonProps.anchorCardRect}
          arrowDirection={selectAnswerBalloonProps.arrowDirection}
          cardColor={selectAnswerBalloonProps.cardColor}
          selectedNumber={selectAnswerBalloonProps.selectedNumber}
          submitAnswer={selectAnswerBalloonProps.submitAnswer}
          submitButtonIsDisabled={
            selectAnswerBalloonProps.submitButtonIsDisabled
          }
          onCancelClick={selectAnswerBalloonProps.onCancelClick}
          onSelectedNumberChange={
            selectAnswerBalloonProps.onSelectedNumberChange
          }
        />
      ) : undefined}

      {decidedAnswerBalloonProps !== undefined ? (
        <DecidedAnswerBalloon
          anchorCardRect={decidedAnswerBalloonProps.anchorCardRect}
          arrowDirection={decidedAnswerBalloonProps.arrowDirection}
          card={decidedAnswerBalloonProps.card}
          showSymbol={decidedAnswerBalloonProps.showSymbol}
        />
      ) : undefined}
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
