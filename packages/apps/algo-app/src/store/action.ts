import { serverTimestamp } from 'firebase/firestore';
import { api } from '../api';
import { time } from '../constants';
import { type Card, type GameStateAction, type NWES } from '../types';
import { DB } from './database';

export const gameStateNewActions$: Observable<readonly GameStateAction[]> =
  DB.actionsFromDb$
    .chain(
      scan<
        readonly GameStateAction[],
        DeepReadonly<{
          newCommits: GameStateAction[];
          commitsPlayed: GameStateAction[];
        }>
      >(
        ({ commitsPlayed }, actionsFromDb) =>
          Arr.length(actionsFromDb) <= Arr.length(commitsPlayed)
            ? {
                newCommits: [],
                commitsPlayed,
              } // ローカルの方が進んでいるときは無視
            : {
                newCommits: Arr.skip(actionsFromDb, Arr.length(commitsPlayed)),
                commitsPlayed: actionsFromDb,
              },
        {
          newCommits: [],
          commitsPlayed: [],
        },
      ),
    )
    .chain(pluck('newCommits'));

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
  }, time.showJudge);

  setTimeout(() => {
    gameStateDispatcher({
      type: 'hideDecidedAnswerBalloon',
      timestamp: serverTimestamp(),
    });
  }, time.showJudge + time.hideJudge);
};

export const onTurnEndClick = (): void => {
  gameStateDispatcher({
    type: 'goToNextTurn',
    timestamp: serverTimestamp(),
  });
};

// subscriptions

const mut_subscribedValues: {
  roomId: string | undefined;
} = { roomId: undefined };

DB.room$
  .chain(filter(isNotUndefined))
  .chain(pluck('id'))
  .subscribe((roomId) => {
    mut_subscribedValues.roomId = roomId;
  });

export const gameStateDispatcher = (action: GameStateAction): void => {
  const { roomId } = mut_subscribedValues;
  if (roomId !== undefined) {
    api.addAction(roomId, action).catch(console.error);
  }
};
