import { type ValidNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isValidNumber = (x: number): x is ValidNumber => !Number.isNaN(x);

const process = (n: ValidNumber) => n * 2 + 1;

// embed-sample-code-ignore-below
export { isValidNumber, process };
