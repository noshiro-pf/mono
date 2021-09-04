import type { Observable } from '@noshiro/syncflow';
import {
  fromArray,
  interval,
  map,
  merge,
  skip,
  subject,
  take,
  zip,
} from '@noshiro/syncflow';
import { time } from '../constants';
import { returnFalse } from '../return-boolean';
import type { Card, GameStateAction, NWES } from '../types';

const autoPlaySpeedRate = 0.5;

export const gameStateAction$ = subject<GameStateAction>();

const gameStateDispatcher = (action: GameStateAction): void => {
  gameStateAction$.next(action);
};

export const onCardClick = (card: Card, playerDirectionFromMe: NWES): void => {
  switch (playerDirectionFromMe) {
    case 'W':
    case 'E':
      gameStateDispatcher({ type: 'selectOpponentCard', card });
      break;
    case 'S':
      gameStateDispatcher({ type: 'selectMyCard', card });
      break;
    case 'N':
      break;
  }
};

export const onTossCancel = (): void => {
  gameStateDispatcher({ type: 'cancelToss' });
};

export const onTossSubmit = (): void => {
  gameStateDispatcher({ type: 'submitToss' });
};

export const onSelectAnswer = (answer: Card): void => {
  gameStateDispatcher({ type: 'selectAnswer', answer });
};

export const onAnswerCancel = (): void => {
  gameStateDispatcher({ type: 'cancelAnswer' });
};

/**
 * ```
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
  gameStateDispatcher({ type: 'submitAnswer' });

  setTimeout(() => {
    gameStateDispatcher({ type: 'showJudgeOnDecidedAnswer' });
  }, autoPlaySpeedRate * time.showJudge);

  setTimeout(() => {
    gameStateDispatcher({ type: 'hideDecidedAnswerBalloon' });
  }, autoPlaySpeedRate * (time.showJudge + time.hideJudge));
};

// auto play

const actionsToAutoPlay = [
  [
    {
      type: 'selectMyCard',
      card: { color: 'black', number: 6 },
    },
    {
      type: 'submitToss',
    },
    {
      type: 'selectMyCard',
      card: { color: 'white', number: 7 },
    },
    {
      type: 'selectOpponentCard',
      card: { color: 'black', number: 8 },
    },
    {
      type: 'selectAnswer',
      answer: { color: 'black', number: 9 },
    },
    {
      type: 'submitAnswer',
    },
  ],
  [
    {
      type: 'selectMyCard',
      card: { color: 'white', number: 1 },
    },
    {
      type: 'submitToss',
    },
    {
      type: 'selectMyCard',
      card: { color: 'black', number: 8 },
    },
    {
      type: 'selectOpponentCard',
      card: { color: 'black', number: 6 },
    },
    {
      type: 'selectAnswer',
      answer: { color: 'black', number: 7 },
    },
    {
      type: 'submitAnswer',
    },
  ],
  [
    {
      type: 'selectMyCard',
      card: { color: 'white', number: 8 },
    },
    {
      type: 'submitToss',
    },
    {
      type: 'selectMyCard',
      card: { color: 'white', number: 3 },
    },
    {
      type: 'selectOpponentCard',
      card: { color: 'white', number: 0 },
    },
    {
      type: 'selectAnswer',
      answer: { color: 'white', number: 1 },
    },
    {
      type: 'submitAnswer',
    },
  ],
  [
    {
      type: 'selectMyCard',
      card: { color: 'black', number: 5 },
    },
    {
      type: 'submitToss',
    },
    {
      type: 'selectMyCard',
      card: { color: 'black', number: 0 },
    },
    {
      type: 'selectOpponentCard',
      card: { color: 'black', number: 6 },
    },
    {
      type: 'selectAnswer',
      answer: { color: 'black', number: 7 },
    },
    {
      type: 'submitAnswer',
    },
  ],
] as const;

const autoPlayMargin = 1 + (time.showJudge + time.hideJudge) / 1000;

const actionsToAutoPlayStream = <T>(
  actions: readonly T[],
  numSkip: number
): Observable<T> =>
  zip([
    interval(autoPlaySpeedRate * 1000)
      .chain(skip(numSkip))
      .chain(take(actions.length)),
    fromArray(actions),
  ] as const).chain(map(([, action]) => action));

const autoPlay = merge([
  actionsToAutoPlayStream(actionsToAutoPlay[0], 0),
  actionsToAutoPlayStream(
    actionsToAutoPlay[1],
    autoPlayMargin + actionsToAutoPlay[0].length
  ),
  actionsToAutoPlayStream(
    actionsToAutoPlay[2],
    autoPlayMargin +
      actionsToAutoPlay[0].length +
      autoPlayMargin +
      actionsToAutoPlay[1].length
  ),
  actionsToAutoPlayStream(
    actionsToAutoPlay[3],
    autoPlayMargin +
      actionsToAutoPlay[0].length +
      autoPlayMargin +
      actionsToAutoPlay[1].length +
      autoPlayMargin +
      actionsToAutoPlay[2].length
  ),
] as const).chain(take(1000));

autoPlay.subscribe((action) => {
  if (action.type === 'submitAnswer') {
    onAnswerSubmit();
  } else {
    gameStateDispatcher(action);
  }
});

gameStateAction$.subscribe((action) => {
  if (returnFalse()) {
    console.log('action', action);
  }
});
