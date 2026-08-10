import { type NegativeFiniteNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNegativeFinite = (x: number): x is NegativeFiniteNumber =>
  Number.isFinite(x) && x < 0;

const temperature = (celsius: NegativeFiniteNumber) => ({
  celsius,
  freezing: true,
});

// embed-sample-code-ignore-below
export { isNegativeFinite, temperature };
