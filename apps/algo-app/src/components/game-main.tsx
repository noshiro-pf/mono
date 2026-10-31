import { map, type InitializedObservable } from 'synstate';
import { constant, MatchOptional, view, type JSX } from 'synstate-dom';
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
          'flex-basis': view(layout, (l) => `${l.headerHeight}px`),
        }}
      >
        <GameMessage message={view(displayValues, (v) => v.gameMessage)} />
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
          'flex-basis': view(layout, (l) => `${l.footerHeight}px`),
        }}
      >
        <MyCards
          cards={view(displayValues, (v) => v.playerCards.S)}
          height={layout.pipe(map((l) => l.footerHeight))}
        />
      </div>

      <div class={constant(styles.endTurnButtonWrapper)}>
        <button
          class={constant(styles.endTurnButton)}
          disabled={view(displayValues, (v) => v.endTurnButtonDisabled)}
          type={constant('button')}
          onClick={gameStateStore.onTurnEndClick}
        >
          {constant(dictionary.gameMain.endTurnButton)}
        </button>
      </div>

      <MatchOptional
        some={(position) => <TurnPlayerHighlighter position={position} />}
        value={view(
          displayStore.turnPlayerHighlighterPosition,
          Optional.fromNullable,
        )}
      />

      <MatchOptional
        some={(props) => <ConfirmTossBalloon props={props} />}
        value={view(
          displayStore.confirmTossBalloonProps,
          Optional.fromNullable,
        )}
      />

      <MatchOptional
        some={(props) => <SelectAnswerBalloon props={props} />}
        value={view(
          displayStore.selectAnswerBalloonProps,
          Optional.fromNullable,
        )}
      />

      <MatchOptional
        some={(props) => <DecidedAnswerBalloon props={props} />}
        value={view(
          displayStore.decidedAnswerBalloonProps,
          Optional.fromNullable,
        )}
      />
    </div>
  );
};
