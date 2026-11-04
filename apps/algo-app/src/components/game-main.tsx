import { map, type InitializedObservable } from 'synstate';
import { constant, If, MatchOptional, view, type JSX } from 'synstate-dom';
import { Optional, Result } from 'ts-data-forge';
import type { Rect } from 'ts-utils-additional';
import { dictionary, roomPage, routes } from '../constants/index.mjs';
import { router } from '../router.mjs';
import {
  displayStore,
  gameMainStore,
  gameStateStore,
  positionStore,
  roomStore,
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

const dc = dictionary.gameMain;

export const GameMain = ({ windowSize }: Props): JSX.Element => {
  const layout = windowSize.pipe(map(gameLayoutOf));

  const displayValues = displayStore.displayValues;

  const notStarted = view(displayValues, (v) => v.roomState === 'not-started');

  const cardsAreHidden = displayValues.pipe(map((v) => v.cardsAreHidden));

  return (
    <div class={constant(styles.root)}>
      <div class={constant(`${styles.floatButtons} ${styles.northWest}`)}>
        <div class={constant(styles.buttonWrapper)}>
          {/* A new game is a room of its own, opened beside this one. */}
          <a
            class={constant(styles.floatButton)}
            href={constant(router.toUrl(routes.main.href()))}
            rel={constant('noopener noreferrer')}
            target={constant('_blank')}
          >
            {constant(dc.newGame)}
          </a>
        </div>
      </div>

      <div class={constant(`${styles.floatButtons} ${styles.southEast}`)}>
        <If
          cond={notStarted}
          then={
            <div class={constant(styles.lobbyButtons)}>
              <div
                class={constant(
                  `${styles.buttonWrapper} ${styles.twoLineButton}`,
                )}
              >
                <button
                  class={constant(styles.floatButton)}
                  type={constant('button')}
                  onClick={onCopyLinkClick}
                >
                  <div>{constant(dc.copyLink[0])}</div>
                  <div>{constant(dc.copyLink[1])}</div>
                </button>
              </div>
              <div
                class={constant(
                  `${styles.buttonWrapper} ${styles.twoLineButton}`,
                )}
              >
                <button
                  class={constant(styles.floatButton)}
                  disabled={gameMainStore.shuffleSeatsButtonDisabled}
                  type={constant('button')}
                  onClick={gameMainStore.onShuffleSeatsClick}
                >
                  <div>{constant(dc.shuffleSeats[0])}</div>
                  <div>{constant(dc.shuffleSeats[1])}</div>
                </button>
              </div>
              <div class={constant(styles.buttonWrapper)}>
                <button
                  class={constant(styles.floatButton)}
                  type={constant('button')}
                  onClick={onExitClick}
                >
                  {constant(dc.exit)}
                </button>
              </div>
            </div>
          }
        />

        <div class={constant(styles.buttonWrapper)}>
          <If
            cond={notStarted}
            else={
              <button
                class={constant(styles.floatButton)}
                disabled={view(displayValues, (v) => v.endTurnButtonDisabled)}
                type={constant('button')}
                onClick={gameStateStore.onTurnEndClick}
              >
                {constant(dc.endTurnButton)}
              </button>
            }
            then={
              <button
                class={constant(styles.floatButton)}
                // Four players are needed to start.
                disabled={view(
                  displayValues,
                  (v) => v.startGameButtonState === 'disabled',
                )}
                type={constant('button')}
                onClick={gameMainStore.onStartGameClick}
              >
                {constant(dc.startGame)}
              </button>
            }
          />
        </div>
      </div>

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
          cardsAreHidden={cardsAreHidden}
          height={layout.pipe(map((l) => l.footerHeight))}
        />
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

/**
 * Copies the link others join the room by: the room's page without this
 * player's id.
 */
const onCopyLinkClick = (): void => {
  const roomId = roomStore.room.getSnapshot().value?.id;

  // https://stackoverflow.com/questions/51805395/navigator-clipboard-is-undefined
  // `clipboard` is missing outside a secure context, whatever its type says.
  if (roomId === undefined || !globalThis.isSecureContext) {
    return;
  }

  const url = new URL(
    router.toUrl(roomPage(roomId)),
    globalThis.location.origin,
  );

  // TODO: say that it was copied (a toast)
  globalThis.navigator.clipboard.writeText(url.href).catch(console.error);
};

/** Leaves the room, back to its join form. */
const onExitClick = (): void => {
  gameMainStore
    .exit()
    .then((res) => {
      if (Result.isOk(res)) {
        router.push(roomPage(res.value));
      } else {
        console.error(res.value);
      }
    })
    .catch(console.error);
};
