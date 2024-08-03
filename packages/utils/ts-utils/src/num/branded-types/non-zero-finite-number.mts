import { castType } from './utils.mjs';

export const isNonZeroFiniteNumber = (a: number): a is NonZeroFiniteNumber =>
  Number.isFinite(a) && a !== 0;

export const toNonZeroFiniteNumber = castType<NonZeroFiniteNumber>(
  isNonZeroFiniteNumber,
  'non-zero finite number',
);

const to = toNonZeroFiniteNumber;

const abs = (x: NonZeroFiniteNumber): PositiveFiniteNumber => to(Math.abs(x));

const _min = (...values: readonly NonZeroFiniteNumber[]): NonZeroFiniteNumber =>
  to(Math.min(...values));

const _max = (...values: readonly NonZeroFiniteNumber[]): NonZeroFiniteNumber =>
  to(Math.max(...values));

const pow = (
  x: NonZeroFiniteNumber,
  y: NonZeroFiniteNumber,
): NonZeroFiniteNumber => to(x ** y);

const add = (
  x: NonZeroFiniteNumber,
  y: NonZeroFiniteNumber,
): NonZeroFiniteNumber => to(x + y);

const sub = (
  x: NonZeroFiniteNumber,
  y: NonZeroFiniteNumber,
): NonZeroFiniteNumber => to(x - y);

const mul = (
  x: NonZeroFiniteNumber,
  y: NonZeroFiniteNumber,
): NonZeroFiniteNumber => to(x * y);

const div = (
  x: NonZeroFiniteNumber,
  y: NonZeroFiniteNumber,
): NonZeroFiniteNumber => Math.floor(to(x / y));

const random = (
  min: NonZeroFiniteNumber,
  max: NonZeroFiniteNumber,
): NonZeroFiniteNumber =>
  add(min, Math.floor(to((Math.max(max, min) - min + 1) * Math.random())));

const floor = (x: NonZeroFiniteNumber): Int => Math.floor(x);
const ceil = (x: NonZeroFiniteNumber): Int => Math.ceil(x);
const round = (x: NonZeroFiniteNumber): Int => Math.round(x);

export const NonZeroFiniteNumber = {
  abs,

  min: _min,
  max: _max,

  floor,
  ceil,
  round,
  random,

  /** @returns `a ** b` */
  pow,

  /** @returns `a + b` */
  add,

  /** @returns `a - b` */
  sub,

  /** @returns `a * b` */
  mul,

  /** @returns `a / b` */
  div,
} as const;
