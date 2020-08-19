export const randInt = (min: number, max: number): number =>
  min + Math.floor((max - min + 1) * Math.random());
