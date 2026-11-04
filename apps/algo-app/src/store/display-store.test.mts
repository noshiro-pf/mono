import { Timestamp } from 'firebase/firestore';
import { createState } from 'synstate';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import type { Rect } from 'ts-utils-additional';
import { newRoom } from '../functions/index.mjs';
import { initialGameState } from '../state/index.mjs';
import {
  toShuffleDef,
  type Card,
  type CardColor,
  type GameState,
  type NWES,
  type PlayerWithId,
  type Room,
} from '../types/index.mjs';
import { createDisplayStore, type DisplayStore } from './display-store.mjs';

describe(createDisplayStore, () => {
  test('finds the seat of this player by id', () => {
    const { store, setRoom, setPlayers, setMyPlayerId } = setup();

    assert.isUndefined(store.myPlayerIndex.getSnapshot().value);

    setRoom(roomWith('0123'));

    setPlayers(playersNamed(['alice', 'bob']));

    assert.isUndefined(store.myPlayerIndex.getSnapshot().value);

    setMyPlayerId('bob');

    assert.strictEqual(store.myPlayerIndex.getSnapshot().value, 1);
  });

  test('seats the players as the room shuffles them', () => {
    const { store, setRoom, setPlayers, setMyPlayerId } = setup();

    setPlayers(playersNamed(['alice', 'bob', 'carol', 'dave']));

    setMyPlayerId('alice');

    setRoom(roomWith('3102'));

    assert.strictEqual(store.myPlayerIndex.getSnapshot().value, 2);

    assert.deepStrictEqual(
      store.displayValues.getSnapshot().value.playerNames,
      { S: 'alice', W: 'carol', N: 'dave', E: 'bob' },
    );
  });

  test('hides the cards and waits for four players before the game starts', () => {
    const { store, setRoom, setPlayers } = setup();

    setRoom(roomWith('0123'));

    setPlayers(playersNamed(['alice', 'bob', 'carol']));

    assert.isTrue(store.displayValues.getSnapshot().value.cardsAreHidden);

    assert.strictEqual(
      store.displayValues.getSnapshot().value.startGameButtonState,
      'disabled',
    );

    setPlayers(playersNamed(['alice', 'bob', 'carol', 'dave']));

    assert.strictEqual(
      store.displayValues.getSnapshot().value.startGameButtonState,
      'shown',
    );

    setRoom({ ...roomWith('0123'), state: 'playing' });

    assert.isFalse(store.displayValues.getSnapshot().value.cardsAreHidden);

    assert.strictEqual(
      store.displayValues.getSnapshot().value.startGameButtonState,
      'hidden',
    );
  });

  test('highlights the name of the player whose turn it is, once the names are placed', () => {
    const { store, setPlayerNamePositions } = setup();

    assert.isUndefined(store.turnPlayerHighlighterPosition.getSnapshot().value);

    const positions = namePositions();

    setPlayerNamePositions(positions);

    assert.strictEqual(
      store.turnPlayerHighlighterPosition.getSnapshot().value,
      positions[store.displayValues.getSnapshot().value.turnPlayer],
    );
  });

  test('opens the toss balloon at the chosen card only on this player’s turn', () => {
    const {
      store,
      setRoom,
      setPlayers,
      setMyPlayerId,
      setGameState,
      setCardPositions,
      calls,
    } = setup();

    const positions = cardPositions();

    setCardPositions(positions);

    setGameState({
      ...initialGameState,
      currentPlayerIndex: 1,
      confirmTossBalloonIsOpen: true,
      cardChosenToToss: black6,
    });

    setRoom(roomWith('0123'));

    setPlayers(playersNamed(['alice', 'bob']));

    setMyPlayerId('alice');

    assert.isUndefined(store.confirmTossBalloonProps.getSnapshot().value);

    setMyPlayerId('bob');

    const props = store.confirmTossBalloonProps.getSnapshot().value;

    assert.isDefined(props);

    assert.strictEqual(props.anchorCardRect, positions.black[6]);

    assert.deepStrictEqual(props.card, black6);

    props.cancel();

    props.submit();

    assert.deepStrictEqual(calls, ['onTossCancel', 'onTossSubmit']);
  });

  test('draws no balloon before the cards are placed', () => {
    const { store, setRoom, setPlayers, setMyPlayerId, setGameState } = setup();

    setGameState({
      ...initialGameState,
      currentPlayerIndex: 0,
      confirmTossBalloonIsOpen: true,
      cardChosenToToss: black6,
    });

    setRoom(roomWith('0123'));

    setPlayers(playersNamed(['alice']));

    setMyPlayerId('alice');

    assert.isUndefined(store.confirmTossBalloonProps.getSnapshot().value);

    assert.isUndefined(store.selectAnswerBalloonProps.getSnapshot().value);

    assert.isUndefined(store.decidedAnswerBalloonProps.getSnapshot().value);
  });
});

type CardPositions = ReadonlyRecord<CardColor, FixedLengthTuple<12, Rect>>;

type Setup = Readonly<{
  store: DisplayStore;
  setRoom: (room: Room | undefined) => void;
  setPlayers: (players: readonly PlayerWithId[]) => void;
  setMyPlayerId: (playerId: string | undefined) => void;
  setGameState: (gameState: GameState) => void;
  setCardPositions: (positions: CardPositions) => void;
  setPlayerNamePositions: (positions: ReadonlyRecord<NWES, Rect>) => void;
  /** The game actions called, by name. */
  calls: readonly string[];
}>;

const setup = (): Setup => {
  const [room, setRoom] = createState<Room | undefined>(undefined);

  const [players, setPlayers] = createState<readonly PlayerWithId[]>([]);

  const [myPlayerId, setMyPlayerId] = createState<string | undefined>(
    undefined,
  );

  const [gameState, setGameState] = createState<GameState>(initialGameState);

  const [cardPositionsState, setCardPositions] = createState<
    CardPositions | undefined
  >(undefined);

  const [playerNamePositions, setPlayerNamePositions] = createState<
    ReadonlyRecord<NWES, Rect> | undefined
  >(undefined);

  const mut_calls: string[] = [];

  const record = (callName: string) => (): void => {
    mut_calls.push(callName);
  };

  const store = createDisplayStore({
    room,
    players,
    myPlayerId,
    gameState,
    onCardClick: record('onCardClick'),
    onTossCancel: record('onTossCancel'),
    onTossSubmit: record('onTossSubmit'),
    onSelectAnswer: record('onSelectAnswer'),
    onAnswerCancel: record('onAnswerCancel'),
    onAnswerSubmit: record('onAnswerSubmit'),
    cardPositions: cardPositionsState,
    playerNamePositions,
  });

  return {
    store,
    setRoom,
    setPlayers,
    setMyPlayerId,
    setGameState,
    setCardPositions,
    setPlayerNamePositions,
    calls: mut_calls,
  } as const;
};

const black6: Card = { color: 'black', number: 6 } as const;

const roomWith = (shuffleDef: string): Room =>
  ({
    ...newRoom(undefined),
    id: 'a',
    shuffleDef: toShuffleDef(shuffleDef),
  }) as const;

/** Players who joined in this order, each with their name as their id. */
const playersNamed = (names: readonly string[]): readonly PlayerWithId[] =>
  names.map(
    (name) =>
      ({
        id: name,
        name,
        online: true,
        createdAt: Timestamp.fromMillis(0),
      }) as const,
  );

const rect = (x: number, y: number): Rect =>
  ({
    left: x,
    top: y,
    width: 10,
    height: 10,
  }) as const;

const cardPositions = (): CardPositions =>
  ({
    black: [
      rect(0, 0),
      rect(1, 0),
      rect(2, 0),
      rect(3, 0),
      rect(4, 0),
      rect(5, 0),
      rect(6, 0),
      rect(7, 0),
      rect(8, 0),
      rect(9, 0),
      rect(10, 0),
      rect(11, 0),
    ],
    white: [
      rect(0, 1),
      rect(1, 1),
      rect(2, 1),
      rect(3, 1),
      rect(4, 1),
      rect(5, 1),
      rect(6, 1),
      rect(7, 1),
      rect(8, 1),
      rect(9, 1),
      rect(10, 1),
      rect(11, 1),
    ],
  }) as const;

const namePositions = (): ReadonlyRecord<NWES, Rect> =>
  ({
    N: rect(0, 0),
    W: rect(1, 0),
    E: rect(2, 0),
    S: rect(3, 0),
  }) as const;
