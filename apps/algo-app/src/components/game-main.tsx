import { map, type InitializedObservable } from 'synstate';
import { constant, MatchOptional, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { Rect } from 'ts-utils-additional';
import { dictionary } from '../constants/index.mjs';
import {
  displayStore,
  gameStateStore,
  positionStore,
} from '../store/index.mjs';
import {
  ConfirmTossBalloon,
  DecidedAnswerBalloon,
  SelectAnswerBalloon,
} from './balloon/index.mjs';
import { gameLayoutOf } from './game-layout.mjs';
import * as styles from './game-main.module.css';
import {
  GameMessage,
  MyCards,
  Table,
  TurnPlayerHighlighter,
} from './organisms/index.mjs';

type Props = Readonly<{
  windowSize: InitializedObservable<Rect>;
}>;

export const GameMain = ({ windowSize }: Props): JSX.Element => {
  const layout = windowSize.pipe(map(gameLayoutOf));

  const displayValues = displayStore.displayValues;

  return (
    <div class={constant(styles.root)}>
      <div
        class={constant(styles.header)}
        style={{
          'flex-basis': layout.pipe(map((l) => `${l.headerHeight}px`)),
        }}
      >
        <GameMessage message={displayValues.pipe(map((v) => v.gameMessage))} />
      </div>
      <div class={constant(styles.main)}>
        <Table
          cardPositionsDispatcher={positionStore.cardPositionsDispatcher}
          displayValues={displayValues}
          playerNamePositionsDispatcher={
            positionStore.playerNamePositionsDispatcher
          }
          tableSize={layout.pipe(map((l) => l.tableSize))}
          windowSize={windowSize}
        />
      </div>
      <div
        class={constant(styles.footer)}
        style={{
          'flex-basis': layout.pipe(map((l) => `${l.footerHeight}px`)),
        }}
      >
        <MyCards
          cards={displayValues.pipe(map((v) => v.playerCards.S))}
          height={layout.pipe(map((l) => l.footerHeight))}
        />
      </div>

      <div class={constant(styles.endTurnButtonWrapper)}>
        <button
          class={constant(styles.endTurnButton)}
          disabled={displayValues.pipe(map((v) => v.endTurnButtonDisabled))}
          type={constant('button')}
          onClick={gameStateStore.onTurnEndClick}
        >
          {constant(dictionary.gameMain.endTurnButton)}
        </button>
      </div>

      <MatchOptional
        some={(position) => <TurnPlayerHighlighter position={position} />}
        value={displayStore.turnPlayerHighlighterPosition.pipe(
          map(Optional.fromNullable),
        )}
      />

      <MatchOptional
        some={(props) => <ConfirmTossBalloon props={props} />}
        value={displayStore.confirmTossBalloonProps.pipe(
          map(Optional.fromNullable),
        )}
      />

      <MatchOptional
        some={(props) => <SelectAnswerBalloon props={props} />}
        value={displayStore.selectAnswerBalloonProps.pipe(
          map(Optional.fromNullable),
        )}
      />

      <MatchOptional
        some={(props) => <DecidedAnswerBalloon props={props} />}
        value={displayStore.decidedAnswerBalloonProps.pipe(
          map(Optional.fromNullable),
        )}
      />
    </div>
  );
};
