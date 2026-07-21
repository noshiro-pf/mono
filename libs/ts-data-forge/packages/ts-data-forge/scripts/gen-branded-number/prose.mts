import { type BrandedNumberConfig } from './config.mjs';

export type ParamDoc = Readonly<{ name: string; desc: string }>;

export type MethodProse = Readonly<{
  description: string;
  hasExample: boolean;
  params: readonly ParamDoc[];
  returns: string | undefined;
  throws?: string;
  see?: string;
}>;

/** Produces the JSDoc prose for a given member key (or a top-level/namespace slot). */
export const methodProse = (
  key: string,
  config: BrandedNumberConfig,
): MethodProse => {
  const t = config.pascalName;

  const tn = config.typeNameInMessage;

  const nounPl = `${nounOf(config)}s` as const;

  const aT = `${indefinite(t)} \`${t}\`` as const;

  const isFloor = config.division === 'floor';

  switch (key) {
    case 'topGuard':
      return {
        description: `${guardSentence(tn)}\n\n${guardDetail(config)}`,
        hasExample: true,
        params: [{ name: 'value', desc: 'The value to check' }],
        returns: guardReturns(tn),
      };

    case 'topCast':
      return {
        description: `Casts a \`number\` to the \`${t}\` branded type.\n\nValidates that the value is ${tn} and returns it with the \`${t}\` brand. Throws a \`TypeError\` otherwise.`,
        hasExample: true,
        params: [{ name: 'value', desc: 'The value to cast' }],
        returns: `The value as ${aT}`,
        // Single-quoted first segment avoids `{TypeError}` reading as a broken
        // `${}` interpolation (unicorn/no-incorrect-template-string-interpolation).
        throws: ['{TypeError} If the value is not', tn].join(' '),
      };

    case 'namespace':
      return {
        description: namespaceDescription(config),
        hasExample: false,
        params: [],
        returns: undefined,
      };

    case 'is':
      return {
        description: guardSentence(tn),
        hasExample: true,
        params: [{ name: 'value', desc: 'The value to check' }],
        returns: guardReturns(tn),
        see: `{@link is${t}} for usage examples`,
      };

    case 'MIN_VALUE':
      return constProse(`The smallest value representable as \`${t}\`.`);

    case 'MAX_VALUE':
      return constProse(`The largest value representable as \`${t}\`.`);

    case 'abs':
      return {
        description: `Returns the absolute value of ${tn}.\n\nThe result is non-negative and keeps the \`${t}\` brand.${config.precision === 'may-lose' ? ' Note that `Math.abs(Number.MIN_SAFE_INTEGER)` exceeds `Number.MAX_SAFE_INTEGER`, so use `SafeInt` for guaranteed precision.' : ''}`,
        hasExample: true,
        params: [{ name: 'a', desc: `The ${nounOf(config)} value` }],
        returns: `The absolute value as a non-negative \`${t}\``,
      };

    case 'min':
      return {
        description: `Returns the smallest of the given ${nounPl}.`,
        hasExample: true,
        params: [
          {
            name: 'values',
            desc: `The ${nounPl} to compare (at least one required)`,
          },
        ],
        returns: `The smallest value as ${aT}`,
      };

    case 'max':
      return {
        description: `Returns the largest of the given ${nounPl}.`,
        hasExample: true,
        params: [
          {
            name: 'values',
            desc: `The ${nounPl} to compare (at least one required)`,
          },
        ],
        returns: `The largest value as ${aT}`,
      };

    case 'clamp':
      return {
        description: isFloor
          ? `Clamps a \`number\` into the \`${t}\` range, rounding to the nearest integer and constraining the result to \`[MIN_VALUE, MAX_VALUE]\`.`
          : `Clamps a \`number\` into the \`${t}\` range \`[MIN_VALUE, MAX_VALUE]\`.`,
        hasExample: true,
        params: [{ name: 'value', desc: 'The value to clamp' }],
        returns: `The clamped value as ${aT}`,
      };

    case 'random':
      return {
        description: `Generates a random \`${t}\` within the given range.\n\nThe range is inclusive on both ends.`,
        hasExample: true,
        params: [
          { name: 'min', desc: 'The minimum value (inclusive)' },
          { name: 'max', desc: 'The maximum value (inclusive)' },
        ],
        returns: `A random \`${t}\` in \`[min, max]\``,
      };

    case 'pow':
      return {
        description: `Raises \`a\` to the power \`b\`, returning \`a ** b\` as ${aT}${isFloor ? ' (floored to an integer)' : ''}.`,
        hasExample: true,
        params: [
          { name: 'a', desc: `The base ${nounOf(config)}` },
          { name: 'b', desc: `The exponent ${nounOf(config)}` },
        ],
        returns: `\`a ** b\` as ${aT}`,
      };

    case 'add':
      return binOp('Adds', '+', 'sum', config);

    case 'sub':
      return binOp('Subtracts', '-', 'difference', config);

    case 'mul':
      return binOp('Multiplies', '*', 'product', config);

    case 'div':
      return {
        description: isFloor
          ? `Divides two ${nounPl} using floor division (\`⌊a / b⌋\`): the result is \`a / b\` rounded toward negative infinity, as ${aT}.`
          : `Divides two ${nounPl}, returning \`a / b\` as ${aT}.`,
        hasExample: true,
        params: [
          { name: 'a', desc: 'The dividend' },
          { name: 'b', desc: 'The divisor (must be non-zero)' },
        ],
        returns: isFloor
          ? `The floored quotient as ${aT}`
          : `\`a / b\` as ${aT}`,
      };

    case 'floor':
      return roundingOp(
        'floor',
        `Returns the greatest integer less than or equal to ${tn}.`,
        config,
      );

    case 'ceil':
      return roundingOp(
        'ceil',
        `Returns the smallest integer greater than or equal to ${tn}.`,
        config,
      );

    case 'round':
      return roundingOp(
        'round',
        `Returns the value of ${tn} rounded to the nearest integer.`,
        config,
      );

    default:
      return constProse(`TODO(${key})`);
  }
};

const binOp = (
  verb: string,
  op: string,
  phrase: string,
  config: BrandedNumberConfig,
): MethodProse => {
  const t = config.pascalName;

  const aT = `${indefinite(t)} \`${t}\`` as const;

  return {
    description: `${verb} two ${nounOf(config)}s, returning \`a ${op} b\` as ${aT}.`,
    hasExample: true,
    params: [
      { name: 'a', desc: `The first ${nounOf(config)}` },
      { name: 'b', desc: `The second ${nounOf(config)}` },
    ],
    returns: `The ${phrase} of \`a\` and \`b\` as ${aT}`,
  };
};

const roundingOp = (
  name: string,
  description: string,
  config: BrandedNumberConfig,
): MethodProse =>
  ({
    description,
    hasExample: true,
    params: [{ name: 'a', desc: `The ${nounOf(config)} value` }],
    returns: `${capitalize(name === 'round' ? 'the rounded' : `the ${name}ed`)} value as an integer`,
  }) as const;

const constProse = (description: string): MethodProse =>
  ({
    description,
    hasExample: false,
    params: [],
    returns: undefined,
  }) as const;

const guardSentence = (tn: string): string =>
  `Type guard that checks if a value is ${tn}.` as const;

const guardReturns = (tn: string): string =>
  `\`true\` if the value is ${tn}, \`false\` otherwise` as const;

const guardDetail = (config: BrandedNumberConfig): string =>
  config.division === 'floor'
    ? (`Returns \`true\` for ${config.typeNameInMessage} — a value with no fractional component${config.precision === 'may-lose' ? ', including values outside the safe integer range (unlike `SafeInt`)' : ''}.` as const)
    : 'Returns `true` only for a finite value — never `NaN`, `Infinity`, or `-Infinity`.';

const namespaceDescription = (config: BrandedNumberConfig): string => {
  const divisionNote =
    config.division === 'floor' ? ' Division (`div`) uses floor division.' : '';

  const precisionNote =
    config.precision === 'may-lose'
      ? (`\n\nUnlike \`SafeInt\`, \`${config.pascalName}\` allows values outside the safe integer range (±2^53 − 1), so very large magnitudes may lose precision in JavaScript's \`number\` type.` as const)
      : '';

  return `Namespace providing type-safe operations for the \`${config.pascalName}\` branded type.\n\nThe \`${config.pascalName}\` type represents ${config.typeNameInMessage}.${divisionNote}${precisionNote}`;
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

const indefinite = (word: string): string =>
  VOWELS.has(word.slice(0, 1).toLowerCase()) ? 'an' : 'a';

const capitalize = (word: string): string =>
  `${word.slice(0, 1).toUpperCase()}${word.slice(1)}` as const;

/**
 * Derives the bare noun from `typeNameInMessage` by dropping the leading article
 * and any trailing range clause, e.g. `'a positive integer in [1, 2^15)'` →
 * `'positive integer'`.
 */
const nounOf = (config: BrandedNumberConfig): string =>
  config.typeNameInMessage
    .replace(/^an? /u, '')
    .replace(/ (?:in|less than) .*$/u, '');
