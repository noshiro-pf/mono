import { type NaNType } from 'ts-type-forge';

// embed-sample-code-ignore-above

const checkNaN = (x: number): x is NaNType => Number.isNaN(x);

const value: number = Number.parseFloat('invalid');
if (checkNaN(value)) {
  const nan: NaNType = value;
  console.log(nan); // Handle NaN case specifically
}

// embed-sample-code-ignore-below
export { checkNaN, value };
