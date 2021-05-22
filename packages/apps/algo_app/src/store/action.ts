import type { Observable } from '@noshiro/syncflow';
import { mapTo, merge, mergeMap, of, subject, timer } from '@noshiro/syncflow';
import { time } from '../constants';
import type { Card, GameStateAction, NWES } from '../types';

const gameStateAction$ = subject<GameStateAction>();

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
export const gameStateActionWithTimerExecution$: Observable<GameStateAction> =
  gameStateAction$.chain(
    mergeMap((action): Observable<GameStateAction> => {
      switch (action.type) {
        case 'submitAnswer':
          return merge(
            of(action),
            timer(time.showJudge).chain(
              mapTo({ type: 'showJudgeOnDecidedAnswer' as const })
            ),
            timer(time.showJudge + time.hideJudge).chain(
              mapTo({ type: 'hideDecidedAnswerBalloon' as const })
            )
          );
        default:
          return of(action);
      }
    })
  );

gameStateAction$.subscribe((action) => {
  console.log('gameStateAction$', action);
});

gameStateActionWithTimerExecution$.subscribe((action) => {
  console.log('gameStateActionWithTimerExecution$', action);
});

const gameStateDispatcher = (action: GameStateAction): void => {
  gameStateAction$.next(action);
};

export const onCardClick = (card: Card, playerDirectionFromMe: NWES): void => {
  switch (playerDirectionFromMe) {
    case 'W':
    case 'E':
      gameStateDispatcher({ type: 'selectCardToAnswer', card });
      console.log(playerDirectionFromMe, card);
      break;
    case 'S':
      gameStateDispatcher({ type: 'selectAttackCard', card });
      break;
    case 'N':
      break;
  }
};

export const onSelectAnswer = (answer: Card): void => {
  gameStateDispatcher({ type: 'selectAnswer', answer });
};

export const onAnswerCancel = (): void => {
  gameStateDispatcher({ type: 'cancelAnswer' });
};

export const onAnswerSubmit = (): void => {
  gameStateDispatcher({ type: 'submitAnswer' });
};
