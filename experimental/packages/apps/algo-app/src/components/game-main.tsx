import { css } from '@noshiro/goober';
import { dictionary, Routes, zIndex } from '../constants';
import {
  cardPositionsDispatcher,
  confirmTossBalloonProps$,
  decidedAnswerBalloonProps$,
  displayValues$,
  ElementSize,
  GameMainState,
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

export const GameMain = memoNamed('GameMain', () => {
  const elementsSize = useObservableValue(ElementSize.elementsSize$);

  // const isReplayMode = useObservableValue(router.isReplayMode$);
  // const isSpectatorMode = useObservableValue(router.isSpectatorMode$);

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

  const shuffleSeatsButtonDisabled = useObservableValue(
    combine([
      GameMainState.shuffleSeatsWaitingState.state,
      GameMainState.startGameWaitingState.state,
    ]).chain(map(([a, b]) => a || b)),
  );

  return (
    <Root>
      {elementsSize === undefined ? (
        <div>{dictionary.gameMain.loading}</div>
      ) : (
        <>
          <NorthWestButtons>
            <ButtonWrapper>
              <a
                className={floatButtonStyle}
                href={Routes.routes.main}
                rel={'noopener noreferrer'}
                target={'_blank'}
              >
                {dictionary.gameMain.newGame}
              </a>
            </ButtonWrapper>
          </NorthWestButtons>

          <SouthEastButtons>
            {displayValues.roomState === 'not-started' ? (
              <>
                <CopyLinkButtonWrapper>
                  <button
                    className={floatButtonStyle}
                    type='button'
                    onClick={GameMainState.onClipboardButtonClick}
                  >
                    <div>{dictionary.gameMain.copyLink[0]}</div>
                    <div>{dictionary.gameMain.copyLink[1]}</div>
                  </button>
                </CopyLinkButtonWrapper>
                <ShuffleSeatsButtonWrapper>
                  <button
                    className={floatButtonStyle}
                    disabled={shuffleSeatsButtonDisabled}
                    type='button'
                    onClick={GameMainState.onShuffleSeatsClick}
                  >
                    <div>{dictionary.gameMain.shuffleSeats[0]}</div>
                    <div>{dictionary.gameMain.shuffleSeats[1]}</div>
                  </button>
                </ShuffleSeatsButtonWrapper>
                <ButtonWrapper>
                  <button
                    className={floatButtonStyle}
                    type='button'
                    onClick={GameMainState.onExitClick}
                  >
                    {dictionary.gameMain.exit}
                  </button>
                </ButtonWrapper>
              </>
            ) : undefined}

            <ButtonWrapper>
              {displayValues.roomState === 'not-started' ? (
                <button
                  className={floatButtonStyle}
                  disabled={displayValues.startGameButtonState === 'disabled'}
                  type='button'
                  onClick={GameMainState.onStartGameClick}
                >
                  {dictionary.gameMain.startGame}
                </button>
              ) : (
                <button
                  className={floatButtonStyle}
                  disabled={displayValues.endTurnButtonDisabled}
                  type='button'
                  onClick={onTurnEndClick}
                >
                  {dictionary.gameMain.endTurnButton}
                </button>
              )}
            </ButtonWrapper>
          </SouthEastButtons>

          <Header style={elementsSize.headerStyle}>
            <GameMessage message={displayValues.gameMessage} />
          </Header>
          <Main>
            <Table
              cardPositionsDispatcher={cardPositionsDispatcher}
              displayValues={displayValues}
              playerNamePositionsDispatcher={playerNamePositionsDispatcher}
              tableSize={elementsSize.tableSize}
              windowSize={elementsSize.windowSize}
            />
          </Main>
          <Footer style={elementsSize.footerStyle}>
            <MyCards
              cards={displayValues.playerCards.S}
              cardsAreHidden={displayValues.cardsAreHidden}
              height={elementsSize.footerHeight}
            />
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
        </>
      )}
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

const buttonAreaMarginPx = 20;

const FloatButtons = styled('div')`
  position: absolute;

  > * {
    margin: ${buttonAreaMarginPx}px;
  }
`;

const NorthWestButtons = styled(FloatButtons)`
  left: 0;
  top: 0;
`;

const SouthEastButtons = styled(FloatButtons)`
  right: 0;
  bottom: 0;
`;

const ButtonWrapper = styled('div')`
  width: 120px;
  height: 60px;
`;

const CopyLinkButtonWrapper = styled(ButtonWrapper)`
  > button {
    display: block;
    font-size: 14px;
    white-space: normal;
  }
`;

const ShuffleSeatsButtonWrapper = styled(ButtonWrapper)`
  > button {
    display: block;
    font-size: 16px;
    white-space: normal;
  }
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

const buttonStyle = css`
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
  background: rgb(60 60 60);
  left: 0px;
  user-select: none;

  display: flex;
  justify-content: center;
  align-items: center;

  &:active&:not(:disabled) {
    transform: translate(5px, 5px);
  }

  cursor: pointer;

  &:disabled {
    background: rgb(185 185 185);
    cursor: not-allowed;
  }
`;

const floatStyle = css`
  z-index: ${zIndex.button};
`;

const floatButtonStyle = [buttonStyle, floatStyle].join(' ');
