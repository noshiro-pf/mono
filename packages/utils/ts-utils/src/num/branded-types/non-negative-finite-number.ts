const MIN_VALUE = 0;

export const isNonNegativeFiniteNumber = (
  a: number
): a is NonNegativeFiniteNumber => Number.isFinite(a) && a >= 0;

export const toNonNegativeFiniteNumber = (
  a: number
): NonNegativeFiniteNumber => {
  if (!isNonNegativeFiniteNumber(a)) {
    throw new TypeError(`Expected non-negative finite number, got: ${a}`);
  }
  return a;
};

const to = toNonNegativeFiniteNumber;

const clamp = (a: number): NonNegativeFiniteNumber =>
  to(Math.max(MIN_VALUE, a));

const _min = (
  ...values: readonly NonNegativeFiniteNumber[]
): NonNegativeFiniteNumber => clamp(Math.min(...values));

const _max = (
  ...values: readonly NonNegativeFiniteNumber[]
): NonNegativeFiniteNumber => clamp(Math.max(...values));

const pow = (
  x: NonNegativeFiniteNumber,
  y: NonNegativeFiniteNumber
): NonNegativeFiniteNumber => clamp(x ** y);

const add = (
  x: NonNegativeFiniteNumber,
  y: NonNegativeFiniteNumber
): NonNegativeFiniteNumber => clamp(x + y);

const sub = (
  x: NonNegativeFiniteNumber,
  y: NonNegativeFiniteNumber
): NonNegativeFiniteNumber => clamp(x - y);

const mul = (
  x: NonNegativeFiniteNumber,
  y: NonNegativeFiniteNumber
): NonNegativeFiniteNumber => clamp(x * y);

const div = (
  x: NonNegativeFiniteNumber,
  y: PositiveFiniteNumber
): NonNegativeFiniteNumber => clamp(x / y);

const random = (
  min: NonNegativeFiniteNumber,
  max: NonNegativeFiniteNumber
): NonNegativeFiniteNumber =>
  add(min, to((Math.max(max, min) - min + 1) * Math.random()));

const floor = (x: NonNegativeFiniteNumber): Uint => Math.floor(x);
const ceil = (x: NonNegativeFiniteNumber): Uint => Math.ceil(x);
const round = (x: NonNegativeFiniteNumber): Uint => Math.round(x);

export const NonNegativeNumber = {
  min: _min,
  max: _max,

  floor,
  ceil,
  round,
  random,

  /** @returns `a ** b`, but never less than 0 */
  pow,

  /** @returns `a + b`, but never less than 0 */
  add,

  /** @returns `a - b`, but never less than 0 */
  sub,

  /** @returns `a * b`, but never less than 0 */
  mul,

  /** @returns `a / b`, but never less than 0 */
  div,
} as const;
