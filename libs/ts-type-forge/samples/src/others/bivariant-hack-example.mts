import { type BivariantHack } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Handler = (arg: { a: string }) => void;
type SpecificHandler = (arg: { a: string; b: number }) => void;

declare const specific: SpecificHandler;

// Normally this assignment is invalid, because function parameters are
// contravariant:
// const handler: Handler = specific;
// Type '(arg: { a: string; b: number; }) => void' is not assignable to
// type '(arg: { a: string; }) => void'.

// BivariantHack makes the parameter bivariant, so it is accepted:
const bivariantHandler: BivariantHack<Handler> = specific;

// embed-sample-code-ignore-below
export { bivariantHandler };
export type { Handler, SpecificHandler };
