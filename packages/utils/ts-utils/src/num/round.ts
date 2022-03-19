import { roundToInt } from './round-to-int';

export const round = (digit: number): ((x: number) => number) => {
  const powAmount = 10 ** digit;

  return (target: number) => roundToInt(powAmount * target) / powAmount;
};
