/**
 * The game as this player sees it: the actions played here and those the
 * database has, merged into one list and folded into a `GameState`.
 *
 * An action played here is written to the room through `deps.addAction`; the
 * follow-ups of an answer are timed with `deps.setTimer`, and the auto play
 * (`auto-play.mts`) with `deps.counter`, so the tests can run both by hand.
 */

import { serverTimestamp } from 'firebase/firestore';
import {
  combine,
  filter,
  map,
  merge,
  pairwise,
  scan,
  source,
  type InitializedObservable,
  type Observable as SynstateObservable,
} from 'synstate';
import {
  Arr,
  Result,
  asUint32,
  isNotUndefined,
  type SizeType,
} from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { time } from '../constants/index.mjs';
import { returnFalse } from '../return-boolean.mjs';
import { gameStateReducer, initialGameState } from '../state/index.mjs';
import {
  toPlayerCardsRemote,
  type Card,
  type GameState,
  type GameStateAction,
  type GameStateActionFromDb,
  type GameStateActionToWrite,
  type NWES,
  type Room,
} from '../types/index.mjs';
import { autoPlay, autoPlayPlayerCards } from './auto-play.mjs';

export type GameStateDeps = Readonly<{
  room: SynstateObservable<Room | undefined>;
  actionsFromDb: SynstateObservable<readonly GameStateActionFromDb[]>;
  addAction: (roomId: string, action: GameStateActionToWrite) => Promise<void>;
  /** Runs `run` after `delayMs`; returns what cancels it. */
  setTimer: (delayMs: number, run: () => void) => () => void;
  /** Counts up from 0 every `ms`. */
  counter: (ms: number) => SynstateObservable<number>;
}>;

export type GameStateStore = Readonly<{
  gameState: InitializedObservable<GameState>;
  /** Each action played here. */
  gameStateAction: SynstateObservable<GameStateActionToWrite>;
  onCardClick: (card: Card, playerDirectionFromMe: NWES) => void;
  onTossCancel: () => void;
  onTossSubmit: () => void;
  onSelectAnswer: (answer: Card) => void;
  onAnswerCancel: () => void;
  /**
   * ```txt
   * time
   *  |   submitAnswer (hide buttons balloon, show answer balloon)
   *  |    --- 1s ---
   *  |   showJudge (judge answer, show judge icon)
   *  |    --- 3s ---
   *  |   hideAnswerBalloon (hide answer balloon, face up card, go to the next phase/turn)
   *  v
   * ```
   */
  onAnswerSubmit: () => void;
  onTurnEndClick: () => void;
  /** Starts writing to the room; returns what stops it. */
  start: () => () => void;
  /**
   * Deals the fixed hand of the auto play and plays its script, as a
   * development build does with `?test`; returns what stops the script.
   */
  startAutoPlay: () => () => void;
}>;

export const createGameStateStore = (deps: GameStateDeps): GameStateStore => {
  const localGameStateActionSource = source<GameStateActionToWrite>();

  const gameStateDispatcher = (action: GameStateActionToWrite): void => {
    localGameStateActionSource.next(action);
  };

  const gameStateActionMerged: SynstateObservable<readonly GameStateAction[]> =
    merge([
      localGameStateActionSource.pipe(
        map((a) => ({ type: 'local', value: a }) as const),
      ),
      deps.actionsFromDb.pipe(
        map((a) => ({ type: 'remote', value: a }) as const),
      ),
    ] as const)
      .pipe(
        scan<
          DeepReadonly<
            | { type: 'local'; value: GameStateAction }
            | { type: 'remote'; value: GameStateAction[] }
          >,
          DeepReadonly<{
            newCommits: GameStateAction[];
            commitsPlayed: GameStateAction[];
          }>
        >(
          ({ commitsPlayed }, action) => {
            if (returnFalse()) {
              console.log(commitsPlayed, action);
            }

            switch (action.type) {
              case 'local':
                return {
                  newCommits: [action.value],
                  commitsPlayed: Arr.toPushed(commitsPlayed, action.value),
                };
              case 'remote':
                return action.value.length <= commitsPlayed.length
                  ? {
                      commitsPlayed,
                      newCommits: [],
                    } // ローカルの方が進んでいるときは無視
                  : {
                      newCommits: Arr.skip(
                        action.value,
                        Arr.length(commitsPlayed),
                      ),
                      commitsPlayed: action.value,
                    };
            }
          },
          {
            newCommits: [],
            commitsPlayed: [],
          },
        ),
      )
      .pipe(map((s) => s.newCommits));

  const gameState: InitializedObservable<GameState> =
    gameStateActionMerged.pipe(scan(gameStateReducer, initialGameState));

  const gameStateAction: SynstateObservable<GameStateActionToWrite> =
    localGameStateActionSource;

  const onCardClick = (card: Card, playerDirectionFromMe: NWES): void => {
    switch (playerDirectionFromMe) {
      case 'W':
      case 'E':
        gameStateDispatcher({
          type: 'selectOpponentCard',
          timestamp: serverTimestamp(),
          card,
        });

        break;
      case 'S':
        gameStateDispatcher({
          type: 'selectMyCard',
          timestamp: serverTimestamp(),
          card,
        });

        break;
      case 'N':
        break;
    }
  };

  const onTossCancel = (): void => {
    gameStateDispatcher({
      type: 'cancelToss',
      timestamp: serverTimestamp(),
    });
  };

  const onTossSubmit = (): void => {
    gameStateDispatcher({
      type: 'submitToss',
      timestamp: serverTimestamp(),
    });
  };

  const onSelectAnswer = (answer: Card): void => {
    gameStateDispatcher({
      type: 'selectAnswer',
      timestamp: serverTimestamp(),
      answer,
    });
  };

  const onAnswerCancel = (): void => {
    gameStateDispatcher({
      type: 'cancelAnswer',
      timestamp: serverTimestamp(),
    });
  };

  const onAnswerSubmit = (): void => {
    gameStateDispatcher({
      type: 'submitAnswer',
      timestamp: serverTimestamp(),
    });

    deps.setTimer(time.showJudge, () => {
      gameStateDispatcher({
        type: 'showJudgeOnDecidedAnswer',
        timestamp: serverTimestamp(),
      });
    });

    deps.setTimer(time.showJudge + time.hideJudge, () => {
      gameStateDispatcher({
        type: 'hideDecidedAnswerBalloon',
        timestamp: serverTimestamp(),
      });
    });
  };

  const startAutoPlay = (): (() => void) => {
    gameStateDispatcher({
      type: 'initializePlayerCards',
      timestamp: serverTimestamp(),
      cards: toPlayerCardsRemote(autoPlayPlayerCards),
    });

    const autoPlaying = autoPlay(deps.counter).subscribe((action) => {
      if (action.type === 'submitAnswer') {
        onAnswerSubmit();
      } else {
        gameStateDispatcher(action);
      }
    });

    return () => {
      autoPlaying.unsubscribe();
    };
  };

  const onTurnEndClick = (): void => {
    gameStateDispatcher({
      type: 'goToNextTurn',
      timestamp: serverTimestamp(),
    });
  };

  const start = (): (() => void) => {
    // Each action played here is written once. A new snapshot of the room
    // (another player joining) re-emits the `combine`, so what to write is the
    // actions played since the last emission, not the latest one; those played
    // before the room is known are written, in order, once it is.
    const knownRoom = deps.room.pipe(filter(isNotUndefined));

    const playedHere = localGameStateActionSource.pipe(
      scan<GameStateActionToWrite, readonly GameStateActionToWrite[]>(
        (played, action) => Arr.toPushed(played, action),
        [],
      ),
    );

    const writing = combine([knownRoom, playedHere])
      .pipe(
        scan<
          readonly [Room, readonly GameStateActionToWrite[]],
          DeepReadonly<{
            roomId: string | undefined;
            toWrite: GameStateActionToWrite[];
            numWritten: SizeType.Arr;
          }>
        >(
          ({ numWritten }, [room, played]) => ({
            roomId: room.id,
            toWrite: Arr.skip(played, numWritten),
            numWritten: Arr.length(played),
          }),
          { roomId: undefined, toWrite: [], numWritten: asUint32(0) },
        ),
      )
      .subscribe(({ roomId, toWrite }) => {
        if (roomId === undefined) {
          return;
        }

        for (const localAction of toWrite) {
          Result.fromPromise(deps.addAction(roomId, localAction))
            .then(() => {
              if (returnFalse()) {
                console.log(roomId, localAction);
              }
            })
            .catch((error: unknown) => {
              console.error(error);
            });
        }
      });

    const loggingState = gameState
      .pipe(pairwise())
      .subscribe(([prev, curr]) => {
        if (returnFalse()) {
          console.log('gameState.prev', prev, 'gameState.curr', curr);
        }
      });

    const loggingAction = gameStateAction.subscribe((action) => {
      if (returnFalse()) {
        console.log('action', action);
      }
    });

    return () => {
      writing.unsubscribe();

      // Unsubscribing leaves the nodes in the graph, where `playedHere` would
      // keep every later action; completing both completes what they feed.
      knownRoom.complete();

      playedHere.complete();

      loggingState.unsubscribe();

      loggingAction.unsubscribe();
    };
  };

  return {
    gameState,
    gameStateAction,
    onCardClick,
    onTossCancel,
    onTossSubmit,
    onSelectAnswer,
    onAnswerCancel,
    onAnswerSubmit,
    onTurnEndClick,
    start,
    startAutoPlay,
  };
};
