import { styled } from '@noshiro/goober';
import { useStreamValue } from '@noshiro/preact-syncflow-hooks';
import { memoNamed } from '@noshiro/preact-utils';
import type { Rect } from '@noshiro/ts-utils';
import { useEffect } from 'preact/hooks';
import { text } from '../constants';
import {
  cardPositionsDispatcher,
  confirmTossBalloonProps$,
  decidedAnswerBalloonProps$,
  displayValues$,
  onTurnEndClick,
  playerNamePositionsDispatcher,
  selectAnswerBalloonProps$,
  setMyPlayerIndex,
  setRoomId,
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

type Props = Readonly<{
  windowSize: Rect;
  roomId: string;
  playerId: string;
  replay: boolean;
  observe: boolean;
}>;

export const GameMain = memoNamed<Props>(
  'GameMain',
  ({ windowSize, roomId }) => {
    const { tableSize, footerHeight, headerStyle, footerStyle } =
      useWindowSize(windowSize);

    useEffect(() => {
      console.log('roomId: ', roomId);
      setRoomId(roomId);
    }, [roomId]);

    useEffect(() => {
      setMyPlayerIndex(1);
    }, []);

    const displayValues: DisplayValues = useStreamValue(displayValues$);
    const turnPlayerHighlighterPosition = useStreamValue(
      turnPlayerHighlighterPosition$
    );
    const confirmTossBalloonProps = useStreamValue(confirmTossBalloonProps$);
    const selectAnswerBalloonProps = useStreamValue(selectAnswerBalloonProps$);
    const decidedAnswerBalloonProps = useStreamValue(
      decidedAnswerBalloonProps$
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
            type='button'
            onClick={onTurnEndClick}
          >
            {text.gameMain.endTurnButton}
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
  }
);

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
