import { serverTimestamp } from 'firebase/firestore';
import { createState, source } from 'synstate';
import { newRoom } from '../functions/index.mjs';
import type { Card, GameStateAction, Room } from '../types/index.mjs';
import {
  createGameStateStore,
  type GameStateStore,
} from './game-state-store.mjs';

describe(createGameStateStore, () => {
  test('folds an action played here into the game state', () => {
    const { store } = setup();

    store.onCardClick(black6, 'S');

    assert.deepStrictEqual(
      store.gameState.getSnapshot().value.cardChosenToToss,
      black6,
    );

    assert.isTrue(store.gameState.getSnapshot().value.confirmTossBalloonIsOpen);

    store.onTossCancel();

    assert.isUndefined(store.gameState.getSnapshot().value.cardChosenToToss);

    assert.isFalse(
      store.gameState.getSnapshot().value.confirmTossBalloonIsOpen,
    );
  });

  test('a card clicked in the player across the table does nothing', () => {
    const { store, played } = setup();

    store.onCardClick(black6, 'N');

    assert.deepStrictEqual(played, []);
  });

  test('plays only the actions from the database that were not played here', () => {
    const { store, actionsFromDb } = setup();

    store.onCardClick(black6, 'S');

    // The database echoes the action played here; played twice, the second
    // `selectMyCard` of the same card would unselect it.
    actionsFromDb.next([selectMyCard(black6)]);

    assert.deepStrictEqual(
      store.gameState.getSnapshot().value.cardChosenToToss,
      black6,
    );

    actionsFromDb.next([selectMyCard(black6), selectMyCard(white7)]);

    assert.deepStrictEqual(
      store.gameState.getSnapshot().value.cardChosenToToss,
      white7,
    );
  });

  test('writes each action played before the room is known, in order, once it is', () => {
    const { store, setRoom, written } = setup();

    store.start();

    store.onTurnEndClick();

    store.onTossSubmit();

    assert.deepStrictEqual(written, []);

    setRoom(roomWithId('a'));

    store.onTossCancel();

    assert.deepStrictEqual(writtenTypes(written), [
      ['a', 'goToNextTurn'],
      ['a', 'submitToss'],
      ['a', 'cancelToss'],
    ]);
  });

  test('writes to a room known before the store starts', () => {
    const { store, setRoom, written } = setup();

    setRoom(roomWithId('a'));

    store.start();

    store.onTossCancel();

    assert.deepStrictEqual(writtenTypes(written), [['a', 'cancelToss']]);
  });

  test('a new snapshot of the room writes no action again', () => {
    const { store, setRoom, written } = setup();

    store.start();

    setRoom(roomWithId('a'));

    store.onTossCancel();

    // Another player joining changes `players`. Written again, the action would
    // reach every client twice, and a second `selectMyCard` unselects.
    setRoom({
      ...roomWithId('a'),
      players: [
        { name: 'alice', online: true },
        { name: 'bob', online: true },
      ],
    });

    assert.deepStrictEqual(writtenTypes(written), [['a', 'cancelToss']]);
  });

  test('starting again after stop writes no action again', () => {
    const { store, setRoom, written } = setup();

    setRoom(roomWithId('a'));

    const stopStore = store.start();

    store.onTossCancel();

    stopStore();

    store.start();

    store.onTossSubmit();

    assert.deepStrictEqual(writtenTypes(written), [
      ['a', 'cancelToss'],
      ['a', 'submitToss'],
    ]);
  });

  test('stop ends the writing', () => {
    const { store, setRoom, written } = setup();

    setRoom(roomWithId('a'));

    const stopStore = store.start();

    stopStore();

    store.onTossCancel();

    assert.deepStrictEqual(written, []);
  });

  test('submitting an answer shows the judge, then hides the balloon, on timers', () => {
    const { store, played, timers } = setup();

    store.onAnswerSubmit();

    assert.deepStrictEqual(played, ['submitAnswer']);

    assert.deepStrictEqual(
      timers.map(([delayMs]) => delayMs),
      [500, 2000],
    );

    for (const [, run] of timers) {
      run();
    }

    assert.deepStrictEqual(played, [
      'submitAnswer',
      'showJudgeOnDecidedAnswer',
      'hideDecidedAnswerBalloon',
    ]);
  });

  test('the auto play is off: its ticks play nothing', () => {
    const { store, played, tick } = setup();

    store.start();

    for (const n of Array.from({ length: 40 }, (_, i) => i)) {
      tick(n);
    }

    assert.deepStrictEqual(played, []);
  });
});

type Setup = Readonly<{
  store: GameStateStore;
  setRoom: (room: Room | undefined) => void;
  actionsFromDb: Readonly<{
    next: (actions: readonly GameStateAction[]) => void;
  }>;
  /** Each `addAction` call, as its arguments. */
  written: readonly (readonly [string, GameStateAction])[];
  /** The type of each action played here, in order. */
  played: readonly GameStateAction['type'][];
  timers: readonly (readonly [number, () => void])[];
  /** Advances every counter the store asked for. */
  tick: (n: number) => void;
}>;

const cancelNothing = (): void => undefined;

const setup = (): Setup => {
  const [roomState, setRoom] = createState<Room | undefined>(undefined);

  const actionsFromDb = source<readonly GameStateAction[]>();

  const ticks = source<number>();

  const mut_written: (readonly [string, GameStateAction])[] = [];

  const mut_played: GameStateAction['type'][] = [];

  const mut_timers: (readonly [number, () => void])[] = [];

  const store = createGameStateStore({
    room: roomState,
    actionsFromDb,
    addAction: (roomId, action) => {
      mut_written.push([roomId, action]);

      return Promise.resolve();
    },
    setTimer: (delayMs, run) => {
      mut_timers.push([delayMs, run]);

      return cancelNothing;
    },
    counter: () => ticks,
  });

  store.gameStateAction.subscribe((action) => {
    mut_played.push(action.type);
  });

  return {
    store,
    setRoom,
    actionsFromDb: {
      next: (actions) => {
        actionsFromDb.next(actions);
      },
    },
    written: mut_written,
    played: mut_played,
    timers: mut_timers,
    tick: (n) => {
      ticks.next(n);
    },
  } as const;
};

const black6: Card = { color: 'black', number: 6 } as const;

const white7: Card = { color: 'white', number: 7 } as const;

const selectMyCard = (card: Card): GameStateAction =>
  ({
    type: 'selectMyCard',
    timestamp: serverTimestamp(),
    card,
  }) as const;

const writtenTypes = (
  written: Setup['written'],
): readonly (readonly [string, GameStateAction['type']])[] =>
  written.map(([roomId, action]) => [roomId, action.type] as const);

const roomWithId = (id: string): Room =>
  ({
    ...newRoom(undefined, { name: 'alice', online: true }),
    id,
  }) as const;
