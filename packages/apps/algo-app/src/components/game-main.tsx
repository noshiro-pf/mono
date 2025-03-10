import { type Rect } from '@noshiro/ts-utils-additional';
import { dictionary } from '../constants';
import {
  cardPositionsDispatcher,
  confirmTossBalloonProps$,
  decidedAnswerBalloonProps$,
  displayValues$,
  onTurnEndClick,
  playerNamePositionsDispatcher,
  selectAnswerBalloonProps$,
  turnPlayerHighlighterPosition$,
} from '../store';
import { type DisplayValues } from '../types';
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

type Props = Readonly<{
  windowSize: Rect;
  playerId: string;
  replay: boolean;
  observe: boolean;
}>;

export const GameMain = memoNamed<Props>('GameMain', ({ windowSize }) => {
  const { tableSize, footerHeight, headerStyle, footerStyle } =
    useWindowSize(windowSize);

  const displayValues: DisplayValues = useObservableValue(displayValues$);
  const turnPlayerHighlighterPosition = useObservableValue(
    turnPlayerHighlighterPosition$,
  );
  const confirmTossBalloonProps = useObservableValue(confirmTossBalloonProps$);
  const selectAnswerBalloonProps = useObservableValue(
    selectAnswerBalloonProps$,
  );
  const decidedAnswerBalloonProps = useObservableValue(
    decidedAnswerBalloonProps$,
  );

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

      <EndTurnButtonWrapper>
        <EndTurnButton
          disabled={displayValues.endTurnButtonDisabled}
          type={'button'}
          onClick={onTurnEndClick}
        >
          {dictionary.gameMain.endTurnButton}
        </EndTurnButton>
      </EndTurnButtonWrapper>

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

const EndTurnButtonWrapper = styled('div')`
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 120px;
  height: 60px;
`;

const EndTurnButton = styled('button')`
  transition: background 0.3s ease 0s;
  text-transform: uppercase;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 0.6px;
  white-space: nowrap;
  border: 1px solid rgb(222, 222, 222);
  color: rgb(255, 255, 255);
  height: 60px;
  width: 120px;
  padding: 0px 15px;
  top: 0px;
  font-weight: 400;
  font-size: 18px;
  border-radius: 5px;
  position: absolute;
  background: rgb(60 60 60);
  z-index: 1;
  left: 0px;

  &:active {
    transform: translate(5px, 5px);
  }

  cursor: pointer;

  &:disabled {
    background: rgb(185 185 185);
    cursor: not-allowed;
  }
`;
