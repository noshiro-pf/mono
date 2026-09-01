import { serverTimestamp } from 'firebase/firestore';
import {
  combine,
  counter,
  filter,
  map,
  merge,
  scan,
  skip,
  source,
  take,
  type Observable as SynstateObservable,
} from 'synstate';
import { Arr, Num, SafeUint, asSafeUint, isNotUndefined } from 'ts-data-forge';
import {
  type DeepReadonly,
  type NonEmptyTuple,
  type SafeUintWithSmallInt,
} from 'ts-type-forge';
import { time } from '../constants/index.mjs';
import { returnFalse } from '../return-boolean.mjs';
import { type Card, type GameStateAction, type NWES } from '../types/index.mjs';
import { db } from './database.mjs';

const autoPlaySpeedRate = 0.5;

const localGameStateActionSource$ = source<GameStateAction>();

const gameStateDispatcher = (action: GameStateAction): void => {
  localGameStateActionSource$.next(action);
};

export const gameStateActionMerged$: SynstateObservable<
  readonly GameStateAction[]
> = merge([
  localGameStateActionSource$.pipe(
    map((a) => ({ type: 'local', value: a }) as const),
  ),
  db.actionsFromDb$.pipe(map((a) => ({ type: 'remote', value: a }) as const)),
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
        console.log(commitsPlayed, action);

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
                  newCommits: Arr.skip(action.value, Arr.length(commitsPlayed)),
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

// actionsFromDb$.subscribe(console.log);
// gameStateActionMerged$.subscribe((merged) => {
//   console.log({ merged });
// });

combine([
  db.room$.pipe(filter(isNotUndefined)),
  localGameStateActionSource$,
]).subscribe(([room, localAction]) => {
  db.addAction(room.id, localAction)
    .then(() => {
      if (returnFalse()) {
        console.log(room.id, localAction);
      }
    })
    .catch((error: unknown) => {
      console.error(error);
    });
});

export const gameStateAction$: SynstateObservable<GameStateAction> =
  localGameStateActionSource$;

export const onCardClick = (card: Card, playerDirectionFromMe: NWES): void => {
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

export const onTossCancel = (): void => {
  gameStateDispatcher({
    type: 'cancelToss',
    timestamp: serverTimestamp(),
  });
};

export const onTossSubmit = (): void => {
  gameStateDispatcher({
    type: 'submitToss',
    timestamp: serverTimestamp(),
  });
};

export const onSelectAnswer = (answer: Card): void => {
  gameStateDispatcher({
    type: 'selectAnswer',
    timestamp: serverTimestamp(),
    answer,
  });
};

export const onAnswerCancel = (): void => {
  gameStateDispatcher({
    type: 'cancelAnswer',
    timestamp: serverTimestamp(),
  });
};

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
export const onAnswerSubmit = (): void => {
  gameStateDispatcher({
    type: 'submitAnswer',
    timestamp: serverTimestamp(),
  });

  setTimeout(() => {
    gameStateDispatcher({
      type: 'showJudgeOnDecidedAnswer',
      timestamp: serverTimestamp(),
    });
  }, autoPlaySpeedRate * time.showJudge);

  setTimeout(
    () => {
      gameStateDispatcher({
        type: 'hideDecidedAnswerBalloon',
        timestamp: serverTimestamp(),
      });
    },
    autoPlaySpeedRate * (time.showJudge + time.hideJudge),
  );
};

export const onTurnEndClick = (): void => {
  gameStateDispatcher({
    type: 'goToNextTurn',
    timestamp: serverTimestamp(),
  });
};

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
  // The structural non-empty tuple rather than `NonEmptyArray`, which carries a
  // brand a `const` tuple literal cannot have. Both give `actions[0]` without
  // `| undefined`, which is all this needs.
  actions: NonEmptyTuple<GameStateAction>,
  numSkip: SafeUintWithSmallInt,
): SynstateObservable<GameStateAction> => {
  // `interval` is `counter` now, and `fromArray` has no successor. The
  // original zipped the timer with the action list to emit `actions[i]` on
  // the i-th tick; counting emissions with `scan` gives the same index
  // without a second stream. `skip` shifts the timer's own value, so the
  // count has to be kept separately rather than read off the tick.
  const ticks = counter(autoPlaySpeedRate * 1000);

  return (Num.isPositive(numSkip) ? ticks.pipe(skip(numSkip)) : ticks)
    .pipe(take(Arr.length(actions)))
    .pipe(scan((i: number) => i + 1, -1))
    .pipe(map((i) => actions[i] ?? actions[0]));
};

const autoPlay = merge([
  actionsToAutoPlayStream(actionsToAutoPlay[0], 0),
  actionsToAutoPlayStream(
    actionsToAutoPlay[1],
    SafeUint.add(autoPlayMargin, Arr.length(actionsToAutoPlay[0])),
  ),
  actionsToAutoPlayStream(
    actionsToAutoPlay[2],
    asSafeUint(
      autoPlayMargin +
        actionsToAutoPlay[0].length +
        autoPlayMargin +
        actionsToAutoPlay[1].length,
    ),
  ),
  actionsToAutoPlayStream(
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

autoPlay.subscribe((action) => {
  // turn off auto play
  if (returnFalse()) {
    if (action.type === 'submitAnswer') {
      onAnswerSubmit();
    } else {
      gameStateDispatcher(action);
    }
  }
});

gameStateAction$.subscribe((action) => {
  if (returnFalse()) {
    console.log('action', action);
  }
});
