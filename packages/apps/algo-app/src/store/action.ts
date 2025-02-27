import { fromArray, interval, merge, take } from '@noshiro/syncflow';
import { serverTimestamp } from 'firebase/firestore';
import { time } from '../constants';
import { returnFalse } from '../return-boolean';
import { type Card, type GameStateAction, type NWES } from '../types';
import { db } from './database';

const autoPlaySpeedRate = 0.5;

const localGameStateActionSource$ = source<GameStateAction>();

const gameStateDispatcher = (action: GameStateAction): void => {
  localGameStateActionSource$.next(action);
};

export const gameStateActionMerged$: Observable<readonly GameStateAction[]> =
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  merge([
    localGameStateActionSource$.chain(
      map((a) => ({ type: 'local', value: a }) as const),
    ),
    db.actionsFromDb$.chain(
      map((a) => ({ type: 'remote', value: a }) as const),
    ),
  ] as const)
    .chain(
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
                commitsPlayed: [...commitsPlayed, action.value],
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
    .chain(map((s) => s.newCommits));

// actionsFromDb$.subscribe(console.log);
// gameStateActionMerged$.subscribe((merged) => {
//   console.log({ merged });
// });

combine([
  db.room$.chain(filter(isNotUndefined)),
  localGameStateActionSource$,
]).subscribe(([room, localAction]) => {
  db.addAction(room.id, localAction)
    .then(() => {
      if (returnFalse()) {
        console.log(room.id, localAction);
      }
    })
    .catch((error) => {
      console.error(error);
    });
});

export const gameStateAction$: Observable<GameStateAction> =
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
] as const satisfies NonEmptyArray<NonEmptyArray<GameStateAction>>;

const autoPlayMargin = toSafeUint(1 + (time.showJudge + time.hideJudge) / 1000);

const actionsToAutoPlayStream = (
  actions: NonEmptyArray<GameStateAction>,
  numSkip: SafeUintWithSmallInt,
): Observable<GameStateAction> =>
  zip([
    Num.isNonZero(numSkip)
      ? interval(autoPlaySpeedRate * 1000)
          .chain(skip(numSkip))
          .chain(take(Arr.length(actions)))
      : interval(autoPlaySpeedRate * 1000).chain(take(Arr.length(actions))),
    fromArray(actions),
  ] as const).chain(map(([, action]) => action));

// eslint-disable-next-line @typescript-eslint/no-deprecated
const autoPlay = merge([
  actionsToAutoPlayStream(actionsToAutoPlay[0], 0),
  actionsToAutoPlayStream(
    actionsToAutoPlay[1],
    SafeUint.add(autoPlayMargin, Arr.length(actionsToAutoPlay[0])),
  ),
  actionsToAutoPlayStream(
    actionsToAutoPlay[2],
    toSafeUint(
      autoPlayMargin +
        actionsToAutoPlay[0].length +
        autoPlayMargin +
        actionsToAutoPlay[1].length,
    ),
  ),
  actionsToAutoPlayStream(
    actionsToAutoPlay[3],
    toSafeUint(
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
