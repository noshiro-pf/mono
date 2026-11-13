/**
 * The game as this player sees it: the actions played here and those the
 * database has, merged into one list and folded into a `GameState`.
 *
 * An action played here is written to the room through `deps.addAction`, as a
 * document whose id `deps.newActionId` makes, so that it is known when it is
 * read back. The follow-ups of an answer are timed with `deps.setTimer`, and
 * the auto play with `deps.counter`, so the tests can run both by hand.
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
  asUint32,
  isNotUndefined,
  type SizeType,
} from 'ts-data-forge';
import type { NonEmptyTuple, SafeUintWithSmallInt } from 'ts-type-forge';
import { time } from '../constants/index.mjs';
import { returnFalse } from '../return-boolean.mjs';
import { gameStateReducer, initialGameState } from '../state/index.mjs';
import type {
  ActionRecord,
  Card,
  GameState,
  GameStateAction,
  GameStateActionFromDb,
  GameStateActionToWrite,
  NWES,
  Room,
} from '../types/index.mjs';

export type GameStateDeps = Readonly<{
  room: SynstateObservable<Room | undefined>;
  actionsFromDb: SynstateObservable<
    readonly ActionRecord<GameStateActionFromDb>[]
  >;
  addAction: (
    roomId: string,
    record: ActionRecord<GameStateActionToWrite>,
  ) => Promise<void>;
  /** A new id, unique across every client, for an action played here. */
  newActionId: () => string;
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
  /** Starts writing to the room and the auto play; returns what stops both. */
  start: () => () => void;
}>;

export const createGameStateStore = (deps: GameStateDeps): GameStateStore => {
  const localRecordSource = source<ActionRecord<GameStateActionToWrite>>();

  const gameStateDispatcher = (action: GameStateActionToWrite): void => {
    localRecordSource.next({ id: deps.newActionId(), action });
  };

  // The game is the room's actions in the server's order, then those played
  // here that the server does not hold yet, folded from the start: an action
  // another player commits while one of these is pending may come before it,
  // and each is applied once, in that order, by its id.
  const actionsInOrder: InitializedObservable<
    readonly ActionRecord<GameStateAction>[]
  > = merge([
    localRecordSource.pipe(map((r) => ({ type: 'local', value: r }) as const)),
    deps.actionsFromDb.pipe(
      map((rs) => ({ type: 'remote', value: rs }) as const),
    ),
  ] as const)
    .pipe(
      scan<
        Readonly<
          | {
              type: 'local';
              value: ActionRecord<GameStateActionToWrite>;
            }
          | {
              type: 'remote';
              value: readonly ActionRecord<GameStateActionFromDb>[];
            }
        >,
        Readonly<{
          remote: readonly ActionRecord<GameStateAction>[];
          pending: readonly ActionRecord<GameStateAction>[];
        }>
      >(
        ({ remote, pending }, received) => {
          switch (received.type) {
            case 'local':
              return { remote, pending: Arr.toPushed(pending, received.value) };

            case 'remote': {
              const held = new Set<string>(received.value.map((r) => r.id));

              return {
                remote: received.value,
                pending: pending.filter((r) => !held.has(r.id)),
              };
            }
          }
        },
        { remote: [], pending: [] },
      ),
    )
    .pipe(map(({ remote, pending }) => Arr.concat(remote, pending)));

  const gameState: InitializedObservable<GameState> = actionsInOrder.pipe(
    map((records) =>
      gameStateReducer(
        initialGameState,
        records.map(({ action }) => action),
      ),
    ),
  );

  const gameStateAction: SynstateObservable<GameStateActionToWrite> =
    localRecordSource.pipe(map((r) => r.action));

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
    // Each action played here is written once. A new snapshot of the room
    // (another player joining) re-emits the `combine`, so what to write is the
    // actions played since the last emission, not the latest one; those played
    // before the room is known are written, in order, once it is.
    const knownRoom = deps.room.pipe(filter(isNotUndefined));

    const playedHere = localRecordSource.pipe(
      scan<
        ActionRecord<GameStateActionToWrite>,
        readonly ActionRecord<GameStateActionToWrite>[]
      >((played, record) => Arr.toPushed(played, record), []),
    );

    const writing = combine([knownRoom, playedHere])
      .pipe(
        scan<
          readonly [Room, readonly ActionRecord<GameStateActionToWrite>[]],
          Readonly<{
            roomId: string | undefined;
            toWrite: readonly ActionRecord<GameStateActionToWrite>[];
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

        for (const record of toWrite) {
          Result.fromPromise(deps.addAction(roomId, record))
            .then(() => {
              if (returnFalse()) {
                console.log(roomId, record);
              }
            })
            .catch((error: unknown) => {
              console.error(error);
            });
        }
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

      // Unsubscribing leaves the nodes in the graph, where `playedHere` would
      // keep every later action; completing both completes what they feed.
      knownRoom.complete();

      playedHere.complete();

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

const actionsToAutoPlayStream = (
  counter: GameStateDeps['counter'],
  // The structural non-empty tuple rather than `NonEmptyArray`, which carries a
  // brand a `const` tuple literal cannot have. Both give `actions[0]` without
  // `| undefined`, which is all this needs.
  actions: NonEmptyTuple<GameStateActionToWrite>,
  numSkip: SafeUintWithSmallInt,
): SynstateObservable<GameStateActionToWrite> => {
  // Counting emissions with `scan` emits `actions[i]` on the i-th tick.
  // `skip` shifts the timer's own value, so the count has to be kept separately
  // rather than read off the tick.
  const ticks = counter(autoPlaySpeedRate * 1000);

  return (Num.isPositive(numSkip) ? ticks.pipe(skip(numSkip)) : ticks)
    .pipe(take(Arr.length(actions)))
    .pipe(scan((i: number) => i + 1, -1))
    .pipe(map((i) => actions[i] ?? actions[0]));
};

const autoPlay = (
  counter: GameStateDeps['counter'],
): SynstateObservable<GameStateActionToWrite> =>
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
