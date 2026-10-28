/**
 * The game as this player sees it: the actions played here and those the
 * database has, merged into one list and folded into a `GameState`.
 *
 * An action played here is written to the room through `deps.addAction`; the
 * follow-ups of an answer are timed with `deps.setTimer`, and the auto play
 * with `deps.counter`, so the tests can run both by hand.
 */

import { serverTimestamp } from 'firebase/firestore';
import {
  combine,
  filter,
  map,
  merge,
  pairwise,
  scan,
  skip,
  source,
  take,
  type InitializedObservable,
  type Observable as SynstateObservable,
} from 'synstate';
import {
  Arr,
  Num,
  Result,
  SafeUint,
  asSafeUint,
  isNotUndefined,
} from 'ts-data-forge';
import type {
  DeepReadonly,
  NonEmptyTuple,
  SafeUintWithSmallInt,
} from 'ts-type-forge';
import { time } from '../constants/index.mjs';
import { returnFalse } from '../return-boolean.mjs';
import { gameStateReducer, initialGameState } from '../state/index.mjs';
import type {
  Card,
  GameState,
  GameStateAction,
  NWES,
  Room,
} from '../types/index.mjs';

export type GameStateDeps = Readonly<{
  room: SynstateObservable<Room | undefined>;
  actionsFromDb: SynstateObservable<readonly GameStateAction[]>;
  addAction: (roomId: string, action: GameStateAction) => Promise<void>;
  /** Runs `run` after `delayMs`; returns what cancels it. */
  setTimer: (delayMs: number, run: () => void) => () => void;
  /** Counts up from 0 every `ms`. */
  counter: (ms: number) => SynstateObservable<number>;
}>;

export type GameStateStore = Readonly<{
  gameState: InitializedObservable<GameState>;
  /** Each action played here. */
  gameStateAction: SynstateObservable<GameStateAction>;
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
  /** Starts writing to the room and the auto play; returns what stops both. */
  start: () => () => void;
}>;

export const createGameStateStore = (deps: GameStateDeps): GameStateStore => {
  const localGameStateActionSource = source<GameStateAction>();

  const gameStateDispatcher = (action: GameStateAction): void => {
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

  const gameStateAction: SynstateObservable<GameStateAction> =
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

    deps.setTimer(autoPlaySpeedRate * time.showJudge, () => {
      gameStateDispatcher({
        type: 'showJudgeOnDecidedAnswer',
        timestamp: serverTimestamp(),
      });
    });

    deps.setTimer(autoPlaySpeedRate * (time.showJudge + time.hideJudge), () => {
      gameStateDispatcher({
        type: 'hideDecidedAnswerBalloon',
        timestamp: serverTimestamp(),
      });
    });
  };

  const onTurnEndClick = (): void => {
    gameStateDispatcher({
      type: 'goToNextTurn',
      timestamp: serverTimestamp(),
    });
  };

  const start = (): (() => void) => {
    const writing = combine([
      deps.room.pipe(filter(isNotUndefined)),
      localGameStateActionSource,
    ]).subscribe(([room, localAction]) => {
      Result.fromPromise(deps.addAction(room.id, localAction))
        .then(() => {
          if (returnFalse()) {
            console.log(room.id, localAction);
          }
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    });

    const autoPlaying = autoPlay(deps.counter).subscribe((action) => {
      // turn off auto play
      if (returnFalse()) {
        if (action.type === 'submitAnswer') {
          onAnswerSubmit();
        } else {
          gameStateDispatcher(action);
        }
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

      autoPlaying.unsubscribe();

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
  };
};

const autoPlaySpeedRate = 0.5;

// auto play

const actionsToAutoPlay = [
  [
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 6 },
    },
    {
      type: 'submitToss',
      timestamp: serverTimestamp(),
    },
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'white', number: 7 },
    },
    {
      type: 'selectOpponentCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 8 },
    },
    {
      type: 'selectAnswer',
      timestamp: serverTimestamp(),
      answer: { color: 'black', number: 9 },
    },
    {
      type: 'submitAnswer',
      timestamp: serverTimestamp(),
    },
  ],
  [
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'white', number: 1 },
    },
    {
      type: 'submitToss',
      timestamp: serverTimestamp(),
    },
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 8 },
    },
    {
      type: 'selectOpponentCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 6 },
    },
    {
      type: 'selectAnswer',
      timestamp: serverTimestamp(),
      answer: { color: 'black', number: 7 },
    },
    {
      type: 'submitAnswer',
      timestamp: serverTimestamp(),
    },
  ],
  [
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'white', number: 8 },
    },
    {
      type: 'submitToss',
      timestamp: serverTimestamp(),
    },
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'white', number: 3 },
    },
    {
      type: 'selectOpponentCard',
      timestamp: serverTimestamp(),
      card: { color: 'white', number: 0 },
    },
    {
      type: 'selectAnswer',
      timestamp: serverTimestamp(),
      answer: { color: 'white', number: 1 },
    },
    {
      type: 'submitAnswer',
      timestamp: serverTimestamp(),
    },
  ],
  [
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 5 },
    },
    {
      type: 'submitToss',
      timestamp: serverTimestamp(),
    },
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 0 },
    },
    {
      type: 'selectOpponentCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 6 },
    },
    {
      type: 'selectAnswer',
      timestamp: serverTimestamp(),
      answer: { color: 'black', number: 7 },
    },
    {
      type: 'submitAnswer',
      timestamp: serverTimestamp(),
    },
  ],
  // Not `satisfies NonEmptyArray<…>`: that type carries a brand only a guard
  // can establish, and a `const` tuple literal is already statically non-empty.
] as const;

const autoPlayMargin = asSafeUint(1 + (time.showJudge + time.hideJudge) / 1000);

const autoPlay = (
  counter: GameStateDeps['counter'],
): SynstateObservable<GameStateAction> =>
  merge([
    actionsToAutoPlayStream(counter, actionsToAutoPlay[0], 0),
    actionsToAutoPlayStream(
      counter,
      actionsToAutoPlay[1],
      SafeUint.add(autoPlayMargin, Arr.length(actionsToAutoPlay[0])),
    ),
    actionsToAutoPlayStream(
      counter,
      actionsToAutoPlay[2],
      asSafeUint(
        autoPlayMargin +
          actionsToAutoPlay[0].length +
          autoPlayMargin +
          actionsToAutoPlay[1].length,
      ),
    ),
    actionsToAutoPlayStream(
      counter,
      actionsToAutoPlay[3],
      asSafeUint(
        autoPlayMargin +
          actionsToAutoPlay[0].length +
          autoPlayMargin +
          actionsToAutoPlay[1].length +
          autoPlayMargin +
          actionsToAutoPlay[2].length,
      ),
    ),
  ] as const);

const actionsToAutoPlayStream = (
  counter: GameStateDeps['counter'],
  // The structural non-empty tuple rather than `NonEmptyArray`, which carries a
  // brand a `const` tuple literal cannot have. Both give `actions[0]` without
  // `| undefined`, which is all this needs.
  actions: NonEmptyTuple<GameStateAction>,
  numSkip: SafeUintWithSmallInt,
): SynstateObservable<GameStateAction> => {
  // Counting emissions with `scan` emits `actions[i]` on the i-th tick.
  // `skip` shifts the timer's own value, so the count has to be kept
  // separately rather than read off the tick.
  const ticks = counter(autoPlaySpeedRate * 1000);

  return (Num.isPositive(numSkip) ? ticks.pipe(skip(numSkip)) : ticks)
    .pipe(take(Arr.length(actions)))
    .pipe(scan((i: number) => i + 1, -1))
    .pipe(map((i) => actions[i] ?? actions[0]));
};
