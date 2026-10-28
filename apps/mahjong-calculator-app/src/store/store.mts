/**
 * 計算機の状態を、ブラウザを周囲として 1 つだけ作る。
 *
 * 状態が何をするかとそのテストは `calculator-store.mts` にある。このファイルは
 * それに何を渡すかだけを書く。
 */

import { getShuffled } from 'ts-utils-additional';
import { createCalculatorStore } from './calculator-store.mjs';

export const calculatorStore = createCalculatorStore({
  shuffle: getShuffled,
});
