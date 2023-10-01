const MIN_VALUE = Number.MIN_VALUE;

export const isPositiveFiniteNumber = (a: number): a is PositiveFiniteNumber =>
  Number.isFinite(a) && a > 0;

export const toPositiveFiniteNumber = (a: number): PositiveFiniteNumber => {
  if (!isPositiveFiniteNumber(a)) {
    throw new TypeError(`Expected positive finite number, got: ${a}`);
  }
  return a;
};

const to = toPositiveFiniteNumber;

const clamp = (a: number): PositiveFiniteNumber => to(Math.max(MIN_VALUE, a));

const _min = (
  ...values: readonly PositiveFiniteNumber[]
): PositiveFiniteNumber => clamp(Math.min(...values));

const _max = (
  ...values: readonly PositiveFiniteNumber[]
): PositiveFiniteNumber => clamp(Math.max(...values));

const pow = (
  x: PositiveFiniteNumber,
  y: PositiveFiniteNumber
): PositiveFiniteNumber => clamp(x ** y);

const add = (
  x: PositiveFiniteNumber,
  y: PositiveFiniteNumber
): PositiveFiniteNumber => clamp(x + y);

const sub = (
  x: PositiveFiniteNumber,
  y: PositiveFiniteNumber
): PositiveFiniteNumber => clamp(x - y);

const mul = (
  x: PositiveFiniteNumber,
  y: PositiveFiniteNumber
): PositiveFiniteNumber => clamp(x * y);

const div = (
  x: PositiveFiniteNumber,
  y: PositiveFiniteNumber
): PositiveFiniteNumber => clamp(x / y);

const random = (
  min: PositiveFiniteNumber,
  max: PositiveFiniteNumber
): PositiveFiniteNumber =>
  add(min, to((Math.max(max, min) - min + 1) * Math.random()));

const floor = (x: PositiveFiniteNumber): Uint => Math.floor(x);
const ceil = (x: PositiveFiniteNumber): PositiveInt => Math.ceil(x);
const round = (x: PositiveFiniteNumber): Uint => Math.round(x);

export const PositiveFiniteNumber = {
  min: _min,
  max: _max,

  floor,
  ceil,
  round,
  random,

  /** @returns `a ** b`, but greater than 0 */
  pow,

  /** @returns `a + b`, but greater than 0 */
  add,

  /** @returns `a - b`, but greater than 0 */
  sub,

  /** @returns `a * b`, but greater than 0 */
  mul,

  /** @returns `a / b`, but greater than 0 */
  div,
} as const;
