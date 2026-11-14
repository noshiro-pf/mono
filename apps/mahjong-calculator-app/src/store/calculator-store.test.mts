import { Optional, Result } from 'ts-data-forge';
import type { TileName } from '../types/index.mjs';
import {
  createCalculatorStore,
  type CalculatorStore,
} from './calculator-store.mjs';

describe(createCalculatorStore, () => {
  test('starts with the default settings and an empty hand', () => {
    const { store } = setup();

    assert.strictEqual(Optional.unwrap(store.bakaze.getSnapshot()), 'Ton');

    assert.strictEqual(Optional.unwrap(store.jikaze.getSnapshot()), 'Ton');

    assert.strictEqual(
      Optional.unwrap(store.tehaiType.getSnapshot()),
      'normal',
    );

    assert.strictEqual(Optional.unwrap(store.turn.getSnapshot()), 3);

    assert.strictEqual(
      Optional.unwrap(store.maximizeTarget.getSnapshot()),
      'exp',
    );

    assert.deepStrictEqual(
      Optional.unwrap(store.doraIndicators.getSnapshot()),
      ['Ton'],
    );

    assert.deepStrictEqual(Optional.unwrap(store.hand.getSnapshot()), []);

    assert.deepStrictEqual(
      Optional.unwrap(store.revealedBlocks.getSnapshot()),
      [],
    );

    assert.isUndefined(Optional.unwrap(store.result.getSnapshot()));

    assert.isFalse(Optional.unwrap(store.isCalculating.getSnapshot()));
  });

  test('two stores do not share their state', () => {
    const { store: first } = setup();

    const { store: second } = setup();

    first.setBakaze('Nan');

    first.addTile2Hand('Manzu1');

    assert.strictEqual(Optional.unwrap(second.bakaze.getSnapshot()), 'Ton');

    assert.deepStrictEqual(Optional.unwrap(second.hand.getSnapshot()), []);
  });

  test('removes only the first of the same tiles from the hand', () => {
    const { store } = setup();

    store.addTile2Hand('Pinzu2');

    store.addTile2Hand('Manzu1');

    store.addTile2Hand('Pinzu2');

    store.removeTileFromHand('Pinzu2');

    assert.deepStrictEqual(Optional.unwrap(store.hand.getSnapshot()), [
      'Manzu1',
      'Pinzu2',
    ]);

    store.removeTileFromHand('Chun');

    assert.deepStrictEqual(Optional.unwrap(store.hand.getSnapshot()), [
      'Manzu1',
      'Pinzu2',
    ]);
  });

  test('sorts the hand in tile order', () => {
    const { store } = setup();

    store.setHand(['Chun', 'Sozu1', 'Manzu9', 'Pinzu5', 'Manzu1']);

    assert.deepStrictEqual(Optional.unwrap(store.handSorted.getSnapshot()), [
      'Manzu1',
      'Manzu9',
      'Pinzu5',
      'Sozu1',
      'Chun',
    ]);
  });

  test('adds and removes revealed blocks and dora indicators', () => {
    const { store } = setup();

    store.addRevealedBlock('Kotsu-Pinzu1');

    store.addRevealedBlock('Ankantsu-Sozu1');

    store.removeRevealedBlock('Kotsu-Pinzu1');

    assert.deepStrictEqual(
      Optional.unwrap(store.revealedBlocks.getSnapshot()),
      ['Ankantsu-Sozu1'],
    );

    store.addDora('Haku');

    store.addDora('Manzu3');

    store.removeDora(1);

    assert.deepStrictEqual(
      Optional.unwrap(store.doraIndicators.getSnapshot()),
      ['Ton', 'Manzu3'],
    );

    assert.strictEqual(Optional.unwrap(store.numDoraTiles.getSnapshot()), 2);
  });

  test('counts a revealed block as three tiles of the hand', () => {
    const { store } = setup();

    store.setHand(['Manzu1', 'Manzu2', 'Manzu3', 'Haku']);

    store.addRevealedBlock('Kotsu-Pinzu1');

    store.addRevealedBlock('Ankantsu-Sozu1');

    assert.strictEqual(Optional.unwrap(store.numHandTiles.getSnapshot()), 10);
  });

  test('leaves out the dora indicators, the hand and the revealed blocks from the remaining tiles', () => {
    const { store } = setup();

    store.setHand(['Ton', 'Manzu5', 'AkaManzu5']);

    store.addRevealedBlock('Kotsu-Pinzu1');

    store.addRevealedBlock('Ankantsu-Sozu1');

    const remaining = Optional.unwrap(store.numRemainingTiles.getSnapshot());

    // One `Ton` is the dora indicator and one is in the hand.
    assert.strictEqual(remaining.Ton, 2);

    assert.strictEqual(remaining.Manzu5, 2);

    assert.strictEqual(remaining.AkaManzu5, 0);

    assert.strictEqual(remaining.Pinzu1, 1);

    assert.strictEqual(remaining.Sozu1, 0);

    assert.strictEqual(remaining.Chun, 4);
  });

  test('writes the hand as a Tenho URL and as the ツモアガリ確率計算機 string', () => {
    const { store } = setup();

    store.setHand(['Pinzu2', 'Manzu1', 'Pinzu2']);

    assert.strictEqual(
      Optional.unwrap(store.tenhoURL.getSnapshot()),
      'https://tenhou.net/2/?q=1m22p',
    );

    assert.strictEqual(
      Optional.unwrap(store.tsumoProbStr.getSnapshot()),
      '1m,2p,2p',
    );
  });

  test('clearHand empties the hand, the revealed blocks and the result, and keeps the settings', () => {
    const { store } = setup();

    store.setBakaze('Nan');

    store.addTile2Hand('Manzu1');

    store.addRevealedBlock('Kotsu-Pinzu1');

    store.setResult(Result.ok(null));

    store.clearHand();

    assert.deepStrictEqual(Optional.unwrap(store.hand.getSnapshot()), []);

    assert.deepStrictEqual(
      Optional.unwrap(store.revealedBlocks.getSnapshot()),
      [],
    );

    assert.isUndefined(Optional.unwrap(store.result.getSnapshot()));

    assert.strictEqual(Optional.unwrap(store.bakaze.getSnapshot()), 'Nan');
  });

  test('resetAll puts every setting back', () => {
    const { store } = setup();

    store.setBakaze('Nan');

    store.setJikaze('Pei');

    store.setTehaiType('Kokushi');

    store.setTurn(10);

    store.setMaximizeTarget('winProb');

    store.setFlagOptions({
      akahaiTsumo: false,
      doubleReach: false,
      haitei: false,
      ippatsu: false,
      shantenModoshi: false,
      tegawari: false,
      uradora: false,
    });

    store.addDora('Haku');

    store.addTile2Hand('Manzu1');

    store.addRevealedBlock('Kotsu-Pinzu1');

    store.setResult(Result.ok(null));

    store.resetAll();

    assert.strictEqual(Optional.unwrap(store.bakaze.getSnapshot()), 'Ton');

    assert.strictEqual(Optional.unwrap(store.jikaze.getSnapshot()), 'Ton');

    assert.strictEqual(
      Optional.unwrap(store.tehaiType.getSnapshot()),
      'normal',
    );

    assert.strictEqual(Optional.unwrap(store.turn.getSnapshot()), 3);

    assert.strictEqual(
      Optional.unwrap(store.maximizeTarget.getSnapshot()),
      'exp',
    );

    assert.isTrue(Optional.unwrap(store.flagOptions.getSnapshot()).uradora);

    assert.deepStrictEqual(
      Optional.unwrap(store.doraIndicators.getSnapshot()),
      ['Ton'],
    );

    assert.deepStrictEqual(Optional.unwrap(store.hand.getSnapshot()), []);

    assert.deepStrictEqual(
      Optional.unwrap(store.revealedBlocks.getSnapshot()),
      [],
    );

    assert.isUndefined(Optional.unwrap(store.result.getSnapshot()));
  });

  test('setRandomHand takes 14 tiles from the shuffled wall without the dora indicators', () => {
    const { store, shuffled } = setup();

    store.addDora('Manzu1');

    store.addRevealedBlock('Kotsu-Pinzu1');

    store.setResult(Result.ok(null));

    store.setRandomHand();

    const [wall] = shuffled;

    assert.isDefined(wall);

    assert.strictEqual(wall.length, 136 - 2);

    assert.strictEqual(wall.filter((tile) => tile === 'Ton').length, 3);

    assert.strictEqual(wall.filter((tile) => tile === 'Manzu1').length, 3);

    // `shuffle` keeps the order here, so the hand is the head of the wall.
    assert.deepStrictEqual(Optional.unwrap(store.hand.getSnapshot()), [
      'Manzu1',
      'Manzu1',
      'Manzu1',
      'Manzu2',
      'Manzu2',
      'Manzu2',
      'Manzu2',
      'Manzu3',
      'Manzu3',
      'Manzu3',
      'Manzu3',
      'Manzu4',
      'Manzu4',
      'Manzu4',
    ]);

    assert.deepStrictEqual(
      Optional.unwrap(store.revealedBlocks.getSnapshot()),
      [],
    );

    assert.isUndefined(Optional.unwrap(store.result.getSnapshot()));
  });

  test('setRandomHand takes the hand in the order the shuffle returns', () => {
    const { store } = setup((tiles) => tiles.toReversed());

    store.setRandomHand();

    assert.deepStrictEqual(Optional.unwrap(store.hand.getSnapshot()), [
      'Chun',
      'Chun',
      'Chun',
      'Chun',
      'Hatsu',
      'Hatsu',
      'Hatsu',
      'Hatsu',
      'Haku',
      'Haku',
      'Haku',
      'Haku',
      'Pei',
      'Pei',
    ]);
  });
});

type Setup = Readonly<{
  store: CalculatorStore;
  /** Every wall handed to `shuffle`, in order. */
  shuffled: readonly (readonly TileName[])[];
}>;

const setup = (
  shuffle: (tiles: readonly TileName[]) => readonly TileName[] = (tiles) =>
    tiles,
): Setup => {
  const mut_shuffled: (readonly TileName[])[] = [];

  const store = createCalculatorStore({
    shuffle: (tiles) => {
      mut_shuffled.push(tiles.slice());

      return shuffle(tiles);
    },
  });

  return { store, shuffled: mut_shuffled } as const;
};
