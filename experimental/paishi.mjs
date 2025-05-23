// 11, 22, 33, 44, 66, 77, 東東, 北北
// 111, 222, 333, 北北北
// 123, 234, 345, 456, 567
// 12, 13, 23, 24, 34, 35, 45, 46, 56, 57, 67

/**
 *
 * @param {number} tileId
 * @returns {string}
 */
const tileIdsToStr = (sortedTileIds) => {
  const manzu = sortedTileIds.filter((id) => 0 <= id && id < 9);
  const pinzu = sortedTileIds.filter((id) => 9 <= id && id < 18);
  const souzu = sortedTileIds.filter((id) => 18 <= id && id < 27);
  const jihai = sortedTileIds.filter((id) => 28 <= id && id < 34);

  return Array.from(
    (function* () {
      if (manzu.length > 0) {
        for (const tileId of manzu) {
          yield `${tileId + 1}`;
        }
        yield 'm';
      }

      if (pinzu.length > 0) {
        for (const tileId of pinzu) {
          yield `${tileId - 9 + 1}`;
        }
        yield 'p';
      }

      if (souzu.length > 0) {
        for (const tileId of souzu) {
          yield `${tileId - 18 + 1}`;
        }
        yield 's';
      }

      for (const tileId of jihai) {
        switch (tileId) {
          case 28:
            yield '東';
            break;
          case 29:
            yield '南';
            break;
          case 30:
            yield '西';
            break;
          case 31:
            yield '北';
            break;
          case 32:
            yield '白';
            break;
          case 33:
            yield '發';
            break;
          case 34:
            yield '中';
            break;
        }
      }
    })(),
  ).join('');
};

// console.log(tileIdsToStr([0, 1, 2, 3, 4, 5, 6, 7, 8])); // "123456789m"
// console.log(tileIdsToStr([9, 10, 11, 12, 13, 14, 15, 16, 17])); // "123456789p"
// console.log(tileIdsToStr([18, 19, 20, 21, 22, 23, 24, 25, 26])); // "123456789s"
// console.log(tileIdsToStr([28, 29, 30, 31, 32, 33, 34])); // "東南西北白發中"
// console.log(tileIdsToStr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])); // "123456789m1p"
// console.log(tileIdsToStr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])); // "123456789m12p"

// AA, BBB, CCC, XX, 789s

const toTileId = (s) => (s === '北' ? 31 : 18 + Number(s) - 1);

// prettier-ignore
const mentsuCandidates = [
  "111", "222", "333", "北北北", "123", "234", "345", "456", "567"
].map(s => s.split("").map(toTileId))

// prettier-ignore
const headCandidates = [
  "11", "22", "33", "44", "66", "77", "北北"
].map(s => s.split("").map(toTileId));

// prettier-ignore
const unfinishedBlockCandidates = [
  "12", "13", "23", "24", "34", "35", "45", "46", "56", "57", "67"
].map(s => s.split("").map(toTileId));

const remaining = new Map([
  [toTileId('1'), 3], // 1 が残り3枚
  [toTileId('2'), 3],
  [toTileId('3'), 3],
  [toTileId('4'), 2],
  [toTileId('5'), 1],
  [toTileId('6'), 2],
  [toTileId('7'), 2],
  [toTileId('北'), 3],
]);

/**
 * @param {readonly number[]} paishi
 * @returns {boolean}
 */
const checkTileCountFeasibility = (paishi) => {
  for (const [value, maxCount] of remaining.entries()) {
    const count = paishi.reduce(
      (counter, tile) => (tile === value ? counter + 1 : counter),
      0,
    );

    if (count > maxCount) {
      return false;
    }
  }

  return true;
};

/**
 *
 * @param {readonly number[]} paishi
 * @returns {number[]}
 */
const toHand = (paishi) => {
  const arr = Array.from({ length: 34 }).fill(0);

  for (const tile of paishi) {
    arr[tile]++;
  }

  return arr;
};

// console.log(toHand('1112223777'.split('').map(toTileId)));
// [
//   0, 0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0, 0,
//   3, 3, 1, 0, 0, 0, 3, 0, 0,
//   0, 0, 0, 0, 0, 0, 0
// ]

// https://qiita.com/tomohxx/items/20d886d1991ab89f5522

const isChinnitsuMentsuDecomposable = (hand) => {
  let r = hand[0];
  let a = hand[0];
  let b = hand[1];

  for (let i = 0; i < 7; i++) {
    if (((r = a % 3), b >= r && hand[i + 2] >= r)) {
      a = b - r;
      b = hand[i + 2] - r;
    } else {
      return false;
    }
  }

  return a % 3 == 0 && b % 3 == 0;
};

// console.log(isChinnitsuMentsuDecomposable([0, 0, 0, 0, 0, 0, 0, 0, 0])); // true
// console.log(isChinnitsuMentsuDecomposable([0, 0, 0, 0, 0, 0, 0, 1, 1])); // false
// console.log(isChinnitsuMentsuDecomposable([0, 0, 0, 0, 0, 0, 1, 1, 1])); // true
// console.log(isChinnitsuMentsuDecomposable([0, 0, 0, 0, 1, 1, 1, 0, 0])); // true
// console.log(isChinnitsuMentsuDecomposable([1, 2, 2, 1, 0, 3, 0, 0, 0])); // true

const isChinnitsuDecomposable = (hand) => {
  let p = 0;

  for (let i = 0; i < 9; i++) {
    p += i * hand[i];
  }

  for (let i = (p * 2) % 3; i < 9; i += 3) {
    //ここでiを、牌の和を3で割った余りを2で割った数に初期化
    hand[i] -= 2;

    if (hand[i] >= 0) {
      if (isChinnitsuMentsuDecomposable(hand)) {
        hand[i] += 2;
        return true;
      }
    }
    hand[i] += 2;
  }
  return false;
};

// console.log(isChinnitsuDecomposable([0, 0, 0, 0, 0, 0, 0, 0, 0])); // false
// console.log(isChinnitsuDecomposable([0, 0, 0, 0, 0, 0, 0, 1, 1])); // false
// console.log(isChinnitsuDecomposable([0, 0, 0, 0, 2, 0, 1, 1, 1])); // true

/**
 *
 * @param {readonly number[]} arr
 * @param {number} start
 * @param {number} end
 * @returns {number}
 */
const sum = (arr, start, end) =>
  arr.slice(start, end).reduce((acc, val) => acc + val, 0);

/**
 * 和了形かどうかを判定する
 * @param {number[]} hand （0-8:マンズ1-9, 9-17:ピンズ1-9, 18-27:ソーズ1-9, 28-33:東南西北白発中）
 * @returns {boolean}
 */
const isWinHand = (hand) => {
  let head = undefined;

  for (let i = 0; i < 3; i++) {
    switch (sum(hand, 9 * i, 9 * i + 9) % 3) {
      case 1:
        return false;
      case 2:
        if (head === undefined) {
          head = i;
        } else {
          return false;
        }
    }
  }
  for (let i = 27; i < 34; i++) {
    switch (hand[i] % 3) {
      case 1:
        return false;
      case 2:
        if (head === undefined) {
          head = i;
        } else {
          return false;
        }
    }
  }
  for (let i = 0; i < 3; i++) {
    if (i === head) {
      if (!isChinnitsuDecomposable(hand.slice(9 * i))) return false;
    } else {
      if (!isChinnitsuMentsuDecomposable(hand.slice(9 * i))) return false;
    }
  }
  return true;
};

// console.log(isWinHand(toHand('00011122233'.split('').map(Number)))); // true
// console.log(isWinHand(toHand('00112223334'.split('').map(Number)))); // true

// const isTempai = (hand) => {
//   for (let i = 0; i < 34; i++) {
//     if (hand[i] < 4) {
//       hand[i] += 1;
//       if (isWinHand(hand)) {
//         hand[i] -= 1;
//         return true;
//       }
//       hand[i] -= 1;
//     }
//   }
//   return false;
// };

// console.log(isTempai(toHand('0001112223'.split('').map(Number)))); // true
// console.log(isTempai(toHand('0011223334'.split('').map(Number)))); // true
// console.log(isTempai(toHand('00112233344'.split('').map(Number)))); // false

/**
 * @param {number[]} tempaiHand
 * @returns {ReadonlySet<number>}
 */
const waitingTiles = (tempaiHand) => {
  const waiting = new Set();

  for (let i = 0; i < 34; i++) {
    if (tempaiHand[i] < 4) {
      tempaiHand[i] += 1;
      if (isWinHand(tempaiHand)) {
        waiting.add(i);
      }
      tempaiHand[i] -= 1;
    }
  }

  return waiting;
};

// console.log(waitingTiles(toHand('0001112223'.split('').map(Number)))); // Set(4) { 0, 1, 2, 3 }
// console.log(waitingTiles(toHand('0011223334'.split('').map(Number)))); // Set(2) { 1, 4 }

const dupCheck = new Set();

const paishiCandidates = Array.from(
  (function* () {
    for (const janto of headCandidates) {
      for (const mentsu1 of mentsuCandidates) {
        for (const mentsu2 of mentsuCandidates) {
          for (const waiting of unfinishedBlockCandidates) {
            const paishi = [...janto, ...mentsu1, ...mentsu2, ...waiting];

            if (checkTileCountFeasibility(paishi)) {
              const sorted = paishi.toSorted();

              const str = tileIdsToStr(sorted);

              if (!dupCheck.has(str)) {
                dupCheck.add(str);

                yield {
                  array: sorted,
                  str,
                  waitingTiles: waitingTiles(toHand(sorted)),
                };
              }
            }
          }
        }
      }
    }
  })(),
).toSorted((a, b) => a.str.localeCompare(b.str));

for (const paishi of paishiCandidates) {
  console.log(paishi.str, tileIdsToStr(Array.from(paishi.waitingTiles)));
}

const furitenCandidates = paishiCandidates.filter((paishi) =>
  paishi.waitingTiles.has(toTileId('2')),
);

const dealInCandidates = furitenCandidates.filter((paishi) =>
  paishi.waitingTiles.has(toTileId('3')),
);

console.log('numCandidates', paishiCandidates.length);
console.log('numFuriten', furitenCandidates.length);
console.log(
  'numNotFuriten',
  paishiCandidates.length - furitenCandidates.length,
);
console.log('numDealIn', dealInCandidates.length);
